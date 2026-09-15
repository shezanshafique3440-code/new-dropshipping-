import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE } from "./cookie-name";

/**
 * The admin session cookie.
 *
 * Separated from the session store so the store can be tested without Next's
 * request-scoped APIs, and so there is exactly one place that decides how
 * this cookie is written.
 */

export { ADMIN_SESSION_COOKIE };

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    // Strict, unlike the storefront's Lax cookie: nothing legitimately
    // navigates into the admin panel from another site, so the cookie should
    // not travel on such a navigation either.
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    // The panel lives under two prefixes — the pages at /admin and the
    // endpoints at /api/admin — and a cookie carries one Path, so this is "/"
    // rather than something narrower. Nothing reads it outside the admin
    // resolver, and no storefront code path even knows its name.
    path: "/",
    expires,
  };
}

export async function setAdminSessionCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, cookieOptions(expiresAt));
}

export async function clearAdminSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, "", cookieOptions(new Date(0)));
}

export async function readAdminSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(ADMIN_SESSION_COOKIE)?.value ?? null;
}
