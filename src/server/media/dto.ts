import type { AdminProductRecord } from "../catalog/repository";
import type { ProductMediaStorage } from "./storage";
import type { ProductImageRecord } from "./repository";

/**
 * What the operations panel is allowed to see of a product's gallery.
 *
 * Hand-written, like every other response in this project. It carries the
 * storage key because an operator managing media needs to know which object a
 * row points at — a key is an identifier inside our own bucket, not a
 * credential and not a filesystem path. What it never carries is the absolute
 * path the local driver writes to, the bucket's name, or anything that would
 * let a reader reach the object except through the public URL the driver
 * already produced.
 */

export interface AdminProductImageView {
  id: string;
  /** Public URL, produced by the storage driver. */
  src: string;
  alt: string;
  label: string;
  /** The object's path inside the media bucket. */
  key: string;
  source: "generated" | "uploaded";
  width: number;
  height: number;
  byteSize: number;
  format: string;
  sortOrder: number;
  isPrimary: boolean;
}

/** The gallery plus what this deployment can actually do to it. */
export interface AdminProductMediaView {
  slug: string;
  images: readonly AdminProductImageView[];
  /** Driver name, for the panel to state plainly. Never a credential. */
  driver: string;
  /**
   * Whether new objects can be stored here.
   *
   * The panel shows an upload form only when this is true. Offering one that
   * cannot work would be a lie told with a button.
   */
  uploadsEnabled: boolean;
  maxImages: number;
  maxUploadBytes: number;
}

export function toAdminProductImageView(
  record: ProductImageRecord,
  storage: ProductMediaStorage,
): AdminProductImageView {
  return {
    id: record.id,
    src: storage.publicUrl(record.storageKey),
    alt: record.altText,
    label: record.label,
    key: record.storageKey,
    source: record.source,
    width: record.width,
    height: record.height,
    byteSize: record.byteSize,
    format: record.format,
    sortOrder: record.sortOrder,
    isPrimary: record.isPrimary,
  };
}

export function toAdminProductMediaView(options: {
  product: Pick<AdminProductRecord["product"], "slug">;
  images: readonly ProductImageRecord[];
  storage: ProductMediaStorage;
  maxImages: number;
  maxUploadBytes: number;
}): AdminProductMediaView {
  return {
    slug: options.product.slug,
    images: options.images.map((image) => toAdminProductImageView(image, options.storage)),
    driver: options.storage.driver,
    uploadsEnabled: options.storage.writable,
    maxImages: options.maxImages,
    maxUploadBytes: options.maxUploadBytes,
  };
}
