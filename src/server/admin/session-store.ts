import { getPrismaClient } from "../db/client";
import { createSessionToken, hashToken } from "../auth/tokens";

/**
 * Server-managed administrator sessions: the store.
 *
 * Built the same way customer sessions are — a 256-bit random token in an
 * HttpOnly cookie, only its SHA-256 digest in the database, resolution always
 * running cookie → session row → administrator — and sharing the same token
 * primitives, so there is one implementation of the crypto rather than a
 * second, weaker one.
 *
 * What differs is the risk. An operations console reaches every customer's
 * address and every order, so the deadlines are hours rather than weeks.
 *
 * The cookie half lives in `session-cookie.ts`. Splitting them keeps this
 * file free of `next/headers`, so the session rules — expiry, idle,
 * revocation — can be exercised directly against a database in a test rather
 * than only through a running server.
 */

/** Absolute lifetime: eight hours, about one shift. */
export const ADMIN_SESSION_ABSOLUTE_MS = 8 * 60 * 60 * 1000;

/** Idle lifetime: an unattended console stops working after thirty minutes. */
export const ADMIN_SESSION_IDLE_MS = 30 * 60 * 1000;

/**
 * How stale `lastUsedAt` may get before a write is worth it.
 *
 * Much shorter than the customer equivalent because it is what the idle
 * deadline is measured against, and thirty minutes leaves no room for an
 * hour's rounding.
 */
const TOUCH_INTERVAL_MS = 60 * 1000;

export interface AdminSessionContext {
  sessionId: string;
  adminUserId: string;
  expiresAt: Date;
}

export interface IssuedAdminSession {
  token: string;
  expiresAt: Date;
}

/** Creates a session row and returns the token to put in the cookie. */
export async function createAdminSession(
  adminUserId: string,
): Promise<IssuedAdminSession> {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_ABSOLUTE_MS);

  await getPrismaClient().adminSession.create({
    data: { tokenHash: hashToken(token), adminUserId, expiresAt },
  });

  return { token, expiresAt };
}

/**
 * Resolves a cookie token to a live admin session.
 *
 * Null for anything that is not currently valid — unknown, revoked, past its
 * absolute deadline, or idle too long — so no caller can mistake a dead
 * session for a live one.
 */
export async function resolveAdminSession(
  token: string,
): Promise<AdminSessionContext | null> {
  if (!token) {
    return null;
  }

  const prisma = getPrismaClient();
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      adminUserId: true,
      expiresAt: true,
      lastUsedAt: true,
      revokedAt: true,
    },
  });

  if (!session || session.revokedAt) {
    return null;
  }

  const now = Date.now();
  if (session.expiresAt.getTime() <= now) {
    return null;
  }
  if (now - session.lastUsedAt.getTime() > ADMIN_SESSION_IDLE_MS) {
    // Revoked rather than merely ignored, so a request arriving later cannot
    // revive a session that has already timed out.
    await revokeAdminSessionById(session.id);
    return null;
  }

  if (now - session.lastUsedAt.getTime() > TOUCH_INTERVAL_MS) {
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });
  }

  return {
    sessionId: session.id,
    adminUserId: session.adminUserId,
    expiresAt: session.expiresAt,
  };
}

/** Revokes one session. Safe to repeat: a revoked session stays revoked. */
export async function revokeAdminSessionById(sessionId: string): Promise<void> {
  await getPrismaClient().adminSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Revokes every session an administrator holds.
 *
 * Used when an account is deactivated, and available for a "sign out
 * everywhere" control later.
 */
export async function revokeAllAdminSessions(adminUserId: string): Promise<number> {
  const result = await getPrismaClient().adminSession.updateMany({
    where: { adminUserId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}
