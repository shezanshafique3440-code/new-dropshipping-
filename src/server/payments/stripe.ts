import Stripe from "stripe";

import { getStripeSecretKey } from "./config";

/**
 * The Stripe client.
 *
 * Constructed lazily so that importing this module — during a build, say —
 * never requires credentials, and cached so repeated requests reuse one
 * connection pool. The secret key is read here and nowhere else.
 */

let client: Stripe | null = null;
let clientKey: string | null = null;

export function getStripeClient(): Stripe {
  const key = getStripeSecretKey();
  if (!client || clientKey !== key) {
    client = new Stripe(key, {
      // Pinned so a Stripe-side upgrade cannot change payloads underneath us.
      apiVersion: "2026-08-26.dahlia",
      appInfo: { name: "ZYVERO Storefront" },
      maxNetworkRetries: 2,
      timeout: 20_000,
    });
    clientKey = key;
  }
  return client;
}

export type { Stripe };
