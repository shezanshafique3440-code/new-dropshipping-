/**
 * Product media persistence seam.
 *
 * The storefront never comes through here: it reads a product's gallery as
 * part of reading the product, in one joined query, so a grid of thirty-two
 * cards costs one round trip rather than thirty-three. This repository is the
 * *write* side — the operations panel reordering a gallery, renaming an alt
 * text, promoting a primary image — plus the media seed.
 *
 * Nothing above this layer touches Prisma.
 */
import type { MediaFormat } from "./keys";

export type ProductImageSource = "generated" | "uploaded";

/** One image row, exactly as stored. `storageKey`, never a URL. */
export interface ProductImageRecord {
  id: string;
  productId: string;
  storageKey: string;
  altText: string;
  label: string;
  source: ProductImageSource;
  sortOrder: number;
  isPrimary: boolean;
  width: number;
  height: number;
  byteSize: number;
  format: MediaFormat;
  createdAt: Date;
  updatedAt: Date;
}

/** Everything needed to attach an image to a product. */
export interface NewProductImage {
  productId: string;
  storageKey: string;
  altText: string;
  label: string;
  source: ProductImageSource;
  width: number;
  height: number;
  byteSize: number;
  format: MediaFormat;
}

export type MediaWriteResult =
  | { ok: true; images: readonly ProductImageRecord[] }
  | { ok: false; reason: "not-found" }
  /** The ids sent do not match the gallery as it is now — somebody else moved it. */
  | { ok: false; reason: "stale" };

export interface RemoveImageResult {
  ok: boolean;
  /** The key that is no longer referenced, so the caller can delete the object. */
  removedKey?: string;
  images?: readonly ProductImageRecord[];
  reason?: "not-found" | "last-image";
}

export interface ProductMediaRepository {
  /** One product's gallery, in gallery order. */
  listForProduct(productId: string): Promise<readonly ProductImageRecord[]>;

  /**
   * Galleries for several products at once, as a map.
   *
   * One query for a whole page of products. Exists so nothing has to loop.
   */
  listForProducts(
    productIds: readonly string[],
  ): Promise<ReadonlyMap<string, readonly ProductImageRecord[]>>;

  /**
   * Attaches an image, appending it to the end of the gallery.
   *
   * Idempotent on `(productId, storageKey)`: re-adding the same object updates
   * that row instead of creating a second one, which is what lets the media
   * seed run repeatedly without duplicating anything. The first image of a
   * product becomes its primary.
   */
  add(image: NewProductImage): Promise<ProductImageRecord>;

  /** Rewrites one image's alt text. */
  setAltText(productId: string, imageId: string, altText: string): Promise<MediaWriteResult>;

  /**
   * Promotes one image to primary and demotes the previous one.
   *
   * A single transaction, because the database allows only one primary per
   * product: demote-then-promote either both happens or neither does.
   */
  setPrimary(productId: string, imageId: string): Promise<MediaWriteResult>;

  /**
   * Rewrites the whole gallery order.
   *
   * Takes every id in the gallery, not a move instruction: a partial list is
   * rejected as stale rather than leaving the rest at whatever positions they
   * happened to hold.
   */
  reorder(productId: string, orderedIds: readonly string[]): Promise<MediaWriteResult>;

  /**
   * Detaches an image.
   *
   * Refuses to remove the last one — a product with an empty gallery renders
   * the placeholder, and that should be a deliberate state, not the result of
   * one click too many. Removing the primary promotes the next image.
   */
  remove(productId: string, imageId: string): Promise<RemoveImageResult>;
}
