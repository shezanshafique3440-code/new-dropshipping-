import {
  adminError,
  adminJson,
  describeAdminError,
  guardAdminRequest,
  readAdminJsonBody,
  requireAdminApi,
} from "@/server/admin/api";
import { revalidateCatalogue } from "@/server/catalog/revalidate";
import {
  removeImage,
  setImageAltText,
  setPrimaryImage,
} from "@/server/media/admin-service";
import { mediaErrorResponse } from "@/server/media/api";

/**
 * One image in a product's gallery.
 *
 * `PATCH` rewrites its alt text or promotes it to the product's primary
 * image; `DELETE` detaches it. Both name the product in the URL and the image
 * within it, and the service scopes every write to that pair — an image id on
 * its own can never reach a different product's gallery.
 *
 * There is no endpoint for editing the storage key, the dimensions or the
 * format. Those describe the bytes, the bytes do not change, and an operator
 * being able to tell the database an image is 4000px wide when it is not
 * would be a layout bug waiting to happen.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000;

interface RouteContext {
  params: Promise<{ slug: string; imageId: string }>;
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const guard = guardAdminRequest({
    request,
    scope: "admin-product-image",
    limit: RATE_LIMIT,
    windowMs: RATE_WINDOW_MS,
  });
  if (!guard.ok) return guard.response;

  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { slug, imageId } = await context.params;
  const body = await readAdminJsonBody(request);
  if (!body.ok) return body.response;

  try {
    if (body.value.primary === true) {
      const outcome = await setPrimaryImage(auth.context.admin, slug, imageId);
      if (!outcome.ok) return mediaErrorResponse(outcome);
      revalidateCatalogue(slug);
      return adminJson({ media: outcome.view });
    }

    if (typeof body.value.altText === "string") {
      const outcome = await setImageAltText(
        auth.context.admin,
        slug,
        imageId,
        body.value.altText,
      );
      if (!outcome.ok) return mediaErrorResponse(outcome);
      revalidateCatalogue(slug);
      return adminJson({ media: outcome.view });
    }

    return adminError(400, "That request asked for no change we can make.");
  } catch (error) {
    console.error(`[media] Image update failed: ${describeAdminError(error)}`);
    return adminError(500, "We could not update that image. Please try again.");
  }
}

export async function DELETE(request: Request, context: RouteContext): Promise<Response> {
  const guard = guardAdminRequest({
    request,
    scope: "admin-product-image-delete",
    limit: RATE_LIMIT,
    windowMs: RATE_WINDOW_MS,
  });
  if (!guard.ok) return guard.response;

  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { slug, imageId } = await context.params;

  try {
    const outcome = await removeImage(auth.context.admin, slug, imageId);
    if (!outcome.ok) return mediaErrorResponse(outcome);

    revalidateCatalogue(slug);
    return adminJson({ media: outcome.view });
  } catch (error) {
    console.error(`[media] Image removal failed: ${describeAdminError(error)}`);
    return adminError(500, "We could not remove that image. Please try again.");
  }
}
