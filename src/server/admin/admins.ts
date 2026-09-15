import { getPrismaClient } from "../db/client";
import { normalizeEmail } from "../auth/validation";

/**
 * Administrator records.
 *
 * The only module that reads or writes the admin_users table. Like the
 * customer equivalent it hands out a hand-picked set of columns, so the
 * password hash cannot escape by being part of an object somebody
 * serialised.
 *
 * Administrators are a separate table from customers on purpose. A role
 * column on `customers` would mean one compromised or careless query away
 * from a shopper holding operational access; here there is no row that could
 * grant it.
 */

/** Exactly the columns anything outside this module may see. */
const ADMIN_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type AdminRoleName = "admin";

export interface AdminRecord {
  id: string;
  email: string;
  name: string;
  role: AdminRoleName;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * The administrator behind an id, or null.
 *
 * An account that has been deactivated resolves to null rather than to a
 * record with `isActive: false`: withdrawing access must not depend on every
 * caller remembering to check a flag.
 */
export async function findActiveAdminById(id: string): Promise<AdminRecord | null> {
  const admin = await getPrismaClient().adminUser.findUnique({
    where: { id },
    select: ADMIN_FIELDS,
  });
  return admin?.isActive ? admin : null;
}

/**
 * Looks an administrator up for sign-in, returning the hash with them.
 *
 * The one place an admin password hash is read. It is verified and then
 * discarded; it is never attached to anything that leaves the server.
 *
 * A deactivated account is returned here rather than filtered out, so the
 * caller can still spend the same time verifying the password and answer with
 * the same generic failure — refusing faster would say "this address is a
 * real administrator, just switched off".
 */
export async function findAdminForSignIn(
  email: string,
): Promise<(AdminRecord & { passwordHash: string }) | null> {
  return getPrismaClient().adminUser.findUnique({
    where: { emailNormalized: normalizeEmail(email) },
    select: { ...ADMIN_FIELDS, passwordHash: true },
  });
}

export async function recordAdminLogin(adminUserId: string): Promise<void> {
  await getPrismaClient().adminUser.update({
    where: { id: adminUserId },
    data: { lastLoginAt: new Date() },
  });
}
