import type Stripe from "stripe";

import type { Order, OrderShippingAddress } from "@/types";

import type { NewOrder, OrderRepository } from "../orders/repository";
import { PAYMENT_CURRENCY } from "./config";
import { decodeCartMetadata, sumOrderItems, toOrderItems } from "./line-items";

/**
 * Turning a confirmed Stripe session into an order.
 *
 * This is the only place an order comes into existence, and both callers —
 * the webhook and the success page's verification endpoint — go through it.
 * Whichever arrives first creates the order; the other finds it. That is what
 * makes "one payment, one order" hold when Stripe retries a delivery, when
 * the shopper refreshes the success page, and when both happen at once.
 */

export type RecordOutcome =
  | { kind: "recorded"; order: Order; created: boolean }
  | { kind: "ignored"; reason: string };

export async function recordOrderForSession(
  repository: OrderRepository,
  session: Stripe.Checkout.Session,
): Promise<RecordOutcome> {
  if (!session.id) {
    return { kind: "ignored", reason: "session-without-id" };
  }
  if (session.status === "expired") {
    return { kind: "ignored", reason: "session-expired" };
  }

  const paid =
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required";

  // An open session is just a shopper looking at a payment page. Nothing is
  // recorded until Stripe says the payment completed, one way or the other.
  if (!paid && session.status !== "complete") {
    return { kind: "ignored", reason: "payment-not-completed" };
  }

  const existing = await repository.findByCheckoutSessionId(session.id);
  if (existing) {
    if (paid && existing.paymentStatus !== "paid") {
      const updated = await repository.markPaid(
        session.id,
        readPaymentIntentId(session),
      );
      return { kind: "recorded", order: updated ?? existing, created: false };
    }
    return { kind: "recorded", order: existing, created: false };
  }

  const { order, created } = await repository.create(buildDraft(session, paid));
  return { kind: "recorded", order, created };
}

function buildDraft(session: Stripe.Checkout.Session, paid: boolean): NewOrder {
  const decoded = decodeCartMetadata(session.metadata);
  const items = decoded ? toOrderItems(decoded) : [];

  if (!decoded) {
    // Money may already have moved, so the order is still recorded — losing it
    // would be far worse than recording it without its line breakdown.
    console.warn(
      `[payments] Checkout session ${session.id} carried no readable basket metadata.`,
    );
  }

  const shippingAmount = session.shipping_cost?.amount_total ?? 0;
  const itemsAmount = items.length > 0 ? sumOrderItems(items) : null;
  const subtotalAmount = itemsAmount ?? session.amount_subtotal ?? 0;
  // What Stripe actually charged wins over anything recomputed here.
  const totalAmount = session.amount_total ?? subtotalAmount + shippingAmount;

  if (itemsAmount !== null && itemsAmount + shippingAmount !== totalAmount) {
    console.warn(
      `[payments] Checkout session ${session.id} total ${totalAmount} does not match ` +
        `its recorded lines ${itemsAmount + shippingAmount}; recording the charged amount.`,
    );
  }

  return {
    status: paid ? "paid" : "pending",
    paymentStatus: paid ? "paid" : "unpaid",
    currency: session.currency ?? PAYMENT_CURRENCY,
    subtotalAmount,
    shippingAmount,
    totalAmount,
    customer: {
      email: session.customer_details?.email ?? session.customer_email ?? "",
      name: session.customer_details?.name ?? session.metadata?.customerName ?? "",
    },
    shippingAddress: readShippingAddress(session),
    items,
    deliveryOptionId: session.metadata?.deliveryOptionId ?? "",
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: readPaymentIntentId(session),
  };
}

function readPaymentIntentId(session: Stripe.Checkout.Session): string | null {
  const intent = session.payment_intent;
  if (!intent) {
    return null;
  }
  return typeof intent === "string" ? intent : intent.id;
}

/** Rebuilt from the metadata this app wrote, not from a client-supplied body. */
function readShippingAddress(
  session: Stripe.Checkout.Session,
): OrderShippingAddress | null {
  const metadata = session.metadata;
  if (!metadata?.shippingLine1 || !metadata.shippingCountry) {
    return null;
  }
  return {
    name: metadata.customerName ?? "",
    line1: metadata.shippingLine1,
    line2: metadata.shippingLine2 ?? "",
    city: metadata.shippingCity ?? "",
    region: metadata.shippingRegion ?? "",
    postalCode: metadata.shippingPostalCode ?? "",
    country: metadata.shippingCountry,
  };
}

/* -------------------------------------------------------------------------
 * Customer-facing projection
 * ---------------------------------------------------------------------- */

export interface PublicOrder {
  reference: string;
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
  currency: string;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  email: string;
  items: ReadonlyArray<{
    name: string;
    quantity: number;
    unitAmount: number;
    lineAmount: number;
  }>;
}

/**
 * The only shape of an order that ever reaches a browser: no internal id, no
 * Stripe identifiers, no address, nothing that would help someone guessing at
 * other people's orders.
 */
export function toPublicOrder(order: Order): PublicOrder {
  return {
    reference: order.reference,
    status: order.status,
    paymentStatus: order.paymentStatus,
    currency: order.currency,
    subtotalAmount: order.subtotalAmount,
    shippingAmount: order.shippingAmount,
    totalAmount: order.totalAmount,
    email: order.customer.email,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitAmount: item.unitAmount,
      lineAmount: item.lineAmount,
    })),
  };
}
