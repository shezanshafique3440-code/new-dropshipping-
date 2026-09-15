import {
  adminError,
  adminJson,
  describeAdminError,
  guardAdminRequest,
  readAdminField,
  readAdminJsonBody,
  requireAdminApi,
} from "@/server/admin/api";
import { setProductStatus } from "@/server/catalog/admin-service";
import { revalidateCatalogue } from "@/server/catalog/revalidate";
import { PRODUCT_STATUSES, type ProductStatus } from "@/server/catalog/repository";

/**
 * Publishing, unpublishing and archiving.
 *
 * One field, checked against the three statuses the column has. Publishing is
 * what makes a product visible and purchasable; archiving is how it leaves
 * the shop. There is no delete: an order may name this product, and the
 * catalogue is where that name's artwork and link come from.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000;

interface RouteContext {
  params: Promise<{ slug: string }>;
}

function parseStatus(value: unknown): ProductStatus | null {
  return typeof value === "string" &&
    (PRODUCT_STATUSES as readonly string[]).includes(value)
    ? (value as ProductStatus)
    : null;
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const guard = guardAdminRequest({
    request,
    scope: "admin-product-status",
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

  const status = parseStatus(body.value.status);
  if (!status) {
    return adminError(400, "That is not a status a product can have.");
  }

  const expected = new Date(readAdminField(body.value, "expectedUpdatedAt", 40));
  if (Number.isNaN(expected.getTime())) {
    return adminError(
      409,
      "This page is out of date. Reload the product and try again.",
    );
  }

  try {
    const result = await setProductStatus(
      auth.context.admin,
      slug,
      status,
      expected,
    );

    if (!result.ok) {
      switch (result.reason) {
        case "not-found":
          return adminError(404, "That product could not be found.");
        case "conflict":
          return adminError(
            409,
            "This product changed while you were looking at it. Reload and try again.",
          );
        default:
          return adminError(400, "That change could not be applied.");
      }
    }

    revalidateCatalogue(result.product.slug);
    return adminJson({
      slug: result.product.slug,
      status: result.product.status,
      updatedAt: result.product.updatedAt,
    });
  } catch (error) {
    console.error(`[catalog] Status change failed: ${describeAdminError(error)}`);
    return adminError(500, "We could not update that product. Please try again.");
  }
}
