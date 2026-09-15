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
  addUploadedImage,
  MAX_UPLOAD_BYTES,
  reorderImages,
} from "@/server/media/admin-service";
import { mediaErrorResponse } from "@/server/media/api";

/**
 * A product's gallery, as a whole.
 *
 * `POST` stores an uploaded image; `PATCH` rewrites the gallery order. Both
 * run the panel's standard guard first — same origin, database present, rate
 * limited — and then resolve an administrator from the admin session cookie.
 * Nothing in the URL, the body or a header decides who the caller is.
 *
 * The upload is a real upload: the bytes go through the media storage driver
 * and the row records what the header says they are. Where the driver cannot
 * accept writes, `POST` says so with a 409 rather than accepting a file and
 * quietly dropping it — the panel reads the same flag and does not draw the
 * form at all.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 40;
const RATE_WINDOW_MS = 60 * 1000;

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const guard = guardAdminRequest({
    request,
    scope: "admin-product-image-upload",
    limit: 12,
    windowMs: RATE_WINDOW_MS,
  });
  if (!guard.ok) return guard.response;

  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { slug } = await context.params;

  // Checked before the body is read, so an oversized upload is refused at the
  // door rather than after it has been buffered into this process.
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_UPLOAD_BYTES * 1.1) {
    return adminError(413, "That image is too large.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return adminError(400, "We could not read that upload.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return adminError(400, "Choose an image to upload.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return adminError(413, "That image is too large.");
  }

  const altText = typeof form.get("altText") === "string" ? String(form.get("altText")) : "";
  const label = typeof form.get("label") === "string" ? String(form.get("label")) : "";

  try {
    // The filename is deliberately ignored: it is attacker-controlled, and the
    // storage key is built from the product's slug and the bytes' own hash.
    const bytes = new Uint8Array(await file.arrayBuffer());
    const outcome = await addUploadedImage(auth.context.admin, slug, {
      bytes,
      altText,
      label,
    });
    if (!outcome.ok) return mediaErrorResponse(outcome);

    revalidateCatalogue(slug);
    return adminJson({ media: outcome.view }, { status: 201 });
  } catch (error) {
    console.error(`[media] Upload failed: ${describeAdminError(error)}`);
    return adminError(500, "We could not store that image. Please try again.");
  }
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const guard = guardAdminRequest({
    request,
    scope: "admin-product-image-order",
    limit: RATE_LIMIT,
    windowMs: RATE_WINDOW_MS,
  });
  if (!guard.ok) return guard.response;

  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { slug } = await context.params;
  const body = await readAdminJsonBody(request);
  if (!body.ok) return body.response;

  const order = body.value.order;
  if (!Array.isArray(order) || !order.every((id) => typeof id === "string")) {
    return adminError(400, "That is not a gallery order.");
  }

  try {
    const outcome = await reorderImages(auth.context.admin, slug, order);
    if (!outcome.ok) return mediaErrorResponse(outcome);

    revalidateCatalogue(slug);
    return adminJson({ media: outcome.view });
  } catch (error) {
    console.error(`[media] Reorder failed: ${describeAdminError(error)}`);
    return adminError(500, "We could not reorder that gallery. Please try again.");
  }
}
