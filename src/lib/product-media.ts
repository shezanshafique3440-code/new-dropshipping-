/**
 * Choosing which image to show.
 *
 * Pure, so the fallback order is one testable rule rather than a condition
 * repeated in nine components. The order is deliberate:
 *
 *   1. the image asked for, if it is really in this product's gallery
 *   2. the product's primary image
 *   3. any other image in the gallery
 *   4. nothing — and the caller draws the generated artwork panel instead
 *
 * Step 4 is why a product with no photography yet still renders: the panel is
 * clearly an illustration, so an empty gallery looks deliberate rather than
 * broken. What never happens is an <img> pointing at a URL nobody has checked.
 */
import type { Product, ProductMedia } from "@/types";

/** The subset of a product these helpers need. */
export type WithGallery = Pick<Product, "images">;

export function primaryImage(product: WithGallery): ProductMedia | null {
  return product.images.find((image) => image.primary) ?? product.images[0] ?? null;
}

export function pickImage(
  product: WithGallery,
  preferredId?: string,
): ProductMedia | null {
  if (preferredId) {
    // Looked up inside this product's gallery, never used as a URL: an id from
    // a query string can select an image, it cannot introduce one.
    const asked = product.images.find((image) => image.id === preferredId);
    if (asked) return asked;
  }
  return primaryImage(product);
}

export function hasGallery(product: WithGallery): boolean {
  return product.images.length > 0;
}

/**
 * `sizes` for the layouts the storefront actually uses.
 *
 * Kept together because a wrong `sizes` is invisible in review and expensive
 * in production: the browser picks a candidate before layout, so a card that
 * claims 100vw downloads a 1200px file to fill 280 CSS pixels.
 */
export const IMAGE_SIZES = {
  /** Cards in the 1/2/3/4-column responsive grids. */
  card: "(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw",
  /** The product detail page's main image. */
  detail: "(min-width: 1024px) 46vw, (min-width: 640px) 70vw, 92vw",
  /** Gallery thumbnails under the main image. */
  thumbnail: "96px",
  /** Cart, checkout and order-history line thumbnails. */
  line: "(min-width: 640px) 96px, 72px",
  /** The homepage hero panel. */
  hero: "(min-width: 1024px) 40vw, 80vw",
} as const;
