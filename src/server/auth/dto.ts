import type { CustomerRecord } from "./customers";

/**
 * What the browser is allowed to know about an account.
 *
 * Hand-shaped on purpose. A Prisma row is never serialised straight into a
 * response: the password hash, and anything else added to the table later,
 * cannot leak through a field nobody remembered to strip.
 */
export interface PublicCustomer {
  /** Present because the UI greets people by name — not as an ownership token. */
  firstName: string;
  lastName: string;
  email: string;
  /** ISO 8601. Shown as "member since". */
  createdAt: string;
  /** ISO 8601, or null before the first sign-in after registering. */
  lastLoginAt: string | null;
  emailVerified: boolean;
}

export function toPublicCustomer(customer: CustomerRecord): PublicCustomer {
  return {
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    createdAt: customer.createdAt.toISOString(),
    lastLoginAt: customer.lastLoginAt?.toISOString() ?? null,
    emailVerified: customer.emailVerifiedAt !== null,
  };
}
