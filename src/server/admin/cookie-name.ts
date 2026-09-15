/**
 * The admin session cookie's name, on its own.
 *
 * Middleware runs on the edge runtime and must not pull in Prisma or Argon2,
 * so the one constant it shares with the session module lives here by itself.
 *
 * It is deliberately not `zyvero_session`. Two names means the two session
 * stores can never be confused for one another by a helper that reads "the"
 * cookie, and a shopper's browser presenting its ordinary session at an admin
 * route sends nothing the admin resolver even looks at.
 */
export const ADMIN_SESSION_COOKIE = "zyvero_admin_session";
