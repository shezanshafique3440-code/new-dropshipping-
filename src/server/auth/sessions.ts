import { cookies } from "next/headers";

import { getPrismaClient } from "../db/client";
import { SESSION_COOKIE } from "./cookie-name";
import { createSessionToken, hashToken } from "./tokens";

/**
 * Server-managed sessions.
 *
 * The browser holds one thing: a 256-bit random token in an HttpOnly cookie.
 * The database holds only its SHA-256 digest, so someone who reads the
 * sessions table cannot sign in as anybody — there is nothing there to
 * replay. Authority always runs cookie → session row → customer; a customer
 * id from a request body, a query string or a hidden field is never accepted
 * as proof of anything.
 *
 * Two deadlines apply. A session dies 30 days after it was created whatever
 * happens, and 7 days after it was last used. The first bounds the damage
 * from a stolen cookie; the second logs out the laptop left in a hotel lobby,
 * without throwing out a customer who shops every week.
 */

export { SESSION_COOKIE };

/** Absolute lifetime: a session is never valid beyond this, however active. */
export const SESSION_ABSOLUTE_MS = 30 * 24 * 60 * 60 * 1000;

/** Idle lifetime: unused for this long and it stops working. */
export const SESSION_IDLE_MS = 7 * 24 * 60 * 60 * 1000;

/** How stale `lastUsedAt` may get before it is worth a write. */
const TOUCH_INTERVAL_MS = 60 * 60 * 1000;

export interface AuthenticatedSession {
  sessionId: string;
  customerId: string;
  expiresAt: Date;
}

/* -------------------------------------------------------------------------
 * Lifecycle
 * ---------------------------------------------------------------------- */

export interface IssuedSession {
  token: string;
  expiresAt: Date;
}

/** Creates a session row and returns the token to put in the cookie. */
export async function createSession(customerId: string): Promise<IssuedSession> {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_ABSOLUTE_MS);

  await getPrismaClient().customerSession.create({
    data: { tokenHash: hashToken(token), customerId, expiresAt },
  });

  return { token, expiresAt };
}

/**
 * Resolves a cookie token to a live session.
 *
 * Returns null for anything that is not currently valid — unknown, revoked,
 * past its absolute deadline, or idle too long — so a caller cannot
 * accidentally treat a dead session as a live one.
 */
export async function resolveSession(
  token: string,
): Promise<AuthenticatedSession | null> {
  if (!token) {
    return null;
  }

  const prisma = getPrismaClient();
  const session = await prisma.customerSession.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      customerId: true,
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
  if (now - session.lastUsedAt.getTime() > SESSION_IDLE_MS) {
    // Idle too long. Revoked rather than merely ignored, so the row cannot be
    // revived by a later request that happens to arrive.
    await revokeSessionById(session.id);
    return null;
  }

  if (now - session.lastUsedAt.getTime() > TOUCH_INTERVAL_MS) {
    // Rate-limited so a busy session does not write on every request.
    await prisma.customerSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });
  }

  return {
    sessionId: session.id,
    customerId: session.customerId,
    expiresAt: session.expiresAt,
  };
}

/** Revokes one session. Safe to repeat: a revoked session stays revoked. */
export async function revokeSessionById(sessionId: string): Promise<void> {
  await getPrismaClient().customerSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Revokes every session a customer has.
 *
 * Nothing calls this yet. It exists because the model was built for it: a
 * password change or a "sign out everywhere" control is then a call, not a
 * redesign.
 */
export async function revokeAllSessionsForCustomer(
  customerId: string,
): Promise<number> {
  const result = await getPrismaClient().customerSession.updateMany({
    where: { customerId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}

/* -------------------------------------------------------------------------
 * Cookie
 * ---------------------------------------------------------------------- */

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    // Lax, not Strict: the cookie must survive the return trip from Stripe's
    // hosted checkout, which is a cross-site top-level GET. Lax covers that
    // while still withholding the cookie from cross-site POSTs.
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  };
}

export async function setSessionCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", cookieOptions(new Date(0)));
}

export async function readSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}
