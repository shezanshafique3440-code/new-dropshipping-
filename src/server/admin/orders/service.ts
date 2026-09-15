import type { Order, OrderStatus } from "@/types";

import { encodeOrderCursor } from "../../orders/cursor";
import type { OrderPageCursor } from "../../orders/repository";
import { isOrderReference } from "../../orders/reference";
import {
  assertTransition,
  isAdminStatusChangeAllowed,
  type OrderState,
} from "../../orders/transitions";
import {
  toAdminOrderDetail,
  toAdminOrderSummary,
  type AdminOrderDetailView,
  type AdminOrderSummaryView,
} from "./dto";
import { getAdminOrderRepository } from "./index";
import type {
  AdminOrderCounts,
  AdminOrderFilters,
  AdminOrderRepository,
} from "./repository";

/**
 * Admin order operations.
 *
 * The layer where the panel's *rules* live: pages and endpoints call these,
 * never the repository, and the repository never decides what a change means.
 *
 * Every function takes an `AdminActor` as its first argument, and the only
 * things that produce one are `requireAdmin()` and `requireAdminApi()` —
 * both of which resolve the admin session cookie against the database. That
 * is deliberate: it makes "who is asking" a parameter the compiler insists
 * on, so a page cannot read admin data without having resolved an
 * administrator first.
 *
 * It has to be here rather than only in the layout. Next.js renders a layout
 * and the page beneath it in parallel, so a layout that redirects does not
 * stop the page from running or from putting its data in the RSC payload —
 * the framework's own authentication guide says as much. Authorization
 * belongs next to the data.
 */

/**
 * Proof that the caller resolved an administrator from their session.
 *
 * Carries only what this layer needs: the id to attribute a change to, and
 * the address to log it against.
 */
export interface AdminActor {
  id: string;
  email: string;
}

export interface AdminOrderServiceOptions {
  repository?: AdminOrderRepository;
}

function repo(options?: AdminOrderServiceOptions): AdminOrderRepository {
  return options?.repository ?? getAdminOrderRepository();
}

/** Orders per page in the panel. */
export const ADMIN_ORDERS_PER_PAGE = 20;

export interface AdminOrderPageView {
  orders: readonly AdminOrderSummaryView[];
  /** Cursor for the next (older) page, or null at the end of the list. */
  olderCursor: string | null;
  /** Cursor for the previous (newer) page, or null on the first page. */
  newerCursor: string | null;
}

export interface ListAdminOrdersOptions extends AdminOrderServiceOptions {
  cursor?: OrderPageCursor | null;
  direction?: "older" | "newer";
  limit?: number;
}

export async function listAdminOrders(
  actor: AdminActor,
  filters: AdminOrderFilters,
  options: ListAdminOrdersOptions = {},
): Promise<AdminOrderPageView> {
  assertActor(actor);

  const limit = options.limit ?? ADMIN_ORDERS_PER_PAGE;
  const direction = options.direction ?? "older";
  const cursor = options.cursor ?? undefined;

  const page = await repo(options).list({ ...filters, limit, cursor, direction });

  const first = page.orders[0];
  const last = page.orders[page.orders.length - 1];

  // Walking back: "more" means older orders exist. Walking forward: it means
  // newer ones do, and there is by definition something older behind us.
  const hasOlder = direction === "older" ? page.hasMore : Boolean(cursor);
  const hasNewer = direction === "older" ? Boolean(cursor) : page.hasMore;

  return {
    orders: page.orders.map(toAdminOrderSummary),
    olderCursor: hasOlder && last ? encodeOrderCursor(edge(last)) : null,
    newerCursor: hasNewer && first ? encodeOrderCursor(edge(first)) : null,
  };
}

/**
 * One order, in full, for the panel.
 *
 * There is no ownership condition — an operator is meant to see every order,
 * including the guest orders no account can reach — but the reference is
 * still checked for shape first, so a crafted value never reaches the
 * database as a query.
 */
export async function getAdminOrder(
  actor: AdminActor,
  reference: string,
  options: AdminOrderServiceOptions = {},
): Promise<AdminOrderDetailView | null> {
  assertActor(actor);
  if (!isOrderReference(reference)) {
    return null;
  }
  const record = await repo(options).find(reference);
  return record ? toAdminOrderDetail(record) : null;
}

/** The dashboard's figures, straight from the database's own aggregates. */
export async function getOrderCounts(
  actor: AdminActor,
  options: AdminOrderServiceOptions = {},
): Promise<AdminOrderCounts> {
  assertActor(actor);
  return repo(options).counts();
}

export type StatusChangeOutcome =
  | { ok: true; order: AdminOrderDetailView }
  /** No order with that reference, or the reference is not one. */
  | { ok: false; reason: "not-found" }
  /** The state machine does not allow an operator to make this change. */
  | { ok: false; reason: "not-allowed" }
  /** Somebody changed the order first; nothing was written. */
  | { ok: false; reason: "conflict" };

export interface ChangeOrderStatusInput extends AdminOrderServiceOptions {
  reference: string;
  to: OrderStatus;
}

/**
 * Moves an order to a new status on an operator's instruction.
 *
 * The rules are the project's existing ones: `adminStatusOptions` derives what
 * an operator may do from the same transition table the payment webhook obeys,
 * with the payment status held fixed, and `assertTransition` re-checks the
 * result against that table before anything is written. The panel does not
 * carry a second state machine, and cannot widen the one there is.
 *
 * The payment status is never an input and never an output of this path.
 */
export async function changeOrderStatus(
  actor: AdminActor,
  input: ChangeOrderStatusInput,
): Promise<StatusChangeOutcome> {
  assertActor(actor);
  if (!isOrderReference(input.reference)) {
    return { ok: false, reason: "not-found" };
  }

  const repository = repo(input);
  const record = await repository.find(input.reference);
  if (!record) {
    return { ok: false, reason: "not-found" };
  }

  const from: OrderState = {
    status: record.order.status,
    paymentStatus: record.order.paymentStatus,
  };

  if (!isAdminStatusChangeAllowed(from, input.to)) {
    return { ok: false, reason: "not-allowed" };
  }

  // Belt and braces: the central rule, asked directly. If the two ever
  // disagreed this would throw rather than write something the state machine
  // does not permit.
  assertTransition(from, { status: input.to, paymentStatus: from.paymentStatus });

  const applied = await repository.applyStatus({
    reference: input.reference,
    from,
    to: input.to,
    adminUserId: actor.id,
  });

  if (!applied.ok) {
    return applied;
  }

  const updated = await repository.find(input.reference);
  return updated
    ? { ok: true, order: toAdminOrderDetail(updated) }
    : { ok: false, reason: "not-found" };
}

/**
 * A last line of defence, not the authorization.
 *
 * The authorization is `requireAdmin()`, which produced the actor. This only
 * refuses a caller that passed something empty where an administrator should
 * be — the kind of mistake that would otherwise read as "no admin, carry on".
 */
function assertActor(actor: AdminActor): void {
  if (!actor?.id) {
    throw new Error("An administrator must be resolved before reading admin data.");
  }
}

function edge(order: Order): OrderPageCursor {
  return { createdAt: new Date(order.createdAt), reference: order.reference };
}
