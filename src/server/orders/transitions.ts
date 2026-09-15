import type { OrderPaymentStatus, OrderStatus } from "@/types";

/**
 * Order state rules.
 *
 * Two independent facts are tracked: where the order is in its own lifecycle
 * (`OrderStatus`) and where the money is (`OrderPaymentStatus`). They are not
 * the same thing — a paid order can later be cancelled, and a failed payment
 * still leaves a record worth keeping — so they are never collapsed into one
 * field or one boolean.
 *
 * Every change of either field goes through this module. No repository, route
 * or service writes a status it has decided on by itself, which is what keeps
 * "a webhook arrived out of order" from silently rewriting history.
 */

export class OrderTransitionError extends Error {
  readonly from: OrderState;
  readonly to: OrderState;

  constructor(from: OrderState, to: OrderState, message: string) {
    super(message);
    this.name = "OrderTransitionError";
    this.from = from;
    this.to = to;
  }
}

export interface OrderState {
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
}

/** Payment states from which money has demonstrably not (yet) arrived. */
const OPEN_PAYMENT: readonly OrderPaymentStatus[] = ["unpaid", "failed"];

/**
 * Allowed order-status moves.
 *
 * `cancelled` is the one truly terminal state — a deliberate decision that
 * nothing should undo silently. `failed` is not terminal: a shopper can retry
 * a declined payment on the same session, and if the money then arrives the
 * order must be able to say so. Recording a real payment as failed would be a
 * far worse error than allowing this edge.
 */
const STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["pending", "paid", "cancelled", "failed"],
  paid: ["paid", "cancelled"],
  cancelled: ["cancelled"],
  failed: ["failed", "paid", "cancelled"],
};

/**
 * Allowed payment moves. `paid → refunded` is the only way out of paid, and
 * nothing returns to `unpaid`: money that arrived cannot un-arrive, it can
 * only be sent back.
 */
const PAYMENT_TRANSITIONS: Record<
  OrderPaymentStatus,
  readonly OrderPaymentStatus[]
> = {
  unpaid: ["unpaid", "paid", "failed"],
  paid: ["paid", "refunded"],
  failed: ["failed", "paid"],
  refunded: ["refunded"],
};

export function canTransition(from: OrderState, to: OrderState): boolean {
  return (
    STATUS_TRANSITIONS[from.status].includes(to.status) &&
    PAYMENT_TRANSITIONS[from.paymentStatus].includes(to.paymentStatus) &&
    isCoherent(to)
  );
}

/**
 * Rejects pairs that cannot describe a real order, whatever route they took:
 * a `paid` order whose money never arrived, or an order still `pending` after
 * the payment succeeded.
 */
function isCoherent(state: OrderState): boolean {
  if (state.status === "paid" && state.paymentStatus !== "paid") {
    return state.paymentStatus === "refunded";
  }
  if (state.paymentStatus === "paid" && state.status === "pending") {
    return false;
  }
  return true;
}

export function assertTransition(from: OrderState, to: OrderState): void {
  if (!canTransition(from, to)) {
    throw new OrderTransitionError(
      from,
      to,
      `Cannot move an order from ${describe(from)} to ${describe(to)}.`,
    );
  }
}

export function describe(state: OrderState): string {
  return `${state.status}/${state.paymentStatus}`;
}

/* -------------------------------------------------------------------------
 * Named transitions
 *
 * Callers ask for an outcome ("this payment succeeded"), not for a pair of
 * enum values, so the mapping lives here rather than at every call site.
 * ---------------------------------------------------------------------- */

/** The state an order takes when the provider confirms payment. */
export const PAID_STATE: OrderState = { status: "paid", paymentStatus: "paid" };

/** A payment attempt that failed. The order stays on record. */
export const FAILED_STATE: OrderState = {
  status: "failed",
  paymentStatus: "failed",
};

/** A delayed payment method that has not settled yet. */
export const PENDING_STATE: OrderState = {
  status: "pending",
  paymentStatus: "unpaid",
};

/** Cancelled before payment arrived. */
export const CANCELLED_STATE: OrderState = {
  status: "cancelled",
  paymentStatus: "unpaid",
};

/** True when payment has not settled, so a later confirmation is still valid. */
export function isAwaitingPayment(state: OrderState): boolean {
  return OPEN_PAYMENT.includes(state.paymentStatus);
}

/** True once money has arrived — the point after which nothing downgrades. */
export function isSettled(state: OrderState): boolean {
  return state.paymentStatus === "paid" || state.paymentStatus === "refunded";
}

/* -------------------------------------------------------------------------
 * Operational transitions
 *
 * What an administrator may do to an order, as opposed to what the payment
 * provider's lifecycle does to it.
 * ---------------------------------------------------------------------- */

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "paid",
  "cancelled",
  "failed",
];

/**
 * The statuses an operator may set by hand.
 *
 * Cancelling is the whole list, and deliberately so. `paid` and `failed` are
 * statements about money, and money is Stripe's to report: a "mark as paid"
 * control would let the order table disagree with the payment provider, which
 * is exactly the inconsistency the two-field model exists to prevent.
 */
const ADMIN_INITIABLE: readonly OrderStatus[] = ["cancelled"];

/**
 * Which of those an order in this state can actually move to.
 *
 * The payment status is held fixed while asking, so the existing state
 * machine — not a second rule written for the admin panel — decides. A
 * target that would require the money to have moved fails `canTransition`
 * and never appears as an option. A cancelled order returns nothing:
 * cancellation is terminal, and the admin panel does not widen that.
 */
export function adminStatusOptions(state: OrderState): readonly OrderStatus[] {
  return ADMIN_INITIABLE.filter(
    (status) =>
      status !== state.status &&
      canTransition(state, { status, paymentStatus: state.paymentStatus }),
  );
}

/** True when an operator may move this order to that status. */
export function isAdminStatusChangeAllowed(
  state: OrderState,
  target: OrderStatus,
): boolean {
  return adminStatusOptions(state).includes(target);
}

/** Narrows arbitrary input to an order status. Returns null for anything else. */
export function parseOrderStatus(value: unknown): OrderStatus | null {
  return typeof value === "string" &&
    (ORDER_STATUSES as readonly string[]).includes(value)
    ? (value as OrderStatus)
    : null;
}
