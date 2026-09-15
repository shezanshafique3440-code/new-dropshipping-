import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/server/auth/cookie-name";
import { ADMIN_SESSION_COOKIE } from "@/server/admin/cookie-name";

/**
 * Early gate for the two signed-in areas.
 *
 * This is Next 16's `proxy` convention — the file formerly called
 * `middleware.ts`, renamed because the framework deprecated that name. Same
 * behaviour, same matcher.
 *
 * This is an optimisation, not the authorisation. It only asks whether the
 * relevant cookie is present — cheap enough to do at the edge — and turns "no
 * cookie at all" into a proper HTTP redirect instead of a rendered page that
 * redirects itself a moment later.
 *
 * It proves nothing: a made-up cookie value sails straight through. The real
 * checks are `requireCustomer()` and `requireAdmin()` inside the pages, which
 * resolve the cookie against their own sessions table and are the only things
 * that decide whether anything is shown. Deleting this file would cost a
 * little polish and no security at all.
 *
 * The two areas are kept apart here as well as everywhere else: the account
 * gate never looks at the admin cookie, and the admin gate never looks at the
 * customer one, so neither can stand in for the other even by accident.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");

  const cookie = admin ? ADMIN_SESSION_COOKIE : SESSION_COOKIE;
  if (request.cookies.has(cookie)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = admin ? "/admin/login" : "/login";
  url.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/account",
    "/account/:path*",
    // Everything in the panel except its own sign-in page, which has to stay
    // reachable without a session.
    "/admin",
    "/admin/((?!login).*)",
  ],
};
