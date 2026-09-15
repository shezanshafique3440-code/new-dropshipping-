import {
  adminError,
  adminJson,
  describeAdminError,
  guardAdminRequest,
  readAdminField,
  readAdminJsonBody,
} from "@/server/admin/api";
import { findAdminForSignIn, recordAdminLogin } from "@/server/admin/admins";
import { toPublicAdmin } from "@/server/admin/dto";
import { setAdminSessionCookie } from "@/server/admin/session-cookie";
import { createAdminSession } from "@/server/admin/session-store";
import { fakeVerifyPassword, verifyPassword } from "@/server/auth/password";
import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  hasErrors,
  validateLogin,
} from "@/server/auth/validation";
import { safeAdminPath } from "@/lib/redirects";

/**
 * Admin sign-in.
 *
 * One failure message covers every way this can go wrong — unknown address,
 * wrong password, deactivated account, malformed input — because saying which
 * would tell somebody probing the panel that an address is a real
 * administrator. When no account is found a throwaway Argon2id hash is
 * computed anyway, so the two paths take comparable time and the timing does
 * not answer the question the message refuses to.
 *
 * The limit is tighter than the storefront's: there are a handful of
 * administrators, so a handful of attempts is generous.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

const GENERIC_FAILURE = "Invalid email or password.";

export async function POST(request: Request): Promise<Response> {
  const guard = guardAdminRequest({
    request,
    scope: "admin-login",
    limit: RATE_LIMIT,
    windowMs: RATE_WINDOW_MS,
  });
  if (!guard.ok) {
    return guard.response;
  }

  const body = await readAdminJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const input = {
    email: readAdminField(body.value, "email", MAX_EMAIL_LENGTH + 1),
    password: readAdminField(body.value, "password", MAX_PASSWORD_LENGTH + 1),
  };

  if (hasErrors(validateLogin(input))) {
    return adminError(400, GENERIC_FAILURE);
  }

  try {
    const admin = await findAdminForSignIn(input.email);

    if (!admin) {
      await fakeVerifyPassword();
      return adminError(401, GENERIC_FAILURE);
    }

    const correct = await verifyPassword(admin.passwordHash, input.password);
    // The password is verified even for a deactivated account, and the answer
    // is the same either way: whoever is typing learns nothing about which
    // addresses are administrators.
    if (!correct || !admin.isActive) {
      return adminError(401, GENERIC_FAILURE);
    }

    const session = await createAdminSession(admin.id);
    await setAdminSessionCookie(session.token, session.expiresAt);
    await recordAdminLogin(admin.id);

    return adminJson({
      admin: toPublicAdmin(admin),
      next: safeAdminPath(readAdminField(body.value, "next", 512)),
    });
  } catch (error) {
    console.error(`[admin] Sign-in failed: ${describeAdminError(error)}`);
    return adminError(500, "We could not sign you in. Please try again.");
  }
}
