import { redirect } from "next/navigation";

import { adminLoginHref } from "@/lib/routes";

import { findActiveAdminById, type AdminRecord } from "./admins";
import { readAdminSessionCookie } from "./session-cookie";
import { resolveAdminSession } from "./session-store";

/**
 * Who is operating the panel.
 *
 * Every admin page and every admin endpoint asks `requireAdmin()` rather than
 * reading a cookie itself, so the resolution path — admin cookie → admin
 * session row → active administrator — exists once and cannot drift. Nothing
 * else is ever accepted as identity: not an id in a body, not a role in a
 * query string, not a header, and not the customer session cookie, whose name
 * this path never even looks at.
 */

export interface AdminContext {
  sessionId: string;
  admin: AdminRecord;
}

/**
 * The signed-in administrator, or null.
 *
 * Read-only, deliberately. A cookie that no longer resolves — revoked,
 * expired, idle, or belonging to an account that has been deactivated or
 * deleted — is simply not honoured; it is not cleared here, because writing
 * a cookie while a page renders is something Next.js refuses, and an attempt
 * to do it turns what should be a redirect to sign-in into a render error.
 * Cookies are written where that is allowed: the sign-in and sign-out route
 * handlers.
 *
 * Leaving the stale value in place costs nothing. It resolves to nobody on
 * every request, and the next sign-in overwrites it.
 */
export async function getCurrentAdmin(): Promise<AdminContext | null> {
  const token = await readAdminSessionCookie();
  if (!token) {
    return null;
  }

  const session = await resolveAdminSession(token);
  if (!session) {
    return null;
  }

  const admin = await findActiveAdminById(session.adminUserId);
  if (!admin) {
    return null;
  }

  return { sessionId: session.sessionId, admin };
}

/**
 * The signed-in administrator, or a redirect to the admin sign-in page.
 *
 * This is the authorization, and it runs on the server before a page's data
 * is assembled. The middleware in front of it only notices whether a cookie
 * is present, which proves nothing.
 */
export async function requireAdmin(returnTo?: string): Promise<AdminContext> {
  const context = await getCurrentAdmin();
  if (!context) {
    redirect(adminLoginHref(returnTo));
  }
  return context;
}

/** For the admin sign-in page, which only makes sense signed out. */
export async function requireSignedOutAdmin(destination = "/admin"): Promise<void> {
  const context = await getCurrentAdmin();
  if (context) {
    redirect(destination);
  }
}
