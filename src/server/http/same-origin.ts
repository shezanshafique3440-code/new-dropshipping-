/**
 * Cross-site request forgery protection for cookie-authenticated endpoints.
 *
 * The session cookie is `SameSite=Lax`, which already stops a cross-site form
 * or fetch from carrying it on a POST. That is the main defence, but it is one
 * mechanism, and browsers have had bugs in it — so every state-changing
 * endpoint also checks that the request says it came from this site.
 *
 * `Origin` is sent by browsers on all cross-origin requests and on every POST
 * from a modern browser; it cannot be forged by page JavaScript. `Referer` is
 * accepted as a fallback for the rare client that omits `Origin`. A request
 * carrying neither is refused rather than trusted.
 *
 * Note what this is not: being HttpOnly does nothing for CSRF. It stops a
 * script reading the cookie, not a browser attaching it.
 */

export type OriginCheck =
  | { ok: true }
  | { ok: false; reason: "missing-origin" | "cross-origin" };

/**
 * The origins this deployment answers to.
 *
 * Taken from configuration, plus the request's own Host — which is safe here
 * because the comparison is "does the browser think it is talking to the same
 * place it is actually talking to", not "is this host trusted".
 */
function allowedOrigins(request: Request): Set<string> {
  const origins = new Set<string>();

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      origins.add(new URL(configured).origin);
    } catch {
      // A malformed value simply contributes nothing.
    }
  }

  const host = request.headers.get("host");
  if (host) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const protocol =
      forwardedProto?.split(",")[0]?.trim() ??
      (process.env.NODE_ENV === "production" ? "https" : "http");
    origins.add(`${protocol}://${host}`);
  }

  return origins;
}

export function checkSameOrigin(request: Request): OriginCheck {
  const allowed = allowedOrigins(request);

  const origin = request.headers.get("origin");
  if (origin) {
    return allowed.has(origin) ? { ok: true } : { ok: false, reason: "cross-origin" };
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return allowed.has(new URL(referer).origin)
        ? { ok: true }
        : { ok: false, reason: "cross-origin" };
    } catch {
      return { ok: false, reason: "cross-origin" };
    }
  }

  return { ok: false, reason: "missing-origin" };
}
