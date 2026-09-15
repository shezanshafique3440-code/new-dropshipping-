import type { AdminRecord } from "./admins";

/**
 * What the browser is allowed to know about an administrator.
 *
 * Hand-shaped, like every other response in this project: the password hash,
 * the internal id and anything added to the table later cannot leak through a
 * field nobody remembered to strip. The id in particular stays server-side —
 * the panel never needs it, and a client that cannot see it cannot try to
 * send it back.
 */
export interface PublicAdmin {
  name: string;
  email: string;
  role: string;
  /** ISO 8601, or null before the first sign-in. */
  lastLoginAt: string | null;
}

export function toPublicAdmin(admin: AdminRecord): PublicAdmin {
  return {
    name: admin.name,
    email: admin.email,
    role: admin.role,
    lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
  };
}
