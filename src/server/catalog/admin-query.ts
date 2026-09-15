import { isProductCategory } from "@/lib/product-categories";
import type { ProductCategory } from "@/types";

import { PRODUCT_STATUSES, type ProductStatus } from "./repository";

/**
 * Reading the admin product list's URL.
 *
 * Query parameters are user input. Every value is matched against what the
 * database actually has, and anything else — a misspelling, a stale link,
 * something hand-crafted — degrades to "no filter" rather than throwing or
 * reaching the database as an unrecognised value.
 */

/** Products per page in the panel. */
export const ADMIN_PRODUCTS_PER_PAGE = 20;

/** Longest search term kept. Longer input is truncated, not rejected. */
export const MAX_PRODUCT_SEARCH_LENGTH = 120;

export interface AdminProductQueryState {
  status: ProductStatus | null;
  category: ProductCategory | null;
  search: string;
  /** 1-based, for the URL and the page label. */
  page: number;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

function readOne(params: RawSearchParams, key: string): string | undefined {
  const value = params[key];
  if (typeof value === "string") {
    return value;
  }
  return Array.isArray(value) ? value[0] : undefined;
}

export function parseAdminProductQuery(
  params: RawSearchParams,
): AdminProductQueryState {
  const status = readOne(params, "status");
  const category = readOne(params, "category");
  const page = Number(readOne(params, "page") ?? "1");

  return {
    status: (PRODUCT_STATUSES as readonly string[]).includes(status ?? "")
      ? (status as ProductStatus)
      : null,
    category: isProductCategory(category) ? category : null,
    search: (readOne(params, "q") ?? "").trim().slice(0, MAX_PRODUCT_SEARCH_LENGTH),
    // A page number that is not a whole number above zero is page one; a
    // enormous one is clamped by the query's offset, not here.
    page: Number.isInteger(page) && page >= 1 && page <= 10_000 ? page : 1,
  };
}

export function hasActiveProductFilters(state: AdminProductQueryState): boolean {
  return Boolean(state.status || state.category || state.search);
}
