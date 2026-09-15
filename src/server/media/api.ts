import { adminError } from "@/server/admin/api";

import type { MediaOutcome } from "./admin-service";

/**
 * Turns a media service refusal into a response, once.
 *
 * Kept out of the route files because a Next route module may only export
 * handlers, and because three endpoints answering the same refusals three
 * slightly different ways is how a 404 eventually becomes a 500.
 */
export function mediaErrorResponse(
  outcome: Extract<MediaOutcome, { ok: false }>,
): Response {
  switch (outcome.reason) {
    case "not-found":
      return adminError(404, outcome.message);
    case "stale":
    case "read-only":
      return adminError(409, outcome.message);
    case "last-image":
    case "too-many":
    case "invalid":
      return adminError(422, outcome.message);
    default:
      return adminError(400, "That change could not be applied.");
  }
}
