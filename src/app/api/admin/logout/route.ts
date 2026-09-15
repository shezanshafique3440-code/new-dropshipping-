import {
  adminError,
  adminJson,
  describeAdminError,
  guardAdminRequest,
} from "@/server/admin/api";
import {
  clearAdminSessionCookie,
  readAdminSessionCookie,
} from "@/server/admin/session-cookie";
import {
  resolveAdminSession,
  revokeAdminSessionById,
} from "@/server/admin/session-store";

/**
 * Admin sign-out.
 *
 * The session row is revoked server-side, then the cookie is cleared. Doing
 * only the second would leave a token that still works if it were ever
 * captured, so the revocation is the point and the cookie is the tidy-up.
 *
 * The session ended is the one the cookie resolves to — never one named in
 * the request — so nobody can sign anybody else out. Repeating it is
 * harmless.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 1000;

export async function POST(request: Request): Promise<Response> {
  const guard = guardAdminRequest({
    request,
    scope: "admin-logout",
    limit: RATE_LIMIT,
    windowMs: RATE_WINDOW_MS,
  });
  if (!guard.ok) {
    return guard.response;
  }

  try {
    const token = await readAdminSessionCookie();
    if (token) {
      const session = await resolveAdminSession(token);
      if (session) {
        await revokeAdminSessionById(session.sessionId);
      }
    }
    await clearAdminSessionCookie();
    return adminJson({ signedOut: true });
  } catch (error) {
    console.error(`[admin] Sign-out failed: ${describeAdminError(error)}`);
    await clearAdminSessionCookie();
    return adminError(500, "We could not complete sign-out cleanly. Please reload.");
  }
}
