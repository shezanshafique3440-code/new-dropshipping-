import type Stripe from "stripe";

import { findProductById } from "@/lib/catalog";
import { lineAmount, sumMinorUnits } from "@/lib/money";
import type { OrderItem } from "@/types";

import { PAYMENT_CURRENCY } from "./config";
import type { TrustedLine } from "./checkout-request";

/**
 * Turning trusted basket lines into Stripe line items, and back again.
 *
 * Stripe is told the exact integer amount to charge per unit; it never sees a
 * price the browser sent. The same lines are also written into the session's
 * metadata so that, when the payment is later confirmed by webhook, the order
 * can be built from what was actually charged without a second API round-trip
 * (which would otherwise be a network call in the middle of a webhook).
 */

export function buildStripeLineItems(
  lines: readonly TrustedLine[],
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return lines.map((line) => ({
    quantity: line.quantity,
    price_data: {
      currency: PAYMENT_CURRENCY,
      unit_amount: line.unitAmount,
      product_data: {
        name: line.product.name,
        description: line.product.category,
        metadata: { productId: line.product.id },
      },
    },
  }));
}

/* -------------------------------------------------------------------------
 * Basket metadata
 *
 * Stripe allows 50 metadata keys of 500 characters each. One line encodes as
 * `productId:quantity:unitAmount`, and the string is split across as many
 * `items_N` keys as it needs, so a large basket cannot silently truncate.
 * ---------------------------------------------------------------------- */

const METADATA_CHUNK_SIZE = 480;
const MAX_METADATA_CHUNKS = 8;
const CHUNK_PREFIX = "items_";

export class CartMetadataError extends Error {}

export function encodeCartMetadata(
  lines: readonly TrustedLine[],
): Record<string, string> {
  const encoded = lines
    .map((line) => `${line.product.id}:${line.quantity}:${line.unitAmount}`)
    .join(",");

  const chunks: string[] = [];
  for (let index = 0; index < encoded.length; index += METADATA_CHUNK_SIZE) {
    chunks.push(encoded.slice(index, index + METADATA_CHUNK_SIZE));
  }
  if (chunks.length > MAX_METADATA_CHUNKS) {
    throw new CartMetadataError("Basket is too large to record on the session.");
  }

  const metadata: Record<string, string> = { items_count: String(chunks.length) };
  chunks.forEach((chunk, index) => {
    metadata[`${CHUNK_PREFIX}${index}`] = chunk;
  });
  return metadata;
}

export interface DecodedLine {
  productId: string;
  quantity: number;
  unitAmount: number;
}

/** Rebuilds the basket from session metadata. Returns null if it is unusable. */
export function decodeCartMetadata(
  metadata: Stripe.Metadata | null | undefined,
): readonly DecodedLine[] | null {
  if (!metadata) {
    return null;
  }
  const count = Number(metadata.items_count);
  if (!Number.isInteger(count) || count < 1 || count > MAX_METADATA_CHUNKS) {
    return null;
  }

  let encoded = "";
  for (let index = 0; index < count; index += 1) {
    const chunk = metadata[`${CHUNK_PREFIX}${index}`];
    if (typeof chunk !== "string") {
      return null;
    }
    encoded += chunk;
  }

  const lines: DecodedLine[] = [];
  for (const part of encoded.split(",")) {
    const [productId, quantity, unitAmount] = part.split(":");
    const parsedQuantity = Number(quantity);
    const parsedUnit = Number(unitAmount);
    if (
      !productId ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1 ||
      !Number.isInteger(parsedUnit) ||
      parsedUnit < 0
    ) {
      return null;
    }
    lines.push({ productId, quantity: parsedQuantity, unitAmount: parsedUnit });
  }

  return lines.length > 0 ? lines : null;
}

/**
 * Expands decoded lines into order items.
 *
 * Amounts come from the session (what was charged); names and slugs come from
 * the catalogue, falling back to the recorded id if a product has since been
 * withdrawn, so a paid order is never lost to a catalogue edit.
 */
export function toOrderItems(lines: readonly DecodedLine[]): readonly OrderItem[] {
  return lines.map((line) => {
    const product = findProductById(line.productId);
    return {
      productId: line.productId,
      slug: product?.slug ?? line.productId,
      name: product?.name ?? line.productId,
      quantity: line.quantity,
      unitAmount: line.unitAmount,
      lineAmount: lineAmount(line.unitAmount, line.quantity),
    };
  });
}

export function sumOrderItems(items: readonly OrderItem[]): number {
  return sumMinorUnits(items.map((item) => item.lineAmount));
}
