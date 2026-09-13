import type Stripe from "stripe";
import { NextResponse } from "next/server";

import { getOrderRepository } from "@/server/orders/memory-repository";
import { getWebhookSecret, isPaymentConfigured } from "@/server/payments/config";
import { recordOrderForSession } from "@/server/payments/record-order";
import { getStripeClient } from "@/server/payments/stripe";

/**
 * Stripe webhook.
 *
 * This — not the browser's return trip — is the authoritative confirmation
 * that money moved. The raw body is verified against the endpoint's signing
 * secret before anything is read from it, so a forged POST to this route
 * cannot create an order.
 *
 * Stripe retries deliveries, sometimes for days, and can deliver the same
 * event more than once. Handling is therefore exactly-once on two levels:
 * the event id is claimed before processing, and order creation is itself an
 * upsert keyed on the Checkout Session.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!isPaymentConfigured()) {
    console.error("[webhook] Stripe is not configured; ignoring delivery.");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  // Must be the untouched bytes: any re-serialisation invalidates the signature.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      payload,
      signature,
      getWebhookSecret(),
    );
  } catch (error) {
    console.warn("[webhook] Rejected delivery:", describe(error));
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const repository = getOrderRepository();

  const firstDelivery = await repository.claimEvent(event.id);
  if (!firstDelivery) {
    // Already handled. Acknowledge so Stripe stops retrying.
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    const handled = await handleEvent(repository, event);
    return NextResponse.json({ received: true, handled });
  } catch (error) {
    // A 500 asks Stripe to retry; the claim above is per event id, and the
    // order upsert makes a second attempt safe.
    console.error(`[webhook] Failed to handle ${event.type}:`, describe(error));
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}

async function handleEvent(
  repository: ReturnType<typeof getOrderRepository>,
  event: Stripe.Event,
): Promise<boolean> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const outcome = await recordOrderForSession(repository, session);
      if (outcome.kind === "recorded") {
        console.info(
          `[webhook] ${event.type}: order ${outcome.order.reference} ` +
            `${outcome.created ? "created" : "already existed"} (${outcome.order.paymentStatus}).`,
        );
        return true;
      }
      console.info(`[webhook] ${event.type} ignored: ${outcome.reason}.`);
      return false;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const order = await repository.markFailed(session.id);
      return order !== null;
    }

    case "checkout.session.expired":
      // Nothing was charged and no order was ever created. Nothing to undo.
      return false;

    default:
      return false;
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : "Unknown error";
}
