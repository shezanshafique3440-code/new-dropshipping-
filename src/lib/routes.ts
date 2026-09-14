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
