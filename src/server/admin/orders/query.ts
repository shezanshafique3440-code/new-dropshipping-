import type { OrderPaymentStatus, OrderStatus } from "@/types";

import { decodeOrderCursor } from "../../orders/cursor";
import type { OrderPageCursor } from "../../orders/repository";
import type { AdminOrderFilters } from "./repository";
import { MAX_ORDER_SEARCH_LENGTH } from "@/lib/routes";

/**
 * Reading the order list's URL.
 *
 * Query parameters are user input and are treated as such: every value is
 * matched against the enum the database actually has, and anything else —
 * a misspelling, a value from an older version of the page, something
 * hand-crafted — degrades to "no filter" rather than throwing. A URL that
 * makes no sense shows the unfiltered list; it never shows an error page and
 * never reaches the database as an unrecognised value.
 *
 * The parsed shape is also what builds links back out again, so a filtered,
 * searched, paged view is a shareable URL.
 */

const STATUSES: readonly OrderStatus[] = ["pending", "paid", "cancelled", "failed"];
const PAYMENT_STATUSES: readonly OrderPaymentStatus[] = [
  "unpaid",
  "paid",
  "failed",
  "refunded",
];

export interface AdminOrderQueryState extends AdminOrderFilters {
  cursor: OrderPageCursor | null;
  direction: "older" | "newer";
  /** The cursor exactly as it arrived, for building the "back" link. */
  rawCursor: string | null;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

function readOne(params: RawSearchParams, key: string): string | undefined {
  const value = params[key];
  if (typeof value === "string") {
    return value;
  }
  // A repeated parameter (?status=paid&status=failed) takes the first value
  // rather than being an error.
  return Array.isArray(value) ? value[0] : undefined;
}

export function parseAdminOrderQuery(params: RawSearchParams): AdminOrderQueryState {
  const status = readOne(params, "status");
  const paymentStatus = readOne(params, "payment");
  const rawCursor = readOne(params, "cursor") ?? null;
  const direction = readOne(params, "direction") === "newer" ? "newer" : "older";

  return {
    status: STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : null,
    paymentStatus: PAYMENT_STATUSES.includes(paymentStatus as OrderPaymentStatus)
      ? (paymentStatus as OrderPaymentStatus)
      : null,
    search: (readOne(params, "q") ?? "").trim().slice(0, MAX_ORDER_SEARCH_LENGTH),
    cursor: decodeOrderCursor(rawCursor ?? undefined),
    // A cursor that did not decode leaves the direction meaningless; the
    // caller simply gets the first page.
    direction,
    rawCursor,
  };
}

/** True when anything is narrowing the list — drives the "clear" control. */
export function hasActiveFilters(state: AdminOrderQueryState): boolean {
  return Boolean(state.status || state.paymentStatus || state.search);
}
