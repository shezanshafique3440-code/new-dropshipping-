import {
  authError,
  authJson,
  describeError,
  guardAuthRequest,
  readField,
  readJsonBody,
} from "@/server/auth/api";
import { createCustomer } from "@/server/auth/customers";
import { toPublicCustomer } from "@/server/auth/dto";
import { createSession, setSessionCookie } from "@/server/auth/sessions";
import {
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  hasErrors,
  validateRegistration,
} from "@/server/auth/validation";
import { safeNextPath } from "@/lib/redirects";

/**
 * Registration.
 *
 * Validates, hashes, inserts, and signs the new customer in. Uniqueness is
 * settled by the database — two simultaneous sign-ups with the same address
 * cannot both succeed — and the password exists only for the length of this
 * request.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Generous for a person, tight for a script working through a word list. */
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request): Promise<Response> {
  const guard = guardAuthRequest({
    request,
    scope: "auth-register",
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
    firstName: readField(body.value, "firstName", MAX_NAME_LENGTH + 1),
    lastName: readField(body.value, "lastName", MAX_NAME_LENGTH + 1),
    email: readField(body.value, "email", MAX_EMAIL_LENGTH + 1),
    password: readField(body.value, "password", MAX_PASSWORD_LENGTH + 1),
    confirmPassword: readField(
      body.value,
      "confirmPassword",
      MAX_PASSWORD_LENGTH + 1,
    ),
  };

  const errors = validateRegistration(input);
  if (hasErrors(errors)) {
    return authError(400, "Please check the details below.", undefined, {
      fields: errors,
    });
  }

  try {
    const result = await createCustomer(input);

    if (!result.ok) {
      // An address that is already registered is a fact the person in front of
      // us needs, and one they can confirm anyway by trying to sign in. It is
      // only exposed here, on a rate-limited endpoint that just took an
      // Argon2id hash's worth of work.
      return authError(409, "An account already exists for that email address.", undefined, {
        fields: { email: "An account already exists for that email address." },
      });
    }

    const session = await createSession(result.customer.id);
    await setSessionCookie(session.token, session.expiresAt);

    return authJson({
      customer: toPublicCustomer(result.customer),
      next: safeNextPath(readField(body.value, "next", 512)),
    });
  } catch (error) {
    console.error(`[auth] Registration failed: ${describeError(error)}`);
    return authError(500, "We could not create your account. Please try again.");
  }
}
