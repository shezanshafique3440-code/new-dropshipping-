import {
  adminError,
  adminJson,
  describeAdminError,
  guardAdminRequest,
  readAdminJsonBody,
  requireAdminApi,
} from "@/server/admin/api";
import { changeOrderStatus } from "@/server/admin/orders/service";
import { isOrderReference } from "@/server/orders/reference";
import { parseOrderStatus } from "@/server/orders/transitions";

/**
 * Changing an order's operational status.
 *
 * The one state-changing thing the panel can do, and it accepts exactly one
 * field: the status to move to. Everything else about the change is decided
 * by the server —
 *
 *   - who is acting comes from the admin session cookie, so an `adminId`,
 *     `role` or `customerId` in the body is simply never read;
 *   - whether the move is permitted comes from the order state machine, the
 *     same one the Stripe webhook obeys;
 *   - the payment status is not writable from here at all. A `paymentStatus`
 *     in the body changes nothing: money is Stripe's to report, and a manual
 *     override would let this table contradict the payment provider.
 *
 * Failures say what an operator can act on and nothing more — no Prisma code,
 * no SQL, no stack trace.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 1000;

interface RouteContext {
  params: Promise<{ reference: string }>;
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const guard = guardAdminRequest({
    request,
    scope: "admin-order-status",
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

  const { reference } = await context.params;
  if (!isOrderReference(reference)) {
    // Same answer as an order that does not exist: the shape of the reference
    // is not something to teach anybody about.
    return adminError(404, "That order could not be found.");
  }

  const body = await readAdminJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const status = parseOrderStatus(body.value.status);
  if (!status) {
    return adminError(400, "That is not a status an order can have.");
  }

  try {
    const result = await changeOrderStatus(auth.context.admin, {
      reference,
      to: status,
    });

    if (!result.ok) {
      switch (result.reason) {
        case "not-found":
          return adminError(404, "That order could not be found.");
        case "not-allowed":
          return adminError(
            422,
            "That change is not allowed for this order in its current state.",
          );
        case "conflict":
          return adminError(
            409,
            "This order changed while you were looking at it. Reload and try again.",
          );
      }
    }

    console.info(
      `[admin] ${auth.context.admin.email} moved order ${reference} to ${status}.`,
    );

    // Only the operational fields, and only for the order that was named.
    return adminJson({
      reference: result.order.reference,
      status: result.order.status,
      paymentStatus: result.order.paymentStatus,
      updatedAt: result.order.updatedAt,
      availableStatuses: result.order.availableStatuses,
    });
  } catch (error) {
    console.error(`[admin] Status change failed: ${describeAdminError(error)}`);
    return adminError(500, "We could not update that order. Please try again.");
  }
}
