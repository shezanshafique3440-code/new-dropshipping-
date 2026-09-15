import type Stripe from "stripe";

import type { Order, OrderShippingAddress, Product } from "@/types";

import { findProductsForRecord } from "../catalog/service";
import type { NewOrder } from "../orders/repository";
import {
  findOrderByCheckoutSession,
  markOrderPaid,
  recordOrder,
  type OrderServiceOptions,
} from "../orders/service";
import { PAYMENT_CURRENCY } from "./config";
import { decodeCartMetadata, sumOrderItems, toOrderItems } from "./line-items";

/**
 * Turning a confirmed Stripe session into an order.
 *
 * This is the only place a Stripe session becomes an order, and both callers
 * — the webhook and the success page's verification endpoint — go through it.
 * Whichever arrives first creates the order; the other finds it. Persistence
 * and the state rules live in the order service below it, so "one payment,
 * one order" is ultimately held by a unique index in PostgreSQL rather than
 * by the ordering of two requests.
 */

export type RecordOutcome =
  | { kind: "recorded"; order: Order; created: boolean }
  | { kind: "ignored"; reason: string };

/**
 * How an order's line names are resolved.
 *
 * Injected, like the checkout parser's price lookup, so this function works
 * against whatever catalogue it is given — the database in the application, a
 * fixture in a test — instead of reaching for one itself.
 */
export type RecordCatalogueLookup = (
  ids: readonly string[],
) => Promise<ReadonlyMap<string, Product>>;

export interface RecordOrderOptions extends OrderServiceOptions {
  catalogue?: RecordCatalogueLookup;
}

export async function recordOrderForSession(
  session: Stripe.Checkout.Session,
  options?: RecordOrderOptions,
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

  const existing = await findOrderByCheckoutSession(session.id, options);
  if (existing) {
    if (paid && existing.paymentStatus !== "paid") {
      const updated = await markOrderPaid(
        session.id,
        readPaymentIntentId(session),
        options,
      );
      return { kind: "recorded", order: updated ?? existing, created: false };
    }
    return { kind: "recorded", order: existing, created: false };
  }

  const { order, created } = await recordOrder(
    await buildDraft(session, paid, options?.catalogue ?? findProductsForRecord),
    options,
  );

  // Someone else created it between the lookup and the insert, and the
  // repository handed us theirs. If theirs is not yet paid but this call
  // knows the payment landed, settle it.
  if (!created && paid && order.paymentStatus !== "paid") {
    const settled = await markOrderPaid(
      session.id,
      readPaymentIntentId(session),
      options,
    );
    return { kind: "recorded", order: settled ?? order, created: false };
  }

  return { kind: "recorded", order, created };
}

async function buildDraft(
  session: Stripe.Checkout.Session,
  paid: boolean,
  lookup: RecordCatalogueLookup,
): Promise<NewOrder> {
  const decoded = decodeCartMetadata(session.metadata);
  // Names and slugs are copied from the catalogue once, here. The lookup
  // deliberately ignores status: the money has moved, so an archived product
  // must still contribute its name rather than leave a line reading as an id.
  const catalogue = decoded
    ? await lookup(decoded.map((line) => line.productId))
    : new Map<string, Product>();
  const items = decoded ? toOrderItems(decoded, catalogue) : [];

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
    customerId: readCustomerId(session),
    shippingAddress: readShippingAddress(session),
    items,
    deliveryOptionId: session.metadata?.deliveryOptionId ?? "",
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: readPaymentIntentId(session),
  };
}

/**
 * The account this order belongs to, if any.
 *
 * Written into the session's metadata by our own server at checkout, so it is
 * as trustworthy as the session that produced it. Shape-checked anyway before
 * it becomes a foreign key.
 */
function readCustomerId(session: Stripe.Checkout.Session): string | null {
  const value = session.metadata?.customerId;
  return typeof value === "string" && UUID_PATTERN.test(value) ? value : null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
