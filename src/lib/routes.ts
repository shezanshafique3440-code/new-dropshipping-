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

/** Catalogue filtered to one category. */
export function categoryHref(category: string): string {
  return `/shop?category=${encodeURIComponent(category)}`;
}
