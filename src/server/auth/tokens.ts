import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Session token material.
 *
 * Separated from the session store so the crypto can be reasoned about — and
 * tested — without dragging in the database or Next's cookie API.
 *
 * The token is 256 bits from the OS random source. `Math.random`, timestamps,
 * counters, email addresses and record ids are all unusable here: a session
 * token has to be unguessable even to someone who knows everything else about
 * the account.
 */

const TOKEN_BYTES = 32;

export function createSessionToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/**
 * What the database stores.
 *
 * A plain SHA-256, not a password hash: the input is already 256 bits of
 * randomness, so there is nothing to brute-force and nothing for a slow KDF
 * to protect against — while a fast digest keeps every request cheap.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Constant-time digest comparison, for callers that compare two hashes. */
export function digestsMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}
