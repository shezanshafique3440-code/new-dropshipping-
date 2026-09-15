import { NextResponse } from "next/server";

import { MAX_REQUEST_BYTES, isPaymentConfigured } from "@/server/payments/config";
import { createCheckoutSession } from "@/server/payments/checkout-session";
import { findSellableProducts } from "@/server/catalog/service";
import {
  parseCheckoutRequest,
  type RequestRejection,
} from "@/server/payments/checkout-request";
import { getCurrentCustomer } from "@/server/auth/current-customer";
import { getStripeClient } from "@/server/payments/stripe";
import { checkRateLimit, clientKey } from "@/server/rate-limit";

/**
 * Starts a Stripe Checkout Session.
 *
 * The browser sends product ids and quantities; everything that decides what
 * is charged — prices, line totals, currency, shipping — is resolved here
 * from the catalogue. Errors are answered with a short, safe sentence: a
 * Stripe message or stack trace must never reach the shopper.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

/** Shopper-facing text per rejection. Specific enough to act on, and no more. */
const REJECTION_MESSAGES: Record<RequestRejection["code"], string> = {
  invalid_body: "We could not read your basket. Please reload and try again.",
  empty_cart: "Your cart is empty.",
  too_many_lines: "There are too many different items in this order.",
  unknown_product:
    "One of the items in your cart is no longer available. Please review your cart.",
  unsellable_product:
    "One of the items in your cart is not available to buy right now.",
  invalid_quantity: "One of the quantities in your cart is not valid.",
  invalid_customer: "Please check your contact details and try again.",
  invalid_address: "Please check your delivery address and try again.",
  unknown_delivery_option: "Please choose a delivery method and try again.",
};

export async function POST(request: Request): Promise<Response> {
  const limit = checkRateLimit(
    clientKey(request, "create-session"),
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  if (!limit.allowed) {
    return safeError(429, "Too many attempts. Please wait a moment and retry.", {
      "retry-after": String(limit.retryAfter),
    });
  }

  if (!isPaymentConfigured()) {
    console.error("[payments] Refusing checkout: Stripe is not configured.");
    return safeError(
      503,
      "Payments are temporarily unavailable. Please try again later.",
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_REQUEST_BYTES) {
    return safeError(413, "That request was too large.");
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return safeError(400, REJECTION_MESSAGES.invalid_body);
  }

  // Prices come from the published catalogue in PostgreSQL, never from the
  // request. An unpublished product is not in the lookup, so it cannot be
  // bought.
  const parsed = await parseCheckoutRequest(body, (ids) =>
    findSellableProducts(ids),
  );
  if (!parsed.ok) {
    // The detail is deliberately kept server-side; it names no customer data.
    console.warn(
      `[payments] Rejected checkout request (${parsed.error.code}): ${parsed.error.detail}`,
    );
    return safeError(400, REJECTION_MESSAGES[parsed.error.code], undefined, {
      code: parsed.error.code,
    });
  }

  try {
    // Guest checkout stays first-class: this is null unless a real session
    // cookie resolves to an account, and the browser has no say in it.
    const account = await getCurrentCustomer().catch(() => null);
    const session = await createCheckoutSession(
      getStripeClient(),
      parsed.value,
      account?.customer.id ?? null,
    );
    return NextResponse.json(
      { url: session.url },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    console.error("[payments] Could not create a Checkout Session:", describe(error));
    return safeError(
      502,
      "Unable to start secure checkout. Please try again.",
    );
  }
}

/** Only ever the error type and message — never keys, bodies or customer data. */
function describe(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return "Unknown error";
}

function safeError(
  status: number,
  message: string,
  headers?: Record<string, string>,
  extra?: Record<string, string>,
): Response {
  return NextResponse.json(
    { error: message, ...extra },
    { status, headers: { "cache-control": "no-store", ...headers } },
  );
}
