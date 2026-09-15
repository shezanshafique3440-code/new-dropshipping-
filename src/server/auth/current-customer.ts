import { redirect } from "next/navigation";

import { loginHref } from "@/lib/routes";

import { findCustomerById, type CustomerRecord } from "./customers";
import { readSessionCookie, resolveSession } from "./sessions";

/**
 * Who is making this request.
 *
 * Every protected page and endpoint asks these helpers rather than reading a
 * cookie itself, so the resolution path — cookie → session row → customer —
 * exists once and cannot drift. Nothing else is ever accepted as identity: not
 * a body field, not a query parameter, not a header the browser controls.
 */

export interface AuthenticatedContext {
  sessionId: string;
  customer: CustomerRecord;
}

/**
 * The signed-in customer, or null.
 *
 * Read-only. A cookie that no longer resolves — revoked, expired, or simply
 * unknown — is not honoured, and is left alone rather than cleared: Next.js
 * refuses a cookie write during a render, and attempting one turns the
 * redirect to sign-in into a render error instead. The cookie is written
 * where that is allowed, in the sign-in and sign-out route handlers, and a
 * stale value resolves to nobody until then.
 */
export async function getCurrentCustomer(): Promise<AuthenticatedContext | null> {
  const token = await readSessionCookie();
  if (!token) {
    return null;
  }

  const session = await resolveSession(token);
  if (!session) {
    return null;
  }

  const customer = await findCustomerById(session.customerId);
  if (!customer) {
    return null;
  }

  return { sessionId: session.sessionId, customer };
}

/**
 * The signed-in customer, or a redirect to sign in.
 *
 * `next` is carried so the customer lands where they were going. It is
 * validated on the way out again — see `safeNextPath`.
 */
export async function requireCustomer(
  returnTo?: string,
): Promise<AuthenticatedContext> {
  const context = await getCurrentCustomer();
  if (!context) {
    redirect(loginHref(returnTo));
  }
  return context;
}

/** For pages that only make sense signed out, like sign-in itself. */
export async function requireGuest(destination = "/account"): Promise<void> {
  const context = await getCurrentCustomer();
  if (context) {
    redirect(destination);
  }
}
