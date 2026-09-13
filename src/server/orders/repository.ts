import type { Order, OrderStatus, OrderPaymentStatus } from "@/types";

/**
 * Order persistence seam.
 *
 * This repository is the only thing the payment layer knows about storage.
 * The adapter behind it is in-memory today (see `memory-repository.ts`);
 * pointing it at Prisma, Postgres or another service is an implementation
 * swap in `getOrderRepository()`, not a change to any caller.
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

export interface OrderRepository {
  findByCheckoutSessionId(sessionId: string): Promise<Order | null>;

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
   */
  claimEvent(eventId: string): Promise<boolean>;
}
