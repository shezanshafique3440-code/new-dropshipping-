/**
 * The session cookie's name, on its own.
 *
 * Middleware runs on the edge runtime and must not pull in Prisma, Argon2 or
 * anything else the session module needs, so the one constant both sides
 * share lives here by itself.
 */
export const SESSION_COOKIE = "zyvero_session";
