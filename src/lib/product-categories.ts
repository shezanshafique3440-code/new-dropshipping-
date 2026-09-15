/**
 * The catalogue's categories — the one authoritative list.
 *
 * Everything that needs to know what a category can be reads it from here:
 * the admin form's select, the storefront's filters, the repository's
 * validation, and the `products_category_known` CHECK constraint, which is
 * the database's copy of this array. Adding a category is an edit here plus a
 * migration that widens the constraint; it is deliberately not something a
 * stray write can do.
 *
 * Pure and dependency-free, so a client component can import it without
 * pulling anything server-side into the browser bundle.
 */

export const PRODUCT_CATEGORIES = [
  "Tech",
  "Home",
  "Lifestyle",
  "Beauty",
  "Accessories",
  "Everyday Essentials",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function isProductCategory(value: unknown): value is ProductCategory {
  return (
    typeof value === "string" &&
    (PRODUCT_CATEGORIES as readonly string[]).includes(value)
  );
}

/** A URL-safe key for a category, used by the homepage's category cards. */
export function categoryKey(category: ProductCategory): string {
  return category.toLowerCase().replaceAll(" ", "-");
}
