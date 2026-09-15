/**
 * Route builders.
 *
 * Kept free of data imports so client components can link to a product without
 * pulling the catalogue into their bundle.
 */

/** Canonical path for a product detail page. */
export function productHref(slug: string): string {
  return `/shop/${slug}`;
}

/** The catalogue landing page. */
export function shopHref(): string {
  return "/shop";
}

/** The checkout flow. */
export function checkoutHref(): string {
  return "/checkout";
}

/** Where Stripe returns a shopper after a completed payment. */
export function checkoutSuccessHref(): string {
  return "/checkout/success";
}

/** The customer account area. */
export function accountHref(): string {
  return "/account";
}

/** The customer's order history. */
export function accountOrdersHref(page?: {
  cursor?: string;
  direction?: "older" | "newer";
}): string {
  if (!page?.cursor) {
    return "/account/orders";
  }
  const params = new URLSearchParams({ cursor: page.cursor });
  if (page.direction) {
    params.set("direction", page.direction);
  }
  return `/account/orders?${params.toString()}`;
}

/** One order, addressed by its customer-facing reference. */
export function accountOrderHref(reference: string): string {
  return `/account/orders/${encodeURIComponent(reference)}`;
}

/**
 * Sign-in, optionally remembering where the customer was heading.
 *
 * The `next` value is validated again when it is used, so a crafted link
 * cannot turn this into an open redirect.
 */
export function loginHref(next?: string): string {
  return next ? `/login?next=${encodeURIComponent(next)}` : "/login";
}

export function registerHref(next?: string): string {
  return next ? `/register?next=${encodeURIComponent(next)}` : "/register";
}

/** Catalogue filtered to one category. */
export function categoryHref(category: string): string {
  return `/shop?category=${encodeURIComponent(category)}`;
}

/* -------------------------------------------------------------------------
 * Internal operations
 *
 * The admin panel's own paths. Kept here with the rest so nothing hard-codes
 * "/admin/..." in a component, and so the storefront's own helpers stay
 * clearly separate from it.
 * ---------------------------------------------------------------------- */

/** The operations dashboard. */
export function adminHref(): string {
  return "/admin";
}

/**
 * Admin sign-in, optionally remembering where the operator was heading.
 *
 * The `next` value is validated again when it is used, so a crafted link
 * cannot turn this into an open redirect.
 */
export function adminLoginHref(next?: string): string {
  return next ? `/admin/login?next=${encodeURIComponent(next)}` : "/admin/login";
}

/** Longest order-search term kept; longer input is truncated, never rejected. */
export const MAX_ORDER_SEARCH_LENGTH = 120;

export interface AdminOrdersHrefOptions {
  status?: string | null;
  paymentStatus?: string | null;
  search?: string;
  cursor?: string | null;
  direction?: "older" | "newer";
}

/**
 * The order list, with its filters, search term and page cursor.
 *
 * Every narrowing of the list is in the URL, so a filtered view is a link
 * somebody can send to a colleague. Paging is dropped whenever a filter
 * changes — page three of one filtered set says nothing about another — so
 * the caller passes a cursor only when it means to keep it.
 *
 * Lives here rather than beside the parser because the filter controls are a
 * client component: this file has no server imports, so linking costs the
 * browser nothing.
 */
export function adminOrdersHref(options: AdminOrdersHrefOptions = {}): string {
  const params = new URLSearchParams();
  if (options.status) {
    params.set("status", options.status);
  }
  if (options.paymentStatus) {
    params.set("payment", options.paymentStatus);
  }
  if (options.search) {
    params.set("q", options.search.slice(0, MAX_ORDER_SEARCH_LENGTH));
  }
  if (options.cursor) {
    params.set("cursor", options.cursor);
    if (options.direction) {
      params.set("direction", options.direction);
    }
  }
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

/** One order in the panel, addressed by its public reference. */
export function adminOrderHref(reference: string): string {
  return `/admin/orders/${encodeURIComponent(reference)}`;
}

/** The operator's own profile. */
export function adminAccountHref(): string {
  return "/admin/account";
}
