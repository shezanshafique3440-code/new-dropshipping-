import type { Prisma, PrismaClient } from "@prisma/client";

import { getPrismaClient } from "../db/client";
import { isMediaFormat, type MediaFormat } from "./keys";
import type {
  MediaWriteResult,
  NewProductImage,
  ProductImageRecord,
  ProductMediaRepository,
  RemoveImageResult,
} from "./repository";

/**
 * PostgreSQL product media storage.
 *
 * Every write that can leave a gallery inconsistent runs inside a
 * transaction, and the two invariants that matter — contiguous `sortOrder`
 * and exactly one primary — are re-established by the transaction rather than
 * assumed. The database backs that up with a partial unique index, so a bug
 * here fails loudly instead of quietly producing two primary images.
 */

export class ProductMediaStorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ProductMediaStorageError";
  }
}

type ImageRow = Prisma.ProductImageGetPayload<object>;

/** Gallery order: position first, then a stable tiebreak. */
export const GALLERY_ORDER: Prisma.ProductImageOrderByWithRelationInput[] = [
  { sortOrder: "asc" },
  { storageKey: "asc" },
];

/** A gallery is a handful of images; this is the ceiling, not a target. */
export const MAX_IMAGES_PER_PRODUCT = 12;

export class PrismaProductMediaRepository implements ProductMediaRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient = getPrismaClient()) {
    this.prisma = prisma;
  }

  async listForProduct(productId: string): Promise<readonly ProductImageRecord[]> {
    const rows = await this.run("read the gallery", () =>
      this.prisma.productImage.findMany({ where: { productId }, orderBy: GALLERY_ORDER }),
    );
    return rows.map(toRecord);
  }

  async listForProducts(
    productIds: readonly string[],
  ): Promise<ReadonlyMap<string, readonly ProductImageRecord[]>> {
    const unique = [...new Set(productIds)].filter((id) => id.length > 0 && id.length <= 120);
    const byProduct = new Map<string, ProductImageRecord[]>();
    if (unique.length === 0) return byProduct;

    const rows = await this.run("read the galleries", () =>
      this.prisma.productImage.findMany({
        where: { productId: { in: unique } },
        orderBy: GALLERY_ORDER,
      }),
    );
    for (const row of rows) {
      const list = byProduct.get(row.productId) ?? [];
      list.push(toRecord(row));
      byProduct.set(row.productId, list);
    }
    return byProduct;
  }

  /**
   * Appends an image, or updates the one already at that key.
   *
   * The `(productId, storageKey)` unique constraint is the idempotency key:
   * the seed can attach the same rendered object on every run and the row is
   * rewritten rather than duplicated. A product's first image is its primary,
   * because a gallery with no primary would have no card thumbnail.
   */
  async add(image: NewProductImage): Promise<ProductImageRecord> {
    const row = await this.run("attach the image", () =>
      this.prisma.$transaction(async (tx) => {
        const existing = await tx.productImage.findUnique({
          where: {
            productId_storageKey: {
              productId: image.productId,
              storageKey: image.storageKey,
            },
          },
        });

        if (existing) {
          return tx.productImage.update({
            where: { id: existing.id },
            data: {
              altText: image.altText,
              label: image.label,
              source: image.source,
              width: image.width,
              height: image.height,
              byteSize: image.byteSize,
              format: image.format,
            },
          });
        }

        const siblings = await tx.productImage.count({ where: { productId: image.productId } });
        if (siblings >= MAX_IMAGES_PER_PRODUCT) {
          throw new ProductMediaStorageError(
            `A product may have at most ${MAX_IMAGES_PER_PRODUCT} images.`,
          );
        }

        return tx.productImage.create({
          data: {
            productId: image.productId,
            storageKey: image.storageKey,
            altText: image.altText,
            label: image.label,
            source: image.source,
            width: image.width,
            height: image.height,
            byteSize: image.byteSize,
            format: image.format,
            sortOrder: siblings,
            isPrimary: siblings === 0,
          },
        });
      }),
    );
    return toRecord(row);
  }

  async setAltText(
    productId: string,
    imageId: string,
    altText: string,
  ): Promise<MediaWriteResult> {
    const changed = await this.run("rewrite the alt text", () =>
      // Matched on the product too: an image id alone must not be enough to
      // edit an image that belongs to a different product.
      this.prisma.productImage.updateMany({
        where: { id: imageId, productId },
        data: { altText },
      }),
    );
    if (changed.count === 0) return { ok: false, reason: "not-found" };
    return { ok: true, images: await this.listForProduct(productId) };
  }

  async setPrimary(productId: string, imageId: string): Promise<MediaWriteResult> {
    const outcome = await this.run("choose the primary image", () =>
      this.prisma.$transaction(async (tx) => {
        const target = await tx.productImage.findFirst({ where: { id: imageId, productId } });
        if (!target) return "not-found" as const;
        if (target.isPrimary) return "ok" as const;

        // Demote first: the partial unique index would reject the promotion
        // otherwise, and doing it in this order means there is never an
        // instant where the product has two primaries or none.
        await tx.productImage.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
        await tx.productImage.update({ where: { id: target.id }, data: { isPrimary: true } });
        return "ok" as const;
      }),
    );

    if (outcome === "not-found") return { ok: false, reason: "not-found" };
    return { ok: true, images: await this.listForProduct(productId) };
  }

  /**
   * Rewrites the gallery order from a complete list of ids.
   *
   * The list is compared against the gallery as it is *inside* the
   * transaction, so a reorder built from a stale page is rejected rather than
   * applied to a gallery that has since changed. Positions are written as a
   * dense 0..n-1 run, which keeps "move up" arithmetic trivial forever.
   */
  async reorder(productId: string, orderedIds: readonly string[]): Promise<MediaWriteResult> {
    const outcome = await this.run("reorder the gallery", () =>
      this.prisma.$transaction(async (tx) => {
        const current = await tx.productImage.findMany({
          where: { productId },
          orderBy: GALLERY_ORDER,
          select: { id: true },
        });
        if (current.length === 0) return "not-found" as const;

        const wanted = [...orderedIds];
        if (wanted.length !== current.length) return "stale" as const;
        if (new Set(wanted).size !== wanted.length) return "stale" as const;

        const known = new Set(current.map((row) => row.id));
        if (!wanted.every((id) => known.has(id))) return "stale" as const;

        for (const [position, id] of wanted.entries()) {
          await tx.productImage.update({ where: { id }, data: { sortOrder: position } });
        }
        return "ok" as const;
      }),
    );

    if (outcome === "not-found") return { ok: false, reason: "not-found" };
    if (outcome === "stale") return { ok: false, reason: "stale" };
    return { ok: true, images: await this.listForProduct(productId) };
  }

  /**
   * Detaches an image and closes the gap it leaves.
   *
   * Refuses the last image, promotes the next one when the primary goes, and
   * re-numbers what is left so positions stay dense. Returns the freed key: it
   * is the caller — which knows whether the storage driver can delete — that
   * decides what to do with the object.
   */
  async remove(productId: string, imageId: string): Promise<RemoveImageResult> {
    const outcome = await this.run("remove the image", () =>
      this.prisma.$transaction(async (tx) => {
        const gallery = await tx.productImage.findMany({
          where: { productId },
          orderBy: GALLERY_ORDER,
        });
        const target = gallery.find((row) => row.id === imageId);
        if (!target) return { kind: "not-found" } as const;
        if (gallery.length === 1) return { kind: "last-image" } as const;

        await tx.productImage.delete({ where: { id: target.id } });

        const remaining = gallery.filter((row) => row.id !== target.id);
        for (const [position, row] of remaining.entries()) {
          const shouldBePrimary = target.isPrimary ? position === 0 : row.isPrimary;
          if (row.sortOrder !== position || row.isPrimary !== shouldBePrimary) {
            await tx.productImage.update({
              where: { id: row.id },
              data: { sortOrder: position, isPrimary: shouldBePrimary },
            });
          }
        }

        return { kind: "ok", removedKey: target.storageKey } as const;
      }),
    );

    if (outcome.kind === "not-found") return { ok: false, reason: "not-found" };
    if (outcome.kind === "last-image") return { ok: false, reason: "last-image" };
    return {
      ok: true,
      removedKey: outcome.removedKey,
      images: await this.listForProduct(productId),
    };
  }

  /** Converts anything the driver throws into an error safe to let bubble. */
  private async run<T>(action: string, query: () => Promise<T>): Promise<T> {
    try {
      return await query();
    } catch (error) {
      if (error instanceof ProductMediaStorageError) throw error;
      console.error(
        `[media] Database failure while trying to ${action}: ${describeError(error)}`,
      );
      throw new ProductMediaStorageError(`Could not ${action}.`, { cause: error });
    }
  }
}

export function toRecord(row: ImageRow): ProductImageRecord {
  return {
    id: row.id,
    productId: row.productId,
    storageKey: row.storageKey,
    altText: row.altText,
    label: row.label,
    source: row.source,
    sortOrder: row.sortOrder,
    isPrimary: row.isPrimary,
    width: row.width,
    height: row.height,
    byteSize: row.byteSize,
    // The column is CHECK-constrained to this set; the guard is what lets the
    // value be typed rather than cast.
    format: (isMediaFormat(row.format) ? row.format : "webp") satisfies MediaFormat,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Type name and code only — never parameters, rows or connection details. */
function describeError(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    return `Prisma error ${String((error as { code?: unknown }).code)}`;
  }
  return error instanceof Error ? error.name : "unknown error";
}
