import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/server/db/config";
import { isPaymentConfigured } from "@/server/payments/config";
import {
  recordOrderForSession,
  toPublicOrder,
} from "@/server/payments/record-order";
import { getStripeClient } from "@/server/payments/stripe";
import { checkRateLimit, clientKey } from "@/server/rate-limit";

/**
 * Server-side verification of a returning shopper.
 *
 * The success page knows only a Checkout Session id. It proves nothing on its
 * own: this endpoint asks Stripe what actually happened to that session, and
 * only Stripe's answer decides whether an order exists. Landing on
 * `/checkout/success` by hand, or editing the id in the address bar, cannot
 * manufacture a payment.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

/** Stripe's own id shape, checked before spending an API call on it. */
const SESSION_ID_PATTERN = /^cs_(test|live)_[A-Za-z0-9]{10,250}$/;

export async function GET(request: Request): Promise<Response> {
  const limit = checkRateLimit(
    clientKey(request, "session-status"),
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  if (!limit.allowed) {
    return json(429, { state: "error", message: "Too many requests." }, {
      "retry-after": String(limit.retryAfter),
    });
  }

  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    return json(400, { state: "not_found" });
  }

  if (!isPaymentConfigured() || !isDatabaseConfigured()) {
    console.error(
      "[payments] Cannot verify payment: Stripe or the database is not configured.",
    );
    return json(503, {
      state: "error",
      message: "Payment verification is unavailable.",
    });
  }

  try {
    const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
    const outcome = await recordOrderForSession(session);

    if (outcome.kind === "recorded" && outcome.order.paymentStatus === "paid") {
      return json(200, { state: "paid", order: toPublicOrder(outcome.order) });
    }

    if (session.status === "expired") {
      return json(200, { state: "expired" });
    }

    if (outcome.kind === "recorded") {
      // Recorded but not paid: a delayed payment method is still settling.
      return json(200, { state: "processing" });
    }

    if (session.status === "complete") {
      return json(200, { state: "processing" });
    }

    return json(200, { state: "incomplete" });
  } catch (error) {
    if (isMissingResource(error)) {
      return json(404, { state: "not_found" });
    }
    console.error("[payments] Payment verification failed:", describe(error));
    return json(502, {
      state: "error",
      message: "We could not confirm your payment just yet.",
    });
  }
}

function isMissingResource(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "resource_missing"
  );
}

function describe(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : "Unknown error";
}

function json(
  status: number,
  body: Record<string, unknown>,
  headers?: Record<string, string>,
): Response {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store", ...headers },
  });
}
