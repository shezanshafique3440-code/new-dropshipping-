import type { Prisma, PrismaClient } from "@prisma/client";

import type { OrderPaymentStatus, OrderStatus } from "@/types";

import { getPrismaClient } from "../../db/client";
import {
  orderWithItems,
  toDomainOrder,
  OrderStorageError,
} from "../../orders/prisma-repository";
import { isOrderReference } from "../../orders/reference";
import type { OrderPage } from "../../orders/repository";
import type {
  AdminOrderCounts,
  AdminOrderPageQuery,
  AdminOrderRecord,
  AdminOrderRepository,
  ApplyStatusInput,
  ApplyStatusResult,
  SettledTotal,
} from "./repository";

/**
 * PostgreSQL storage for the operations panel.
 *
 * Filtering, searching, ordering, paging and counting all happen in the
 * database. The panel never reads more than one page of orders, and the
 * dashboard never reads orders at all — it reads two aggregates.
 *
 * The status change is the interesting one: it is a compare-and-set inside a
 * transaction, so two operators cancelling the same order at the same moment
 * produce one status change and one history row, not two of each.
 */

/** Hard ceiling on a page, whatever a caller asks for. */
const MAX_PAGE_SIZE = 50;

/** Longest search term accepted; longer input is truncated, never rejected. */
const MAX_SEARCH_LENGTH = 254;

const ALL_STATUSES: readonly OrderStatus[] = ["pending", "paid", "cancelled", "failed"];
const ALL_PAYMENT_STATUSES: readonly OrderPaymentStatus[] = [
  "unpaid",
  "paid",
  "failed",
  "refunded",
];

const historyWithAdmin = {
  orderBy: { createdAt: "desc" },
  select: {
    createdAt: true,
    fromStatus: true,
    toStatus: true,
    changedByAdmin: { select: { name: true } },
  },
} as const;

export class PrismaAdminOrderRepository implements AdminOrderRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient = getPrismaClient()) {
    this.prisma = prisma;
  }

  /**
   * One page of orders, newest first.
   *
   * Keyset pagination on (createdAt DESC, reference DESC) — the same ordering
   * the order-history pages use, and the same reasoning: the reference is
   * unique, so the ordering is total and a page cannot repeat or skip a row
   * when two orders share a timestamp, or when a new order arrives mid-browse
   * as it would with an offset. Filters and the search term are part of the
   * `where` clause, so they are applied by PostgreSQL and the extra row that
   * answers "is there another page" is counted against the filtered set.
   */
  async list(query: AdminOrderPageQuery): Promise<OrderPage> {
    const limit = Math.min(Math.max(1, Math.trunc(query.limit)), MAX_PAGE_SIZE);
    const walkingBack = query.direction !== "newer";
    const cursor = query.cursor;

    const keyset: Prisma.OrderWhereInput = cursor
      ? walkingBack
        ? {
            OR: [
              { createdAt: { lt: cursor.createdAt } },
              { createdAt: cursor.createdAt, reference: { lt: cursor.reference } },
            ],
          }
        : {
            OR: [
              { createdAt: { gt: cursor.createdAt } },
              { createdAt: cursor.createdAt, reference: { gt: cursor.reference } },
            ],
          }
      : {};

    const where: Prisma.OrderWhereInput = {
      ...searchClause(query.search),
      ...(query.status ? { status: query.status } : {}),
      ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
      ...keyset,
    };

    const rows = await this.run("read the orders", () =>
      this.prisma.order.findMany({
        where,
        include: orderWithItems,
        orderBy: walkingBack
          ? [{ createdAt: "desc" }, { reference: "desc" }]
          : [{ createdAt: "asc" }, { reference: "asc" }],
        take: limit + 1,
      }),
    );

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const ordered = walkingBack ? page : [...page].reverse();

    return { orders: ordered.map(toDomainOrder), hasMore };
  }

  async find(reference: string): Promise<AdminOrderRecord | null> {
    const row = await this.run("read the order", () =>
      this.prisma.order.findUnique({
        where: { reference },
        include: { ...orderWithItems, statusHistory: historyWithAdmin },
      }),
    );
    if (!row) {
      return null;
    }

    return {
      order: toDomainOrder(row),
      history: row.statusHistory.map((entry) => ({
        at: entry.createdAt,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        adminName: entry.changedByAdmin?.name ?? null,
      })),
    };
  }

  /**
   * The dashboard's figures.
   *
   * Two grouped aggregates rather than one query per card: PostgreSQL counts
   * the rows, and nothing here scans the order table. Settled money is summed
   * per currency, because adding a euro to a dollar would be a made-up
   * number, and only over payments that are still settled — a refund leaves
   * `paymentStatus = refunded` and drops out of the sum by itself.
   */
  async counts(): Promise<AdminOrderCounts> {
    const [byStatusRows, byPaymentRows, settledRows] = await this.run(
      "read the order figures",
      () =>
        Promise.all([
          this.prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
          this.prisma.order.groupBy({ by: ["paymentStatus"], _count: { _all: true } }),
          this.prisma.order.groupBy({
            by: ["currency"],
            where: { paymentStatus: "paid" },
            _count: { _all: true },
            _sum: { totalAmount: true },
          }),
        ]),
    );

    const byStatus = emptyCounts(ALL_STATUSES);
    for (const row of byStatusRows) {
      byStatus[row.status] = row._count._all;
    }

    const byPaymentStatus = emptyCounts(ALL_PAYMENT_STATUSES);
    for (const row of byPaymentRows) {
      byPaymentStatus[row.paymentStatus] = row._count._all;
    }

    const settled: SettledTotal[] = settledRows
      .map((row) => ({
        currency: row.currency,
        orders: row._count._all,
        amount: row._sum.totalAmount ?? 0,
      }))
      .sort((left, right) => right.amount - left.amount);

    return {
      total: ALL_STATUSES.reduce((sum, status) => sum + byStatus[status], 0),
      byStatus,
      byPaymentStatus,
      settled,
    };
  }

  /**
   * Applies an operator's status change.
   *
   * Compare-and-set: the update matches only while the order is still in the
   * state the service validated the transition against, so a second operator
   * acting on a stale page changes nothing and is told so. The history row is
   * written in the same transaction as the status, so the trail can never
   * disagree with the order — either both land or neither does.
   *
   * `data` carries `status` and nothing else. There is no code path here that
   * can write a payment status, whatever a request contains.
   */
  async applyStatus(input: ApplyStatusInput): Promise<ApplyStatusResult> {
    const outcome = await this.run("update the order", () =>
      this.prisma.$transaction(async (tx) => {
        const current = await tx.order.findUnique({
          where: { reference: input.reference },
          select: { id: true, status: true, paymentStatus: true },
        });
        if (!current) {
          return { ok: false as const, reason: "not-found" as const };
        }
        if (
          current.status !== input.from.status ||
          current.paymentStatus !== input.from.paymentStatus
        ) {
          return { ok: false as const, reason: "conflict" as const };
        }

        const changed = await tx.order.updateMany({
          where: {
            reference: input.reference,
            status: input.from.status,
            paymentStatus: input.from.paymentStatus,
          },
          data: { status: input.to },
        });
        if (changed.count !== 1) {
          return { ok: false as const, reason: "conflict" as const };
        }

        await tx.orderStatusHistory.create({
          data: {
            orderId: current.id,
            fromStatus: input.from.status,
            toStatus: input.to,
            changedByAdminId: input.adminUserId,
          },
        });

        return { ok: true as const };
      }),
    );

    if (!outcome.ok) {
      return outcome;
    }

    const row = await this.run("read the order back", () =>
      this.prisma.order.findUnique({
        where: { reference: input.reference },
        include: orderWithItems,
      }),
    );
    if (!row) {
      // Vanishingly unlikely: it existed a moment ago inside the transaction.
      return { ok: false, reason: "not-found" };
    }
    return { ok: true, order: toDomainOrder(row) };
  }

  /**
   * Runs a query, converting anything the driver throws into an error that is
   * safe to let bubble: no SQL, no connection string, no Prisma internals.
   */
  private async run<T>(action: string, query: () => Promise<T>): Promise<T> {
    try {
      return await query();
    } catch (error) {
      if (error instanceof OrderStorageError) {
        throw error;
      }
      console.error(
        `[admin] Database failure while trying to ${action}: ${describeError(error)}`,
      );
      throw new OrderStorageError(`Could not ${action}.`, { cause: error });
    }
  }
}

/**
 * What the search box means.
 *
 * A value shaped like an order reference is looked up as one — exactly, and
 * case-insensitively, so "zyv-a1b2c3" typed in lower case finds the order.
 * Anything else is treated as part of a customer's email address. Both go to
 * Prisma as parameters; no user input is ever concatenated into SQL.
 *
 * The email search is a case-insensitive substring match, which PostgreSQL
 * answers with a scan of the orders table. That is honest about what it is:
 * fine at this size, and the point at which a trigram index (`pg_trgm`) would
 * be the right addition is when the table is large enough for the scan to
 * show — not before, on the strength of a guess.
 */
function searchClause(rawSearch: string): Prisma.OrderWhereInput {
  const search = rawSearch.trim().slice(0, MAX_SEARCH_LENGTH);
  if (!search) {
    return {};
  }

  const asReference = search.toUpperCase();
  if (isOrderReference(asReference)) {
    return { reference: asReference };
  }

  return { customerEmail: { contains: search, mode: "insensitive" } };
}

function emptyCounts<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
}

/** Type name and code only — never parameters, rows or connection details. */
function describeError(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    return `Prisma error ${String((error as { code?: unknown }).code)}`;
  }
  return error instanceof Error ? error.name : "unknown error";
}
