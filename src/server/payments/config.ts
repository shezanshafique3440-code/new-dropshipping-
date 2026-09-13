/**
 * Payment configuration.
 *
 * Server-only: nothing in here may be imported from a client component, and
 * no value read here is ever returned to the browser. Everything that decides
 * *how* payments behave lives in this one module, so going from Stripe test
 * mode to production is an environment change rather than a code change.
 */

export type StripeMode = "test" | "live";

export class PaymentConfigError extends Error {}

/** ISO 4217, lowercase because that is what Stripe expects. */
export const PAYMENT_CURRENCY = "usd";

/**
 * Shipping charged today, in minor units.
 *
 * No fulfilment or carrier integration exists yet, so quoting a delivery fee
 * would be inventing one. Zero is charged and stated plainly; when real rates
 * arrive they replace this constant and the shipping option built from it.
 */
export const SHIPPING_AMOUNT_MINOR = 0;

/**
 * Sales tax is not calculated.
 *
 * Stripe Tax is not registered for this account, so `automatic_tax` stays off
 * and no tax line is invented. Turning it on later is a change here plus the
 * account-side registration — not a hardcoded percentage anywhere.
 */
export const AUTOMATIC_TAX_ENABLED = false;

/** Largest basket the session endpoint will accept, in distinct lines. */
export const MAX_CHECKOUT_LINES = 50;

/** Largest JSON body the session endpoint will read, in bytes. */
export const MAX_REQUEST_BYTES = 32 * 1024;

function readSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new PaymentConfigError("STRIPE_SECRET_KEY is not set.");
  }
  if (!key.startsWith("sk_") && !key.startsWith("rk_")) {
    throw new PaymentConfigError("STRIPE_SECRET_KEY is not a Stripe secret key.");
  }
  if (isLiveKey(key) && process.env.STRIPE_ALLOW_LIVE_MODE !== "true") {
    // A live key on its own is not consent to charge real cards: the deploy
    // has to say so as well, which makes going live a deliberate act.
    throw new PaymentConfigError(
      "A live Stripe key is configured but STRIPE_ALLOW_LIVE_MODE is not \"true\".",
    );
  }
  return key;
}

function isLiveKey(key: string): boolean {
  return key.startsWith("sk_live_") || key.startsWith("rk_live_");
}

export function getStripeSecretKey(): string {
  return readSecretKey();
}

export function getStripeMode(): StripeMode {
  return isLiveKey(readSecretKey()) ? "live" : "test";
}

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new PaymentConfigError("STRIPE_WEBHOOK_SECRET is not set.");
  }
  return secret;
}

/**
 * True when the server has everything it needs to start a payment. Used to
 * answer the browser politely instead of throwing when keys are absent — for
 * example in a fresh clone that has not been given Stripe credentials.
 */
export function isPaymentConfigured(): boolean {
  try {
    readSecretKey();
    return true;
  } catch {
    return false;
  }
}

/**
 * Absolute origin used to build Stripe's return URLs.
 *
 * Deliberately read from configuration rather than the request's Host header:
 * a forged header must never be able to point Stripe's redirect at another
 * site.
 */
export function getPaymentReturnOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return "http://localhost:3000";
  }
  try {
    return new URL(raw).origin;
  } catch {
    throw new PaymentConfigError("NEXT_PUBLIC_SITE_URL is not a valid URL.");
  }
}
