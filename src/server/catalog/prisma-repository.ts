import type { Prisma, PrismaClient } from "@prisma/client";

import { fromMinorUnits } from "@/lib/money";
import { isProductCategory } from "@/lib/product-categories";
import type {
  ArtTone,
  Product,
  ProductArtKey,
  ProductBadgeTone,
  ProductCategory,
  ProductMedia,
  ProductTag,
} from "@/types";

import { getPrismaClient } from "../db/client";
import { GALLERY_ORDER } from "../media/prisma-repository";
import {
  getProductMediaStorage,
  type ProductMediaStorage,
} from "../media/storage";
import type {
  AdminProductPage,
  AdminProductQuery,
  AdminProductRecord,
  CatalogRepository,
  NewProduct,
  PriceBounds,
  ProductEdit,
  ProductStatus,
  UpdateResult,
} from "./repository";

/**
 * PostgreSQL catalogue storage.
 *
 * Every storefront read carries `status: "published"` in its `where` clause,
 * so a draft or an archived product is never fetched in the first place —
 * there is no code path that reads everything and filters afterwards, which
 * is the kind of path that eventually forgets.
 *
 * Writes are optimistic: an update matches on the `updatedAt` the editor
 * loaded, so two administrators saving the same product produce one write and
 * one conflict rather than a silent overwrite.
 */

const UNIQUE_VIOLATION = "P2002";

/** Hard ceiling on an admin page, whatever a caller asks for. */
const MAX_PAGE_SIZE = 100;

export class CatalogStorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "CatalogStorageError";
  }
}

export function isSlugTakenError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION
  );
}

/**
 * Every read joins the gallery.
 *
 * Not an afterthought and not a second call: a product without its images is
 * a product that cannot be rendered, so the images come back with it. A shop
 * page listing thirty-two products costs one query, not thirty-three — there
 * is no code path here that can turn into an N+1, because there is no code
 * path that fetches a gallery on its own.
 */
const WITH_IMAGES = {
  images: { orderBy: GALLERY_ORDER },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof WITH_IMAGES }>;

/** Published, in the order the catalogue presents them. */
const PUBLISHED = { status: "published" } as const;
const CATALOGUE_ORDER: Prisma.ProductOrderByWithRelationInput[] = [
  { sortOrder: "asc" },
  { slug: "asc" },
];

export class PrismaCatalogRepository implements CatalogRepository {
  private readonly prisma: PrismaClient;

  /**
   * Injected rather than imported at the point of use, so a test can render a
   * catalogue against a fake bucket and so the choice of driver is made once,
   * in configuration, rather than implied by whatever module happened to run.
   */
  private readonly media: ProductMediaStorage;

  constructor(
    prisma: PrismaClient = getPrismaClient(),
    media: ProductMediaStorage = getProductMediaStorage(),
  ) {
    this.prisma = prisma;
    this.media = media;
  }

  /* ---------------------------------------------------------- storefront */

  async listPublished(): Promise<readonly Product[]> {
    const rows = await this.run("read the catalogue", () =>
      this.prisma.product.findMany({
        where: PUBLISHED,
        orderBy: CATALOGUE_ORDER,
        include: WITH_IMAGES,
      }),
    );
    return rows.map((row) => toDomainProduct(row, this.media));
  }

  async findPublishedBySlug(slug: string): Promise<Product | null> {
    const row = await this.run("read a product", () =>
      this.prisma.product.findFirst({ where: { slug, ...PUBLISHED }, include: WITH_IMAGES }),
    );
    return row ? toDomainProduct(row, this.media) : null;
  }

  async findPublishedByIds(
    ids: readonly string[],
  ): Promise<ReadonlyMap<string, Product>> {
    return this.mapByIds(ids, PUBLISHED);
  }

  async findAnyByIds(ids: readonly string[]): Promise<ReadonlyMap<string, Product>> {
    return this.mapByIds(ids, {});
  }

  private async mapByIds(
    ids: readonly string[],
    scope: Prisma.ProductWhereInput,
  ): Promise<ReadonlyMap<string, Product>> {
    const unique = [...new Set(ids)].filter((id) => id.length > 0 && id.length <= 120);
    if (unique.length === 0) {
      return new Map();
    }
    const rows = await this.run("read products", () =>
      this.prisma.product.findMany({
        where: { id: { in: unique }, ...scope },
        include: WITH_IMAGES,
      }),
    );
    return new Map(rows.map((row) => [row.id, toDomainProduct(row, this.media)]));
  }

  async listFeatured(limit: number): Promise<readonly Product[]> {
    const rows = await this.run("read the featured products", () =>
      this.prisma.product.findMany({
        where: { ...PUBLISHED, featured: true },
        orderBy: CATALOGUE_ORDER,
        take: bounded(limit),
        include: WITH_IMAGES,
      }),
    );
    return rows.map((row) => toDomainProduct(row, this.media));
  }

  async listBestsellers(
    limit: number,
    options: { excludeFeatured?: boolean } = {},
  ): Promise<readonly Product[]> {
    const rows = await this.run("read the best sellers", () =>
      this.prisma.product.findMany({
        where: {
          ...PUBLISHED,
          bestseller: true,
          ...(options.excludeFeatured ? { featured: false } : {}),
        },
        orderBy: CATALOGUE_ORDER,
        take: bounded(limit),
        include: WITH_IMAGES,
      }),
    );
    return rows.map((row) => toDomainProduct(row, this.media));
  }

  /**
   * Category counts in one grouped query rather than one query per category —
   * the homepage draws six cards and should not cost six round trips.
   */
  async countByCategory(): Promise<ReadonlyMap<ProductCategory, number>> {
    const rows = await this.run("count the catalogue", () =>
      this.prisma.product.groupBy({
        by: ["category"],
        where: PUBLISHED,
        _count: { _all: true },
      }),
    );
    const counts = new Map<ProductCategory, number>();
    for (const row of rows) {
      if (isProductCategory(row.category)) {
        counts.set(row.category, row._count._all);
      }
    }
    return counts;
  }

  async priceBounds(): Promise<PriceBounds> {
    const result = await this.run("read the price range", () =>
      this.prisma.product.aggregate({
        where: PUBLISHED,
        _min: { priceAmount: true },
        _max: { priceAmount: true },
      }),
    );
    const min = result._min.priceAmount ?? 0;
    const max = result._max.priceAmount ?? 0;
    // Rounded outwards, so the slider's ends always include a real product.
    return {
      min: Math.floor(fromMinorUnits(min)),
      max: Math.ceil(fromMinorUnits(max)),
    };
  }

  /* --------------------------------------------------------------- admin */

  /**
   * One page of products for the panel.
   *
   * Offset pagination, not keyset, and deliberately: the panel sorts by
   * whatever column an operator picked and shows a total ("48 products"), and
   * a keyset cursor gives neither. The offset is bounded, the filtered count
   * comes from the same `where` clause, and both run in one transaction so
   * the count and the rows describe the same catalogue.
   */
  async listForAdmin(query: AdminProductQuery): Promise<AdminProductPage> {
    const where = adminWhere(query);
    const take = bounded(query.limit);
    const skip = Math.max(0, Math.trunc(query.offset));

    const [rows, total] = await this.run("read the products", () =>
      this.prisma.$transaction([
        this.prisma.product.findMany({
          where,
          orderBy: [{ updatedAt: "desc" }, { slug: "asc" }],
          take,
          skip,
          include: WITH_IMAGES,
        }),
        this.prisma.product.count({ where }),
      ]),
    );

    return { products: rows.map((row) => toAdminRecord(row, this.media)), total };
  }

  async findForAdmin(slug: string): Promise<AdminProductRecord | null> {
    const row = await this.run("read the product", () =>
      this.prisma.product.findUnique({ where: { slug }, include: WITH_IMAGES }),
    );
    return row ? toAdminRecord(row, this.media) : null;
  }

  async isSlugTaken(slug: string): Promise<boolean> {
    const found = await this.run("check the slug", () =>
      this.prisma.product.findFirst({
        where: { OR: [{ slug }, { id: slug }] },
        select: { id: true },
      }),
    );
    return found !== null;
  }

  async create(draft: NewProduct): Promise<AdminProductRecord> {
    const row = await this.run("create the product", () =>
      this.prisma.product.create({ data: toRow(draft), include: WITH_IMAGES }),
    );
    return toAdminRecord(row, this.media);
  }

  /**
   * Applies an edit if the row is still the one the editor loaded.
   *
   * `updatedAt` is the version: `updateMany` matches on it, so a save against
   * a stale copy matches nothing, writes nothing and is reported as a
   * conflict. No locking, no last-write-wins.
   */
  async update(
    slug: string,
    edit: ProductEdit,
    expectedUpdatedAt: Date,
  ): Promise<UpdateResult> {
    return this.conditionalWrite(slug, expectedUpdatedAt, toRowEdit(edit));
  }

  async setStatus(
    slug: string,
    status: ProductStatus,
    expectedUpdatedAt: Date,
  ): Promise<UpdateResult> {
    return this.conditionalWrite(slug, expectedUpdatedAt, { status });
  }

  private async conditionalWrite(
    slug: string,
    expectedUpdatedAt: Date,
    data: Prisma.ProductUpdateManyMutationInput,
  ): Promise<UpdateResult> {
    const changed = await this.run("update the product", () =>
      this.prisma.product.updateMany({
        where: { slug, updatedAt: expectedUpdatedAt },
        data,
      }),
    );

    if (changed.count === 0) {
      const existing = await this.findForAdmin(slug);
      return existing
        ? { ok: false, reason: "conflict" }
        : { ok: false, reason: "not-found" };
    }

    const updated = await this.findForAdmin(slug);
    return updated
      ? { ok: true, product: updated }
      : { ok: false, reason: "not-found" };
  }

  /** Converts anything the driver throws into an error safe to let bubble. */
  private async run<T>(action: string, query: () => Promise<T>): Promise<T> {
    try {
      return await query();
    } catch (error) {
      if (isSlugTakenError(error)) {
        // Meaningful to the caller; passed through for it to interpret.
        throw error;
      }
      console.error(
        `[catalog] Database failure while trying to ${action}: ${describeError(error)}`,
      );
      throw new CatalogStorageError(`Could not ${action}.`, { cause: error });
    }
  }
}

function bounded(limit: number): number {
  return Math.min(Math.max(1, Math.trunc(limit)), MAX_PAGE_SIZE);
}

/**
 * The admin list's `where` clause.
 *
 * The search term is a Prisma parameter, never interpolated into SQL, and
 * matches the two things an operator actually types: a product's name or its
 * slug.
 */
function adminWhere(query: AdminProductQuery): Prisma.ProductWhereInput {
  const search = query.search.trim().slice(0, 200);
  return {
    ...(query.status ? { status: query.status } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search.toLowerCase() } },
          ],
        }
      : {}),
  };
}

/* -------------------------------------------------------------------------
 * Mapping
 *
 * The row never leaves this module. Everything above works with the
 * application's own `Product`, so a column can be renamed without touching a
 * component.
 * ---------------------------------------------------------------------- */

/**
 * Turns image rows into public gallery entries.
 *
 * The storage key never leaves the server: the driver resolves it to a URL
 * here, and that URL is the only location the browser is ever told about.
 */
function toGallery(row: ProductRow, media: ProductMediaStorage): readonly ProductMedia[] {
  return row.images.map((image) => ({
    id: image.id,
    src: media.publicUrl(image.storageKey),
    alt: image.altText,
    width: image.width,
    height: image.height,
    label: image.label,
    primary: image.isPrimary,
  }));
}

export function toDomainProduct(row: ProductRow, media: ProductMediaStorage): Product {
  const tags: ProductTag[] = [];
  if (row.bestseller) tags.push("bestSeller");
  if (row.newArrival) tags.push("newArrival");
  if (row.trending) tags.push("trending");

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: (isProductCategory(row.category)
      ? row.category
      : "Everyday Essentials") as ProductCategory,
    description: row.description,
    features: row.features,
    // Minor units are the record; the major-unit figure is for formatting.
    priceAmount: row.priceAmount,
    price: fromMinorUnits(row.priceAmount),
    currency: row.currency,
    ...(row.compareAtPriceAmount === null
      ? {}
      : {
          compareAtPriceAmount: row.compareAtPriceAmount,
          compareAtPrice: fromMinorUnits(row.compareAtPriceAmount),
        }),
    ...(row.badgeLabel && row.badgeTone
      ? { badge: { label: row.badgeLabel, tone: row.badgeTone as ProductBadgeTone } }
      : {}),
    ...(row.ratingValue !== null && row.ratingCount !== null
      ? { rating: { value: row.ratingValue / 10, count: row.ratingCount } }
      : {}),
    tags,
    ...(row.featured ? { featured: true } : {}),
    addedRank: row.sortOrder,
    art: row.artKey as ProductArtKey,
    tone: row.tone as ArtTone,
    // Primary first, so a caller that wants one thumbnail can take images[0]
    // without knowing the flag exists.
    images: [...toGallery(row, media)].sort(
      (a, b) => Number(b.primary) - Number(a.primary),
    ),
  };
}

function toAdminRecord(row: ProductRow, media: ProductMediaStorage): AdminProductRecord {
  return {
    product: toDomainProduct(row, media),
    status: row.status,
    sortOrder: row.sortOrder,
    shortDescription: row.shortDescription,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toRow(draft: NewProduct): Prisma.ProductCreateInput {
  return {
    id: draft.id,
    slug: draft.slug,
    name: draft.name,
    description: draft.description,
    shortDescription: draft.shortDescription,
    category: draft.category,
    features: draft.features as string[],
    priceAmount: draft.priceAmount,
    compareAtPriceAmount: draft.compareAtPriceAmount,
    currency: draft.currency,
    status: draft.status,
    featured: draft.featured,
    bestseller: draft.bestseller,
    trending: draft.trending,
    newArrival: draft.newArrival,
    sortOrder: draft.sortOrder,
    artKey: draft.artKey,
    tone: draft.tone,
    badgeLabel: draft.badge?.label ?? null,
    badgeTone: draft.badge?.tone ?? null,
    ratingValue: draft.rating?.value ?? null,
    ratingCount: draft.rating?.count ?? null,
  };
}

function toRowEdit(edit: ProductEdit): Prisma.ProductUpdateManyMutationInput {
  return {
    name: edit.name,
    description: edit.description,
    shortDescription: edit.shortDescription,
    category: edit.category,
    features: edit.features as string[],
    priceAmount: edit.priceAmount,
    compareAtPriceAmount: edit.compareAtPriceAmount,
    currency: edit.currency,
    status: edit.status,
    featured: edit.featured,
    bestseller: edit.bestseller,
    trending: edit.trending,
    newArrival: edit.newArrival,
    sortOrder: edit.sortOrder,
    artKey: edit.artKey,
    tone: edit.tone,
    badgeLabel: edit.badge?.label ?? null,
    badgeTone: edit.badge?.tone ?? null,
    ratingValue: edit.rating?.value ?? null,
    ratingCount: edit.rating?.count ?? null,
  };
}

/** Type name and code only — never parameters, rows or connection details. */
function describeError(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    return `Prisma error ${String((error as { code?: unknown }).code)}`;
  }
  return error instanceof Error ? error.name : "unknown error";
}
