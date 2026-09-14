import { hash, verify } from "@node-rs/argon2";

import { MAX_PASSWORD_LENGTH } from "./validation";

/**
 * Password hashing.
 *
 * Argon2id, the algorithm OWASP recommends first for password storage: it is
 * memory-hard, so an attacker with GPUs gains far less than they would against
 * a purely iterative hash. `@node-rs/argon2` ships prebuilt binaries, so it
 * needs no compiler on the deployment host.
 *
 * Parameters follow the OWASP minimum (19 MiB, 2 iterations, 1 lane), which
 * takes tens of milliseconds per attempt here — slow enough to make offline
 * cracking expensive, fast enough that a login does not feel it.
 *
 * A plaintext password exists only for the length of the request that carries
 * it: it is hashed, and never logged, echoed, stored or returned.
 */

const OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export { MAX_PASSWORD_LENGTH };

export async function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

/**
 * Checks a password against a stored hash.
 *
 * Returns false rather than throwing on a malformed hash, so one bad row can
 * never turn a failed login into a 500 that reveals it exists.
 */
export async function verifyPassword(
  storedHash: string,
  password: string,
): Promise<boolean> {
  try {
    return await verify(storedHash, password, OPTIONS);
  } catch {
    return false;
  }
}

/**
 * Burns comparable time when no account was found.
 *
 * Without this, "no such email" would answer measurably faster than "wrong
 * password", and the timing alone would tell an attacker which addresses are
 * registered.
 */
export async function fakeVerifyPassword(): Promise<void> {
  await hash("timing-equalisation-only", OPTIONS);
}
