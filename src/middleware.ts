import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/server/auth/cookie-name";

/**
 * Early gate for the account area.
 *
 * This is an optimisation, not the authorisation. It only asks whether a
 * session cookie is present, which is cheap enough to do at the edge and
 * turns "no cookie at all" into a proper HTTP redirect instead of a rendered
 * page that redirects itself a moment later.
 *
 * It proves nothing: a made-up cookie value sails straight through. The real
 * check is `requireCustomer()` inside the page, which resolves the cookie
 * against the sessions table and is the only thing that decides whether the
 * account is shown. Deleting this file would cost a little polish and no
 * security at all.
 */
export function middleware(request: NextRequest) {
  const hasCookie = request.cookies.has(SESSION_COOKIE);
  if (hasCookie) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/account", "/account/:path*"],
};
