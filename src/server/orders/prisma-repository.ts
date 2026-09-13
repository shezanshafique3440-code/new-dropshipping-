import type { Prisma, PrismaClient } from "@prisma/client";

import type { Order, OrderItem, OrderShippingAddress } from "@/types";

import { getPrismaClient } from "../db/client";
import { generateOrderReference } from "./reference";
import type {
  CreateOrderResult,
  NewOrder,
  OrderRepository,
} from "./repository";
import { canTransition, FAILED_STATE, PAID_STATE } from "./transitions";

/**
 * PostgreSQL order storage.
 *
 * Every guarantee that matters here is enforced by the database, not by
 * checking first and hoping:
 *
 *   - one Checkout Session yields one order, because the column is unique and
 *     a losing insert is caught and turned into "you already have it";
 *   - a payment is applied once, because the update is a single conditional
 *     statement rather than a read followed by a write;
 *   - a webhook event is handled once, because the first insert of its id
 *     wins and every retry collides.
 *
 * That is what makes this correct with several server instances running, and
 * why none of it depends on process memory.
 */

/** Unique constraint violation. */
const UNIQUE_VIOLATION = "P2002";

/** How many reference collisions to ride out before giving up. */
const REFERENCE_ATTEMPTS = 5;

export class OrderStorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "OrderStorageError";
  }
}

/**
 * Recognises a unique-constraint violation, optionally for one column.
 *
 * Prisma reports the offending constraint differently depending on the
 * database and driver — a list of fields, the constraint name, or only the
 * message — so all three are searched rather than trusting one shape.
 */
function isUniqueViolation(error: unknown, field?: string): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }
  if ((error as { code?: unknown }).code !== UNIQUE_VIOLATION) {
    return false;
  }
  if (!field) {
    return true;
  }

  const { meta, message } = error as { meta?: { target?: unknown }; message?: unknown };
  const target = meta?.target;
  const parts = [
    ...(Array.isArray(target) ? target.map(String) : []),
    typeof target === "string" ? target : "",
    typeof message === "string" ? message : "",
  ];
  return parts.some((part) => part.includes(field));
}

const orderWithItems = {
  items: { orderBy: { createdAt: "asc" } },
} as const;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderWithItems }>;

export class PrismaOrderRepository implements OrderRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient = getPrismaClient()) {
    this.prisma = prisma;
  }

  async findByCheckoutSessionId(sessionId: string): Promise<Order | null> {
    const row = await this.run("read an order", () =>
      this.prisma.order.findUnique({
        where: { stripeCheckoutSessionId: sessionId },
        include: orderWithItems,
      }),
    );
    return row ? toDomainOrder(row) : null;
  }

  async findByReference(reference: string): Promise<Order | null> {
    const row = await this.run("read an order", () =>
      this.prisma.order.findUnique({
        where: { reference },
        include: orderWithItems,
      }),
    );
    return row ? toDomainOrder(row) : null;
  }

  /**
   * Insert-or-return, keyed on the Checkout Session.
   *
   * The order and its lines are written in one transaction, so an order can
   * never exist with half its items. If a concurrent caller — the webhook and
   * the success page arriving together, typically — inserted first, the
   * unique index rejects this insert and the winner's order is returned.
   */
  async create(draft: NewOrder): Promise<CreateOrderResult> {
    for (let attempt = 0; attempt < REFERENCE_ATTEMPTS; attempt += 1) {
      const reference = generateOrderReference();

      try {
        const row = await this.run("create an order", () =>
          this.prisma.$transaction(async (tx) =>
            tx.order.create({
              data: {
                reference,
                status: draft.status,
                paymentStatus: draft.paymentStatus,
                currency: draft.currency,
                subtotalAmount: draft.subtotalAmount,
                shippingAmount: draft.shippingAmount,
                totalAmount: draft.totalAmount,
                customerEmail: draft.customer.email,
                customerName: draft.customer.name,
                shippingName: draft.shippingAddress?.name ?? null,
                shippingLine1: draft.shippingAddress?.line1 ?? null,
                shippingLine2: draft.shippingAddress?.line2 ?? null,
                shippingCity: draft.shippingAddress?.city ?? null,
                shippingRegion: draft.shippingAddress?.region ?? null,
                shippingPostalCode: draft.shippingAddress?.postalCode ?? null,
                shippingCountry: draft.shippingAddress?.country ?? null,
                deliveryOptionId: draft.deliveryOptionId,
                stripeCheckoutSessionId: draft.stripeCheckoutSessionId,
                stripePaymentIntentId: draft.stripePaymentIntentId,
                items: {
                  create: draft.items.map((item) => ({
                    productId: item.productId,
                    slug: item.slug,
                    name: item.name,
                    unitAmount: item.unitAmount,
                    quantity: item.quantity,
                    lineAmount: item.lineAmount,
                  })),
                },
              },
              include: orderWithItems,
            }),
          ),
        );

        return { order: toDomainOrder(row), created: true };
      } catch (error) {
        if (isUniqueViolation(error, "stripeCheckoutSessionId")) {
          const existing = await this.findByCheckoutSessionId(
            draft.stripeCheckoutSessionId,
          );
          if (existing) {
            return { order: existing, created: false };
          }
          throw new OrderStorageError(
            "An order for this payment exists but could not be read back.",
            { cause: error },
          );
        }

        if (isUniqueViolation(error, "reference")) {
          // Two references collided. Vanishingly rare; simply mint another.
          continue;
        }

        throw error;
      }
    }

    throw new OrderStorageError(
      "Could not allocate an unused order reference.",
    );
  }

  /**
   * Applies a confirmed payment.
   *
   * One conditional statement: the row moves to paid only if it is still
   * waiting for money. A second, concurrent confirmation matches nothing and
   * changes nothing, so the order keeps its original paid timestamp.
   */
  async markPaid(
    sessionId: string,
    paymentIntentId: string | null,
  ): Promise<Order | null> {
    const current = await this.findByCheckoutSessionId(sessionId);
    if (!current) {
      return null;
    }
    if (!canTransition(current, PAID_STATE)) {
      // Already paid, refunded, or somewhere this must not move from.
      return current;
    }

    await this.run("record a payment", async () => {
      try {
        await this.prisma.order.updateMany({
          where: {
            stripeCheckoutSessionId: sessionId,
            paymentStatus: { in: ["unpaid", "failed"] },
          },
          data: {
            status: PAID_STATE.status,
            paymentStatus: PAID_STATE.paymentStatus,
            ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
          },
        });
      } catch (error) {
        if (isUniqueViolation(error, "stripePaymentIntentId")) {
          // The intent is already recorded against another order: record the
          // payment anyway rather than lose it, and leave the id alone.
          console.warn(
            "[orders] Payment intent already attached to another order; " +
              "recording payment without it.",
          );
          await this.prisma.order.updateMany({
            where: {
              stripeCheckoutSessionId: sessionId,
              paymentStatus: { in: ["unpaid", "failed"] },
            },
            data: {
              status: PAID_STATE.status,
              paymentStatus: PAID_STATE.paymentStatus,
            },
          });
          return;
        }
        throw error;
      }
    });

    return this.findByCheckoutSessionId(sessionId);
  }

  /** Records a failed payment. Never contradicts money that already arrived. */
  async markFailed(sessionId: string): Promise<Order | null> {
    const current = await this.findByCheckoutSessionId(sessionId);
    if (!current) {
      return null;
    }
    if (!canTransition(current, FAILED_STATE)) {
      return current;
    }

    await this.run("record a failed payment", () =>
      this.prisma.order.updateMany({
        where: {
          stripeCheckoutSessionId: sessionId,
          paymentStatus: { in: ["unpaid", "failed"] },
        },
        data: {
          status: FAILED_STATE.status,
          paymentStatus: FAILED_STATE.paymentStatus,
        },
      }),
    );

    return this.findByCheckoutSessionId(sessionId);
  }

  /**
   * Claims a webhook event.
   *
   * The insert is the claim: the first caller to write the event id wins, and
   * every retry — from Stripe, or from another instance handling the same
   * delivery — collides with the primary key and is told to stand down.
   */
  async claimEvent(eventId: string, eventType: string): Promise<boolean> {
    try {
      await this.prisma.processedWebhookEvent.create({
        data: { id: eventId, type: eventType },
      });
      return true;
    } catch (error) {
      if (isUniqueViolation(error)) {
        return false;
      }
      throw new OrderStorageError("Could not record the webhook event.", {
        cause: error,
      });
    }
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
      if (isUniqueViolation(error)) {
        // Meaningful to the caller; passed through for it to interpret.
        throw error;
      }
      console.error(
        `[orders] Database failure while trying to ${action}: ${describeError(error)}`,
      );
      throw new OrderStorageError(`Could not ${action}.`, { cause: error });
    }
  }
}

/** Type name and message only — never parameters, rows or connection details. */
function describeError(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    return `Prisma error ${String((error as { code?: unknown }).code)}`;
  }
  return error instanceof Error ? error.name : "unknown error";
}

/* -------------------------------------------------------------------------
 * Mapping
 *
 * The persistence row never leaves this module. Everything above the
 * repository works with the application's own `Order`, so a schema column can
 * be renamed without touching a route.
 * ---------------------------------------------------------------------- */

function toDomainOrder(row: OrderRow): Order {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    paymentStatus: row.paymentStatus,
    currency: row.currency,
    subtotalAmount: row.subtotalAmount,
    shippingAmount: row.shippingAmount,
    totalAmount: row.totalAmount,
    customer: { email: row.customerEmail, name: row.customerName },
    shippingAddress: toDomainAddress(row),
    items: row.items.map(toDomainItem),
    deliveryOptionId: row.deliveryOptionId,
    stripeCheckoutSessionId: row.stripeCheckoutSessionId,
    stripePaymentIntentId: row.stripePaymentIntentId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toDomainAddress(row: OrderRow): OrderShippingAddress | null {
  if (!row.shippingLine1 || !row.shippingCountry) {
    return null;
  }
  return {
    name: row.shippingName ?? "",
    line1: row.shippingLine1,
    line2: row.shippingLine2 ?? "",
    city: row.shippingCity ?? "",
    region: row.shippingRegion ?? "",
    postalCode: row.shippingPostalCode ?? "",
    country: row.shippingCountry,
  };
}

function toDomainItem(row: OrderRow["items"][number]): OrderItem {
  return {
    productId: row.productId,
    slug: row.slug,
    name: row.name,
    quantity: row.quantity,
    unitAmount: row.unitAmount,
    lineAmount: row.lineAmount,
  };
}
