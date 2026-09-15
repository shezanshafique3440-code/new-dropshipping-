import {
  adminError,
  adminJson,
  describeAdminError,
  guardAdminRequest,
  readAdminField,
  readAdminJsonBody,
  requireAdminApi,
} from "@/server/admin/api";
import { updateProduct } from "@/server/catalog/admin-service";
import { revalidateCatalogue } from "@/server/catalog/revalidate";
import { readProductInput } from "@/server/catalog/validation";

/**
 * Editing a product.
 *
 * The slug comes from the route, never from the body: it is immutable, and
 * accepting one here would be the way an existing URL quietly breaks.
 *
 * `expectedUpdatedAt` is the version the editor loaded. The update matches on
 * it, so a save against a stale copy changes nothing and is reported as a
 * conflict rather than overwriting a colleague's work.
 *
 * Nothing on this path can touch an order: the catalogue and `order_items`
 * share no foreign key, and no code here writes to orders at all.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000;

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const guard = guardAdminRequest({
    request,
    scope: "admin-product-update",
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

  const { slug } = await context.params;
  const body = await readAdminJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const expected = new Date(readAdminField(body.value, "expectedUpdatedAt", 40));
  if (Number.isNaN(expected.getTime())) {
    return adminError(
      409,
      "This form is out of date. Reload the product and try again.",
    );
  }

  try {
    const result = await updateProduct(
      auth.context.admin,
      slug,
      readProductInput(body.value),
      expected,
    );

    if (!result.ok) {
      switch (result.reason) {
        case "invalid":
          return adminJson({ errors: result.errors }, { status: 422 });
        case "not-found":
          return adminError(404, "That product could not be found.");
        case "conflict":
          return adminError(
            409,
            "Somebody else saved this product while you were editing. Reload and try again.",
          );
        default:
          return adminError(400, "That product could not be saved.");
      }
    }

    revalidateCatalogue(result.product.slug);
    return adminJson({ product: result.product });
  } catch (error) {
    console.error(`[catalog] Update failed: ${describeAdminError(error)}`);
    return adminError(500, "We could not save that product. Please try again.");
  }
}
