import {
  adminError,
  adminJson,
  describeAdminError,
  guardAdminRequest,
  readAdminJsonBody,
  requireAdminApi,
} from "@/server/admin/api";
import { createProduct } from "@/server/catalog/admin-service";
import { revalidateCatalogue } from "@/server/catalog/revalidate";
import { readProductInput } from "@/server/catalog/validation";

/**
 * Creating a product.
 *
 * Who is acting comes from the admin session cookie, so an `adminId`, `role`
 * or `customerId` in the body is never read. What the product *is* comes from
 * the body, and every field of it is validated server-side before anything
 * reaches the table — the browser's copy of those rules is a convenience for
 * the person typing, not a gate.
 *
 * A product is created as a draft unless the form explicitly asks otherwise,
 * so nothing appears in the shop by accident.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 1000;

export async function POST(request: Request): Promise<Response> {
  const guard = guardAdminRequest({
    request,
    scope: "admin-product-create",
    limit: RATE_LIMIT,
    windowMs: RATE_WINDOW_MS,
  });
  if (!guard.ok) {
    return guard.response;
  }

  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  const body = await readAdminJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  try {
    const result = await createProduct(
      auth.context.admin,
      readProductInput(body.value),
    );

    if (!result.ok) {
      switch (result.reason) {
        case "invalid":
          return adminJson({ errors: result.errors }, { status: 422 });
        case "slug-taken":
          return adminJson(
            { errors: { slug: "A product already uses that slug." } },
            { status: 409 },
          );
        default:
          return adminError(400, "That product could not be created.");
      }
    }

    // The catalogue changed: clear the renders that are now wrong.
    revalidateCatalogue(result.product.slug);
    return adminJson({ product: result.product }, { status: 201 });
  } catch (error) {
    console.error(`[catalog] Create failed: ${describeAdminError(error)}`);
    return adminError(500, "We could not create that product. Please try again.");
  }
}
