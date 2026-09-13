import { randomInt } from "node:crypto";

/**
 * Customer-facing order references.
 *
 * Stripe's own identifiers are never shown to shoppers: they leak which
 * provider is in use and are awkward to read out to support. A reference is
 * minted once, when the order is created — never before payment.
 */

/** Crockford-ish alphabet: no I, L, O, U, so nothing is misread aloud. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

const REFERENCE_LENGTH = 6;

export const ORDER_REFERENCE_PREFIX = "ZYV";

export function generateOrderReference(): string {
  let body = "";
  for (let index = 0; index < REFERENCE_LENGTH; index += 1) {
    body += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${ORDER_REFERENCE_PREFIX}-${body}`;
}

const REFERENCE_PATTERN = new RegExp(
  `^${ORDER_REFERENCE_PREFIX}-[${ALPHABET}]{${REFERENCE_LENGTH}}$`,
);

export function isOrderReference(value: string): boolean {
  return REFERENCE_PATTERN.test(value);
}
