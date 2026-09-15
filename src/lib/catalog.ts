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

/**
 * Catalogue filtering, sorting and URL state.
 *
 * Pure, and free of data imports on purpose: the products now come from
 * PostgreSQL, fetched by a server component, and this module only decides
 * what to do with a list it is handed. That keeps the same functions usable
 * by the server render and by the client component that owns the filter state
 * afterwards, without either of them being able to reach the database.
 *
 * The price range is passed in rather than imported, for the same reason: it
 * is the real minimum and maximum of the published catalogue, read once on
 * the server.
 */

export { productHref };

/** Lowest and highest published price, in major units. */
export interface PriceBounds {
  min: number;
  max: number;
}

/** A range wide enough to hold anything, for a catalogue with no products. */
export const EMPTY_PRICE_BOUNDS: PriceBounds = { min: 0, max: 0 };

export function defaultFilters(bounds: PriceBounds): CatalogFilters {
  return {
    query: "",
    category: "all",
    tags: [],
    minPrice: bounds.min,
    maxPrice: bounds.max,
    sort: "featured",
  };
}

/** True when nothing has been narrowed from the default catalogue view. */
export function isDefaultFilters(
  filters: CatalogFilters,
  bounds: PriceBounds,
): boolean {
  return (
    filters.query.trim() === "" &&
    filters.category === "all" &&
    filters.tags.length === 0 &&
    filters.minPrice <= bounds.min &&
    filters.maxPrice >= bounds.max
  );
}

/** Number of narrowing filters in effect, for the mobile drawer badge. */
export function countActiveFilters(
  filters: CatalogFilters,
  bounds: PriceBounds,
): number {
  let count = 0;
  if (filters.category !== "all") count += 1;
  count += filters.tags.length;
  if (filters.minPrice > bounds.min || filters.maxPrice < bounds.max) {
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
  source: readonly Product[],
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
export function getRelatedProducts(
  product: Product,
  catalogue: readonly Product[],
  limit = 4,
): Product[] {
  const pool = catalogue.filter((item) => item.id !== product.id);
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

export function parseFilters(
  params: RawSearchParams,
  bounds: PriceBounds,
): CatalogFilters {
  const category = readOne(params, "category");
  const sort = readOne(params, "sort");
  const tags = (readOne(params, "tags") ?? "")
    .split(",")
    .filter((tag): tag is ProductTag =>
      (PRODUCT_TAGS as readonly string[]).includes(tag),
    );

  const min = Math.max(bounds.min, readPrice(readOne(params, "min"), bounds.min));
  const max = Math.min(bounds.max, readPrice(readOne(params, "max"), bounds.max));

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
export function filtersToSearchParams(
  filters: CatalogFilters,
  bounds: PriceBounds,
): string {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.tags.length) params.set("tags", filters.tags.join(","));
  if (filters.minPrice > bounds.min) {
    params.set("min", String(filters.minPrice));
  }
  if (filters.maxPrice < bounds.max) {
    params.set("max", String(filters.maxPrice));
  }
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  return params.toString();
}
