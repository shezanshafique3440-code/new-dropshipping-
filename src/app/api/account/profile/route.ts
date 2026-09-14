import {
  authError,
  authJson,
  describeError,
  guardAuthRequest,
  readField,
  readJsonBody,
} from "@/server/auth/api";
import { getCurrentCustomer } from "@/server/auth/current-customer";
import { updateCustomerProfile } from "@/server/auth/customers";
import { toPublicCustomer } from "@/server/auth/dto";
import {
  MAX_NAME_LENGTH,
  hasErrors,
  validateProfile,
} from "@/server/auth/validation";

/**
 * Profile updates.
 *
 * The account being changed is the one the session cookie resolves to. Any
 * `customerId`, `email` or `id` in the body is ignored outright — this
 * endpoint has no way to address another account, so there is nothing to
 * authorise against and nothing to get wrong.
 *
 * Email is not editable here: changing the address a login and an order
 * history hang from needs verification of the new one, which is not built.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 15 * 60 * 1000;

export async function PATCH(request: Request): Promise<Response> {
  const guard = guardAuthRequest({
    request,
    scope: "account-profile",
    limit: RATE_LIMIT,
    windowMs: RATE_WINDOW_MS,
  });
  if (!guard.ok) {
    return guard.response;
  }

  const context = await getCurrentCustomer();
  if (!context) {
    return authError(401, "Please sign in to update your account.");
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const input = {
    firstName: readField(body.value, "firstName", MAX_NAME_LENGTH + 1),
    lastName: readField(body.value, "lastName", MAX_NAME_LENGTH + 1),
  };

  const errors = validateProfile(input);
  if (hasErrors(errors)) {
    return authError(400, "Please check the details below.", undefined, {
      fields: errors,
    });
  }

  try {
    const updated = await updateCustomerProfile(context.customer.id, input);
    return authJson({ customer: toPublicCustomer(updated) });
  } catch (error) {
    console.error(`[account] Profile update failed: ${describeError(error)}`);
    return authError(500, "We could not save those changes. Please try again.");
  }
}
