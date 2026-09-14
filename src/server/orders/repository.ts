import type { Order, OrderStatus, OrderPaymentStatus } from "@/types";

/**
 * Order persistence seam.
 *
 * This repository is the only thing the payment layer knows about storage.
 * PostgreSQL backs it in the running application (`prisma-repository.ts`);
 * an in-memory adapter (`memory-repository.ts`) backs unit tests. Swapping
 * either in happens in `getOrderRepository()`, not at any call site.
 *
 * Two invariants every adapter must uphold:
 *
 * 1. One Stripe Checkout Session yields at most one order. `create` is an
 *    upsert keyed on `stripeCheckoutSessionId`, and reports whether it
 *    actually inserted.
 * 2. A webhook event is applied at most once. `claimEvent` must be atomic —
 *    the first caller for an event id gets `true`, every retry gets `false`.
 */

/** Everything needed to create an order, minus the fields storage assigns. */
export interface NewOrder {
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  currency: string;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  customer: Order["customer"];
  /** Server-resolved account id, or null for a guest order. */
  customerId: string | null;
  shippingAddress: Order["shippingAddress"];
  items: readonly Order["items"][number][];
  deliveryOptionId: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
}

export interface CreateOrderResult {
  order: Order;
  /** False when an order for this session already existed. */
  created: boolean;
}

/**
 * One page of a customer's order history.
 *
 * Keyset pagination: the cursor is the (createdAt, reference) pair of an edge
 * row, which is stable under inserts and exposes no internal identifier —
 * the reference is the customer's own order number.
 */
export interface OrderPageCursor {
  createdAt: Date;
  reference: string;
}

export interface OrderPageQuery {
  /** Rows per page. The repository clamps this. */
  limit: number;
  cursor?: OrderPageCursor;
  /** "older" walks back in time from the cursor; "newer" walks forward. */
  direction?: "older" | "newer";
}

export interface OrderPage {
  orders: readonly Order[];
  /** True when more rows exist beyond this page in the same direction. */
  hasMore: boolean;
}

export interface OrderRepository {
  findByCheckoutSessionId(sessionId: string): Promise<Order | null>;

  /** Lookup by the customer-facing reference (ZYV-XXXXXX). */
  findByReference(reference: string): Promise<Order | null>;

  /**
   * One page of orders belonging to a customer, newest first.
   *
   * Ownership is part of the query, not a filter applied afterwards: an order
   * belonging to somebody else — or to nobody, as a guest order does — is
   * never read in the first place.
   */
  listForCustomer(
    customerId: string,
    query: OrderPageQuery,
  ): Promise<OrderPage>;

  /**
   * One order, by reference, only if this customer owns it.
   *
   * Returns null both for "no such order" and "not yours", so a caller has
   * nothing to distinguish the two with.
   */
  findForCustomer(customerId: string, reference: string): Promise<Order | null>;

  /** Inserts, or returns the existing order for the same Checkout Session. */
  create(draft: NewOrder): Promise<CreateOrderResult>;

  /**
   * Moves an existing order to paid. Safe to call repeatedly: an order that is
   * already paid is returned unchanged.
   */
  markPaid(
    sessionId: string,
    paymentIntentId: string | null,
  ): Promise<Order | null>;

  /** Moves an existing order to failed. Never downgrades a paid order. */
  markFailed(sessionId: string): Promise<Order | null>;

  /**
   * Records a webhook event id, returning true only for the first caller.
   * Stripe retries deliveries, so this is what keeps handling exactly-once.
   * The event type is stored alongside it purely for later diagnosis.
   */
  claimEvent(eventId: string, eventType: string): Promise<boolean>;
}
