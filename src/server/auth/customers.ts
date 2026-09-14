import { getPrismaClient } from "../db/client";
import { hashPassword } from "./password";
import { normalizeEmail } from "./validation";

/**
 * Customer records.
 *
 * The only module that reads or writes the customers table. Everything above
 * it works with `PublicCustomer` (see `dto.ts`) — the password hash never
 * leaves this file, and no caller can accidentally serialise a row that
 * contains it.
 */

/** Exactly the columns anything outside this module is allowed to see. */
const PUBLIC_FIELDS = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface CustomerRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCustomerResult =
  | { ok: true; customer: CustomerRecord }
  | { ok: false; reason: "email-taken" };

const UNIQUE_VIOLATION = "P2002";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION
  );
}

/**
 * Registers a customer.
 *
 * Uniqueness is decided by the database, not by looking first: two
 * simultaneous sign-ups with the same address would both pass a "does this
 * exist?" check, and only the unique index can actually stop the second one.
 */
export async function createCustomer(input: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}): Promise<CreateCustomerResult> {
  const passwordHash = await hashPassword(input.password);

  try {
    const customer = await getPrismaClient().customer.create({
      data: {
        email: input.email.trim(),
        emailNormalized: normalizeEmail(input.email),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        passwordHash,
      },
      select: PUBLIC_FIELDS,
    });
    return { ok: true, customer };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, reason: "email-taken" };
    }
    throw error;
  }
}

export async function findCustomerById(
  id: string,
): Promise<CustomerRecord | null> {
  return getPrismaClient().customer.findUnique({
    where: { id },
    select: PUBLIC_FIELDS,
  });
}

/**
 * Looks a customer up for sign-in, returning the hash with them.
 *
 * The one place a password hash is read. It is used to verify and then
 * discarded — it is never attached to anything that leaves the server.
 */
export async function findCustomerForSignIn(
  email: string,
): Promise<(CustomerRecord & { passwordHash: string }) | null> {
  return getPrismaClient().customer.findUnique({
    where: { emailNormalized: normalizeEmail(email) },
    select: { ...PUBLIC_FIELDS, passwordHash: true },
  });
}

export async function recordSuccessfulLogin(customerId: string): Promise<void> {
  await getPrismaClient().customer.update({
    where: { id: customerId },
    data: { lastLoginAt: new Date() },
  });
}

/**
 * Updates the parts of a profile a customer may change themselves.
 *
 * Email is not among them: changing the identity a login and an order history
 * hang from needs verification of the new address, which is not built yet, so
 * the field stays read-only rather than half-implemented.
 */
export async function updateCustomerProfile(
  customerId: string,
  input: { firstName: string; lastName: string },
): Promise<CustomerRecord> {
  return getPrismaClient().customer.update({
    where: { id: customerId },
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
    },
    select: PUBLIC_FIELDS,
  });
}
