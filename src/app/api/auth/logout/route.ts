import {
  authError,
  authJson,
  describeError,
  guardAuthRequest,
} from "@/server/auth/api";
import {
  clearSessionCookie,
  readSessionCookie,
  resolveSession,
  revokeSessionById,
} from "@/server/auth/sessions";

/**
 * Sign-out.
 *
 * Revokes the session server-side and clears the cookie. The session to end
 * is the one the cookie resolves to — never one named in the request — so a
 * caller cannot sign anybody else out. Repeating it is harmless: an already
 * revoked or unknown session simply results in the cookie being cleared
 * again, with the same answer either way.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 1000;

export async function POST(request: Request): Promise<Response> {
  const guard = guardAuthRequest({
    request,
    scope: "auth-logout",
    limit: RATE_LIMIT,
    windowMs: RATE_WINDOW_MS,
  });
  if (!guard.ok) {
    return guard.response;
  }

  try {
    const token = await readSessionCookie();
    if (token) {
      const session = await resolveSession(token);
      if (session) {
        await revokeSessionById(session.sessionId);
      }
    }
    await clearSessionCookie();
    return authJson({ signedOut: true });
  } catch (error) {
    console.error(`[auth] Sign-out failed: ${describeError(error)}`);
    // The cookie still goes, so the browser ends up signed out either way.
    await clearSessionCookie();
    return authError(500, "We could not complete sign-out cleanly. Please reload.");
  }
}
