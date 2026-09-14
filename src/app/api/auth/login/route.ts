import {
  authError,
  authJson,
  describeError,
  guardAuthRequest,
  readField,
  readJsonBody,
} from "@/server/auth/api";
import {
  findCustomerForSignIn,
  recordSuccessfulLogin,
} from "@/server/auth/customers";
import { toPublicCustomer } from "@/server/auth/dto";
import { fakeVerifyPassword, verifyPassword } from "@/server/auth/password";
import { createSession, setSessionCookie } from "@/server/auth/sessions";
import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  hasErrors,
  validateLogin,
} from "@/server/auth/validation";
import { safeNextPath } from "@/lib/redirects";

/**
 * Sign-in.
 *
 * One failure message covers every way this can go wrong — unknown address,
 * wrong password, malformed input — because saying which would tell an
 * attacker whether an address is registered. When no account is found, a
 * throwaway hash is computed anyway so the two paths take comparable time and
 * the timing does not answer the question the message refuses to.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 15 * 60 * 1000;

const GENERIC_FAILURE = "Email or password is incorrect.";

export async function POST(request: Request): Promise<Response> {
  const guard = guardAuthRequest({
    request,
    scope: "auth-login",
    limit: RATE_LIMIT,
    windowMs: RATE_WINDOW_MS,
  });
  if (!guard.ok) {
    return guard.response;
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const input = {
    email: readField(body.value, "email", MAX_EMAIL_LENGTH + 1),
    password: readField(body.value, "password", MAX_PASSWORD_LENGTH + 1),
  };

  if (hasErrors(validateLogin(input))) {
    return authError(400, GENERIC_FAILURE);
  }

  try {
    const customer = await findCustomerForSignIn(input.email);

    if (!customer) {
      await fakeVerifyPassword();
      return authError(401, GENERIC_FAILURE);
    }

    const correct = await verifyPassword(customer.passwordHash, input.password);
    if (!correct) {
      return authError(401, GENERIC_FAILURE);
    }

    const session = await createSession(customer.id);
    await setSessionCookie(session.token, session.expiresAt);
    await recordSuccessfulLogin(customer.id);

    return authJson({
      customer: toPublicCustomer(customer),
      next: safeNextPath(readField(body.value, "next", 512)),
    });
  } catch (error) {
    console.error(`[auth] Sign-in failed: ${describeError(error)}`);
    return authError(500, "We could not sign you in. Please try again.");
  }
}
