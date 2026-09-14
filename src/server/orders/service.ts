import type { Order } from "@/types";

import {
  toCustomerOrderDetail,
  toCustomerOrderSummary,
  type CustomerOrderDetailView,
  type CustomerOrderSummaryView,
} from "./customer-dto";
import { getOrderRepository } from "./index";
import type { NewOrder, OrderPageCursor, OrderRepository } from "./repository";
import {
  assertTransition,
  CANCELLED_STATE,
  FAILED_STATE,
  isSettled,
  PAID_STATE,
} from "./transitions";

/**
 * Order service.
 *
 * The thin layer where order *rules* live, between routes (which know about
 * HTTP and Stripe) and the repository (which knows about storage). Routes
 * never issue queries themselves, and the repository never decides what a
 * status change means.
 *
 * Every function here is safe to call twice with the same input: that is a
 * requirement, not a nicety, because a payment provider retries.
 */

export interface OrderServiceOptions {
  repository?: OrderRepository;
}

function repo(options?: OrderServiceOptions): OrderRepository {
  return options?.repository ?? getOrderRepository();
}

export interface RecordOrderResult {
  order: Order;
  /** False when this call found an order someone else had already created. */
  created: boolean;
}

/**
 * Creates the order for a Checkout Session, or returns the one that exists.
 *
 * Idempotent by construction: the repository keys on the session id, so the
 * webhook and the returning browser racing each other still produce exactly
 * one order.
 */
export async function recordOrder(
  draft: NewOrder,
  options?: OrderServiceOptions,
): Promise<RecordOrderResult> {
  const { order, created } = await repo(options).create(draft);
  return { order, created };
}

/**
 * Applies a confirmed payment to an existing order.
 *
 * Returns the order unchanged when it is already settled — a duplicate
 * webhook must not restamp a payment that landed minutes ago.
 */
export async function markOrderPaid(
  stripeCheckoutSessionId: string,
  stripePaymentIntentId: string | null,
  options?: OrderServiceOptions,
): Promise<Order | null> {
  const repository = repo(options);
  const current = await repository.findByCheckoutSessionId(
    stripeCheckoutSessionId,
  );
  if (!current) {
    return null;
  }
  if (isSettled(current)) {
    return current;
  }

  assertTransition(current, PAID_STATE);
  return repository.markPaid(stripeCheckoutSessionId, stripePaymentIntentId);
}

/** Records that a payment attempt failed. Never contradicts a settled order. */
export async function markOrderFailed(
  stripeCheckoutSessionId: string,
  options?: OrderServiceOptions,
): Promise<Order | null> {
  const repository = repo(options);
  const current = await repository.findByCheckoutSessionId(
    stripeCheckoutSessionId,
  );
  if (!current) {
    return null;
  }
  if (isSettled(current)) {
    return current;
  }

  assertTransition(current, FAILED_STATE);
  return repository.markFailed(stripeCheckoutSessionId);
}

/**
 * Cancels an order that has not been paid for.
 *
 * Nothing calls this yet — cancelling at Stripe simply never creates an order
 * — but the rule belongs with the others rather than being invented later by
 * whichever feature needs it first.
 */
export async function cancelOrder(
  stripeCheckoutSessionId: string,
  options?: OrderServiceOptions,
): Promise<Order | null> {
  const repository = repo(options);
  const current = await repository.findByCheckoutSessionId(
    stripeCheckoutSessionId,
  );
  if (!current) {
    return null;
  }

  assertTransition(current, CANCELLED_STATE);
  return repository.markFailed(stripeCheckoutSessionId);
}

export async function findOrderByCheckoutSession(
  stripeCheckoutSessionId: string,
  options?: OrderServiceOptions,
): Promise<Order | null> {
  return repo(options).findByCheckoutSessionId(stripeCheckoutSessionId);
}

export async function findOrderByReference(
  reference: string,
  options?: OrderServiceOptions,
): Promise<Order | null> {
  return repo(options).findByReference(reference);
}

/**
 * Claims a webhook event for processing.
 *
 * True exactly once per event id, across every instance and every retry.
 */
export async function claimWebhookEvent(
  eventId: string,
  eventType: string,
  options?: OrderServiceOptions,
): Promise<boolean> {
  return repo(options).claimEvent(eventId, eventType);
}

/* -------------------------------------------------------------------------
 * Customer order history
 *
 * Every function here takes the customer id the caller resolved from the
 * session — never a value from a URL, a body or a form — and passes it into
 * the query itself. There is no code path that reads an order first and
 * checks ownership afterwards.
 * ---------------------------------------------------------------------- */

/** Orders per page. Small enough to render fast, large enough to be useful. */
export const ORDERS_PER_PAGE = 10;

export interface CustomerOrderPage {
  orders: readonly CustomerOrderSummaryView[];
  /** Cursor for the next (older) page, or null at the end of the history. */
  olderCursor: OrderPageCursor | null;
  /** Cursor for the previous (newer) page, or null on the first page. */
  newerCursor: OrderPageCursor | null;
}

export interface ListCustomerOrdersOptions extends OrderServiceOptions {
  cursor?: OrderPageCursor;
  direction?: "older" | "newer";
  limit?: number;
}

export async function listCustomerOrders(
  customerId: string,
  options: ListCustomerOrdersOptions = {},
): Promise<CustomerOrderPage> {
  const limit = options.limit ?? ORDERS_PER_PAGE;
  const direction = options.direction ?? "older";

  const page = await repo(options).listForCustomer(customerId, {
    limit,
    cursor: options.cursor,
    direction,
  });

  const orders = page.orders.map(toCustomerOrderSummary);
  const first = page.orders[0];
  const last = page.orders[page.orders.length - 1];

  // Walking back: "more" means older orders exist. Walking forward: it means
  // newer ones do, and there is by definition something older behind us.
  const hasOlder = direction === "older" ? page.hasMore : Boolean(options.cursor);
  const hasNewer = direction === "older" ? Boolean(options.cursor) : page.hasMore;

  return {
    orders,
    olderCursor: hasOlder && last ? edge(last) : null,
    newerCursor: hasNewer && first ? edge(first) : null,
  };
}

export async function getCustomerOrder(
  customerId: string,
  reference: string,
  options: OrderServiceOptions = {},
): Promise<CustomerOrderDetailView | null> {
  const order = await repo(options).findForCustomer(customerId, reference);
  return order ? toCustomerOrderDetail(order) : null;
}

function edge(order: Order): OrderPageCursor {
  return { createdAt: new Date(order.createdAt), reference: order.reference };
}
