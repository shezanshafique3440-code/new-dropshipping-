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

/** Catalogue filtered to one category. */
export function categoryHref(category: string): string {
  return `/shop?category=${encodeURIComponent(category)}`;
}
