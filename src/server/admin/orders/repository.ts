import type { Order, OrderPaymentStatus, OrderStatus } from "@/types";

import type { OrderPage, OrderPageCursor } from "../../orders/repository";
import type { OrderState } from "../../orders/transitions";

/**
 * The operations panel's view of order storage.
 *
 * A seam of its own rather than more methods on `OrderRepository`: the
 * storefront's repository answers "this customer's orders", always scoped by
 * ownership, and an admin reads across every order there is. Keeping the two
 * apart means no storefront call site can reach an unscoped query by
 * accident, and the admin methods cannot be invoked without going through
 * `requireAdmin()` first.
 *
 * Every method here reads or writes at the database level. Nothing loads the
 * order table into memory to filter, search, sort or count it.
 */

export interface AdminOrderFilters {
  status: OrderStatus | null;
  paymentStatus: OrderPaymentStatus | null;
  /**
   * A reference or part of a customer's email address. Passed to Prisma as a
   * parameter, never interpolated into SQL.
   */
  search: string;
}

export interface AdminOrderPageQuery extends AdminOrderFilters {
  limit: number;
  cursor?: OrderPageCursor;
  direction?: "older" | "newer";
}

/** One entry in an order's status trail, already joined to its author. */
export interface OrderStatusEvent {
  at: Date;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  /** Null when the administrator's account has since been deleted. */
  adminName: string | null;
}

export interface AdminOrderRecord {
  order: Order;
  history: readonly OrderStatusEvent[];
}

/** Money that actually settled, kept per currency so nothing is added up wrongly. */
export interface SettledTotal {
  currency: string;
  orders: number;
  amount: number;
}

export interface AdminOrderCounts {
  total: number;
  byStatus: Record<OrderStatus, number>;
  byPaymentStatus: Record<OrderPaymentStatus, number>;
  /** Orders whose payment settled and has not been refunded. */
  settled: readonly SettledTotal[];
}

export type ApplyStatusResult =
  | { ok: true; order: Order }
  /** No order with that reference. */
  | { ok: false; reason: "not-found" }
  /**
   * Somebody else changed the order between it being read and this write.
   * Nothing was written, including no history row.
   */
  | { ok: false; reason: "conflict" };

export interface ApplyStatusInput {
  reference: string;
  /** The state the caller validated the transition against. */
  from: OrderState;
  to: OrderStatus;
  /** Always the acting administrator's id, resolved from their session. */
  adminUserId: string;
}

export interface AdminOrderRepository {
  /** One page of orders, newest first, filtered and searched in the database. */
  list(query: AdminOrderPageQuery): Promise<OrderPage>;

  /** One order with its status trail, by public reference. */
  find(reference: string): Promise<AdminOrderRecord | null>;

  /** Dashboard figures, aggregated by the database rather than counted here. */
  counts(): Promise<AdminOrderCounts>;

  /**
   * Moves an order to a new status and records who did it, in one
   * transaction, only if the order is still in the state the caller checked.
   * Never touches the payment status.
   */
  applyStatus(input: ApplyStatusInput): Promise<ApplyStatusResult>;
}
