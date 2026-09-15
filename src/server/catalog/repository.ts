import type { Product, ProductCategory } from "@/types";

/**
 * Catalogue persistence seam.
 *
 * Two audiences, one repository. The storefront asks only for published
 * products and never sees a draft; the operations panel asks across every
 * status. Keeping them in one place means the two never drift into different
 * ideas of what a product is — and keeping the *scoping* in the method names
 * (`listPublished` versus `listForAdmin`) means a storefront call site cannot
 * accidentally reach a draft.
 *
 * Nothing above this layer touches Prisma.
 */

export type ProductStatus = "draft" | "published" | "archived";

export const PRODUCT_STATUSES: readonly ProductStatus[] = [
  "draft",
  "published",
  "archived",
];

/** A product as the panel sees it: the storefront shape plus operational fields. */
export interface AdminProductRecord {
  product: Product;
  status: ProductStatus;
  sortOrder: number;
  shortDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Everything needed to create a product. Amounts are already minor units. */
export interface NewProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string | null;
  category: ProductCategory;
  features: readonly string[];
  priceAmount: number;
  compareAtPriceAmount: number | null;
  currency: string;
  status: ProductStatus;
  featured: boolean;
  bestseller: boolean;
  trending: boolean;
  newArrival: boolean;
  sortOrder: number;
  artKey: string;
  tone: string;
  badge: { label: string; tone: string } | null;
  /** Value in tenths (48 = 4.8), or null. */
  rating: { value: number; count: number } | null;
}

/**
 * The editable half of a product.
 *
 * `slug` and `id` are absent on purpose: a slug is immutable once created, so
 * a published URL cannot quietly stop working. See the README.
 */
export type ProductEdit = Omit<NewProduct, "id" | "slug">;

export interface AdminProductFilters {
  status: ProductStatus | null;
  category: ProductCategory | null;
  /** Matched against name and slug, in the database. */
  search: string;
}

export interface AdminProductQuery extends AdminProductFilters {
  limit: number;
  /** Rows to skip. Bounded by the caller. */
  offset: number;
}

export interface AdminProductPage {
  products: readonly AdminProductRecord[];
  /** Total matching rows, for the page count. */
  total: number;
}

/** What the storefront's catalogue page needs to seed its price filter. */
export interface PriceBounds {
  /** Major units, rounded outwards so the slider covers every product. */
  min: number;
  max: number;
}

export interface CatalogRepository {
  /* ---------------------------------------------------------- storefront */

  /** Every published product, in catalogue order. */
  listPublished(): Promise<readonly Product[]>;

  /** One published product by slug. Null for a draft, an archive or a miss. */
  findPublishedBySlug(slug: string): Promise<Product | null>;

  /**
   * Published products by id, as a map.
   *
   * The checkout's price authority: one query for the whole basket, and a
   * product that is not published simply is not in the map, so it cannot be
   * bought.
   */
  findPublishedByIds(
    ids: readonly string[],
  ): Promise<ReadonlyMap<string, Product>>;

  /**
   * Products by id whatever their status, as a map.
   *
   * Used when rebuilding an order from a paid Stripe session: the money is
   * already taken, so a product that has since been archived must still
   * contribute its name rather than being dropped.
   */
  findAnyByIds(ids: readonly string[]): Promise<ReadonlyMap<string, Product>>;

  /** Published products flagged for the homepage grid. */
  listFeatured(limit: number): Promise<readonly Product[]>;

  /** Published best sellers, optionally excluding the featured ones. */
  listBestsellers(
    limit: number,
    options?: { excludeFeatured?: boolean },
  ): Promise<readonly Product[]>;

  /** How many published products sit in each category. */
  countByCategory(): Promise<ReadonlyMap<ProductCategory, number>>;

  /** Cheapest and dearest published product, for the price filter. */
  priceBounds(): Promise<PriceBounds>;

  /* --------------------------------------------------------------- admin */

  /** One page of products in any status, filtered and searched in the database. */
  listForAdmin(query: AdminProductQuery): Promise<AdminProductPage>;

  /** One product by slug, in any status. */
  findForAdmin(slug: string): Promise<AdminProductRecord | null>;

  /** True when a slug or id is already taken. */
  isSlugTaken(slug: string): Promise<boolean>;

  create(draft: NewProduct): Promise<AdminProductRecord>;

  /**
   * Applies an edit, but only if the product has not changed since it was
   * read. `expectedUpdatedAt` is the value the editor loaded.
   */
  update(
    slug: string,
    edit: ProductEdit,
    expectedUpdatedAt: Date,
  ): Promise<UpdateResult>;

  /** Moves a product between statuses, with the same optimistic check. */
  setStatus(
    slug: string,
    status: ProductStatus,
    expectedUpdatedAt: Date,
  ): Promise<UpdateResult>;
}

export type UpdateResult =
  | { ok: true; product: AdminProductRecord }
  | { ok: false; reason: "not-found" }
  /** Somebody else saved first; nothing was written. */
  | { ok: false; reason: "conflict" };
