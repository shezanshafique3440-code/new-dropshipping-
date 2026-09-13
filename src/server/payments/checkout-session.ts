import type Stripe from "stripe";

import { findDeliveryOption } from "@/data/checkout-options";

import {
  AUTOMATIC_TAX_ENABLED,
  PAYMENT_CURRENCY,
  SHIPPING_AMOUNT_MINOR,
  getPaymentReturnOrigin,
} from "./config";
import type { TrustedCheckoutRequest } from "./checkout-request";
import { buildStripeLineItems, encodeCartMetadata } from "./line-items";

/**
 * Creating the Stripe Checkout Session.
 *
 * Stripe hosts the payment page, so card number, expiry and CVC are entered
 * on Stripe's domain and never touch this application — that is the whole
 * reason for choosing Checkout over Elements here. Everything below is
 * assembled from server-trusted values.
 */

export interface CreatedSession {
  id: string;
  /** Where to send the browser. Stripe guarantees this is on its own domain. */
  url: string;
}

export async function createCheckoutSession(
  stripe: Stripe,
  request: TrustedCheckoutRequest,
): Promise<CreatedSession> {
  const origin = getPaymentReturnOrigin();
  const delivery = findDeliveryOption(request.deliveryOptionId);
  const customerName =
    `${request.information.firstName} ${request.information.lastName}`.trim();

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: buildStripeLineItems(request.lines),
    customer_email: request.information.email,
    // The address was already collected and validated by our own form, so
    // Stripe is given it rather than asking the shopper for it a second time.
    payment_intent_data: {
      shipping: {
        name: `${request.address.firstName} ${request.address.lastName}`.trim(),
        phone: request.address.phone || request.information.phone || undefined,
        address: {
          line1: request.address.address1,
          line2: request.address.address2 || undefined,
          city: request.address.city,
          state: request.address.region || undefined,
          postal_code: request.address.postalCode || undefined,
          country: request.address.country,
        },
      },
    },
    // A zero-cost rate, so the shopper sees the method they chose and the
    // total on Stripe's page matches ours. No delivery fee is invented.
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: delivery?.name ?? "Delivery",
          fixed_amount: {
            amount: SHIPPING_AMOUNT_MINOR,
            currency: PAYMENT_CURRENCY,
          },
        },
      },
    ],
    automatic_tax: { enabled: AUTOMATIC_TAX_ENABLED },
    metadata: {
      ...encodeCartMetadata(request.lines),
      deliveryOptionId: request.deliveryOptionId,
      customerName,
      shippingLine1: request.address.address1,
      shippingLine2: request.address.address2,
      shippingCity: request.address.city,
      shippingRegion: request.address.region,
      shippingPostalCode: request.address.postalCode,
      shippingCountry: request.address.country,
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?payment=cancelled`,
  };

  const session = await stripe.checkout.sessions.create(
    params,
    // Retrying the same attempt — a double click, a flaky connection — returns
    // the session already created instead of opening a second one.
    request.requestId ? { idempotencyKey: `checkout:${request.requestId}` } : {},
  );

  if (!session.url || !session.url.startsWith("https://")) {
    throw new Error("Stripe returned a session without a usable redirect URL.");
  }

  return { id: session.id, url: session.url };
}
