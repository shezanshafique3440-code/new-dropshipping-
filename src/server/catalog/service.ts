import { EMPTY_PRICE_BOUNDS, type PriceBounds } from "@/lib/catalog";
import type { Product, ProductCategory } from "@/types";

import { getCatalogRepository } from "./index";
import type { CatalogRepository } from "./repository";

/**
 * The storefront's view of the catalogue.
 *
 * Every function here returns published products and nothing else — the
 * scoping is in the repository's query, so a draft is never read rather than
 * read and filtered. A page, a route handler or the payment layer calls these;
 * none of them ever touches Prisma.
 */

export interface CatalogServiceOptions {
  repository?: CatalogRepository;
}

function repo(options?: CatalogServiceOptions): CatalogRepository {
  return options?.repository ?? getCatalogRepository();
}

/** The whole published catalogue, in catalogue order. */
export async function listCatalogue(
  options?: CatalogServiceOptions,
): Promise<readonly Product[]> {
  return repo(options).listPublished();
}

/** One published product by slug, or null — a draft and a miss look the same. */
export async function findPublishedProduct(
  slug: string,
  options?: CatalogServiceOptions,
): Promise<Product | null> {
  if (!slug || slug.length > 160) {
    return null;
  }
  return repo(options).findPublishedBySlug(slug);
}

/**
 * The published products behind a set of ids.
 *
 * This is the checkout's price authority. A product that has been unpublished
 * or archived is absent from the map, so the basket line referring to it is
 * rejected rather than sold at a price nobody is offering.
 */
export async function findSellableProducts(
  ids: readonly string[],
  options?: CatalogServiceOptions,
): Promise<ReadonlyMap<string, Product>> {
  return repo(options).findPublishedByIds(ids);
}

/**
 * Products behind a set of ids, whatever their status.
 *
 * For rebuilding a paid order: the money has already moved, so an archived
 * product must still contribute its name rather than vanish from the receipt.
 * Never used to decide what may be bought.
 */
export async function findProductsForRecord(
  ids: readonly string[],
  options?: CatalogServiceOptions,
): Promise<ReadonlyMap<string, Product>> {
  return repo(options).findAnyByIds(ids);
}

export async function listFeaturedProducts(
  limit = 8,
  options?: CatalogServiceOptions,
): Promise<readonly Product[]> {
  return repo(options).listFeatured(limit);
}

export async function listBestsellingProducts(
  limit = 6,
  options?: CatalogServiceOptions,
): Promise<readonly Product[]> {
  return repo(options).listBestsellers(limit, { excludeFeatured: true });
}

export async function countProductsByCategory(
  options?: CatalogServiceOptions,
): Promise<ReadonlyMap<ProductCategory, number>> {
  return repo(options).countByCategory();
}

/**
 * The price range the catalogue filter should span.
 *
 * An empty catalogue has no range; the filter renders inert rather than
 * inventing one.
 */
export async function getPriceBounds(
  options?: CatalogServiceOptions,
): Promise<PriceBounds> {
  const bounds = await repo(options).priceBounds();
  return bounds.max === 0 && bounds.min === 0 ? EMPTY_PRICE_BOUNDS : bounds;
}
