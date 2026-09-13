import { priceBounds, products } from "@/data/mock-storefront";
import { productHref } from "@/lib/routes";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_TAGS,
  SORT_OPTIONS,
  type CatalogFilters,
  type Product,
  type ProductCategory,
  type ProductTag,
  type SortValue,
} from "@/types";

export { productHref };

export function findProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

/**
 * Authoritative product lookup by id.
 *
 * The payment layer resolves every basket line through this, so a price only
 * ever comes from the catalogue — never from the browser. When the catalogue
 * moves to a database or supplier feed, this stays the single seam.
 */
export function findProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export const defaultFilters: CatalogFilters = {
  query: "",
  category: "all",
  tags: [],
  minPrice: priceBounds.min,
  maxPrice: priceBounds.max,
  sort: "featured",
};

/** True when nothing has been narrowed from the default catalogue view. */
export function isDefaultFilters(filters: CatalogFilters): boolean {
  return (
    filters.query.trim() === "" &&
    filters.category === "all" &&
    filters.tags.length === 0 &&
    filters.minPrice <= priceBounds.min &&
    filters.maxPrice >= priceBounds.max
  );
}

/** Number of narrowing filters in effect, for the mobile drawer badge. */
export function countActiveFilters(filters: CatalogFilters): number {
  let count = 0;
  if (filters.category !== "all") count += 1;
  count += filters.tags.length;
  if (filters.minPrice > priceBounds.min || filters.maxPrice < priceBounds.max) {
    count += 1;
  }
  return count;
}

function matchesQuery(product: Product, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  // Every term must appear somewhere, so "mini tech" narrows rather than widens.
  const haystack =
    `${product.name} ${product.category} ${product.description}`.toLowerCase();
  return needle.split(/\s+/).every((term) => haystack.includes(term));
}

/**
 * "Featured" order: hand-picked products first, then best sellers, then
 * trending, then new arrivals, then the rest — deterministic, never random.
 */
function featuredWeight(product: Product): number {
  if (product.featured) return 0;
  if (product.tags.includes("bestSeller")) return 1;
  if (product.tags.includes("trending")) return 2;
  if (product.tags.includes("newArrival")) return 3;
  return 4;
}

/** Stand-in for real order volume: rating weighted by how many rated it. */
function popularityScore(product: Product): number {
  const rating = product.rating;
  return rating ? rating.value * Math.log10(rating.count + 10) : 0;
}

const comparators: Record<SortValue, (a: Product, b: Product) => number> = {
  featured: (a, b) =>
    featuredWeight(a) - featuredWeight(b) || a.addedRank - b.addedRank,
  newest: (a, b) => a.addedRank - b.addedRank,
  "price-low": (a, b) => a.price - b.price,
  "price-high": (a, b) => b.price - a.price,
  rating: (a, b) => (b.rating?.value ?? 0) - (a.rating?.value ?? 0),
  popular: (a, b) => popularityScore(b) - popularityScore(a),
};

/** Applies every filter, then sorts. Pure — safe to call on the server. */
export function filterProducts(
  filters: CatalogFilters,
  source: readonly Product[] = products,
): Product[] {
  const result = source.filter(
    (product) =>
      matchesQuery(product, filters.query) &&
      (filters.category === "all" || product.category === filters.category) &&
      filters.tags.every((tag) => product.tags.includes(tag)) &&
      product.price >= filters.minPrice &&
      product.price <= filters.maxPrice,
  );

  // Ties fall back to catalogue order, so results never shuffle between renders.
  return result.sort(
    (a, b) => comparators[filters.sort](a, b) || a.addedRank - b.addedRank,
  );
}

/**
 * Related products for a detail page: same category first, then products
 * sharing a merchandising tag, then featured. Deterministic.
 */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const pool = products.filter((item) => item.id !== product.id);
  const score = (candidate: Product): number => {
    if (candidate.category === product.category) return 0;
    if (candidate.tags.some((tag) => product.tags.includes(tag))) return 1;
    if (candidate.featured) return 2;
    return 3;
  };
  return pool
    .sort((a, b) => score(a) - score(b) || a.addedRank - b.addedRank)
    .slice(0, limit);
}

/* -------------------------------------------------------------------------
 * URL <-> filter state
 *
 * The catalogue mirrors its state in the query string so a filtered view can
 * be shared and survives a refresh. Unknown or malformed values fall back to
 * the default rather than rendering a broken page.
 * ---------------------------------------------------------------------- */

/** A plain read of `searchParams`, as the App Router hands it over. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function readOne(params: RawSearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function readPrice(
  raw: string | undefined,
  fallback: number,
): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseFilters(params: RawSearchParams): CatalogFilters {
  const category = readOne(params, "category");
  const sort = readOne(params, "sort");
  const tags = (readOne(params, "tags") ?? "")
    .split(",")
    .filter((tag): tag is ProductTag =>
      (PRODUCT_TAGS as readonly string[]).includes(tag),
    );

  const min = Math.max(
    priceBounds.min,
    readPrice(readOne(params, "min"), priceBounds.min),
  );
  const max = Math.min(
    priceBounds.max,
    readPrice(readOne(params, "max"), priceBounds.max),
  );

  return {
    query: readOne(params, "q") ?? "",
    category: (PRODUCT_CATEGORIES as readonly string[]).includes(category ?? "")
      ? (category as ProductCategory)
      : "all",
    tags,
    // A reversed range would filter everything out; keep it usable instead.
    minPrice: Math.min(min, max),
    maxPrice: Math.max(min, max),
    sort: (SORT_OPTIONS as readonly { value: string }[]).some(
      (option) => option.value === sort,
    )
      ? (sort as SortValue)
      : "featured",
  };
}

/** Serialises filters back to a query string, omitting defaults. */
export function filtersToSearchParams(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.tags.length) params.set("tags", filters.tags.join(","));
  if (filters.minPrice > priceBounds.min) {
    params.set("min", String(filters.minPrice));
  }
  if (filters.maxPrice < priceBounds.max) {
    params.set("max", String(filters.maxPrice));
  }
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  return params.toString();
}
