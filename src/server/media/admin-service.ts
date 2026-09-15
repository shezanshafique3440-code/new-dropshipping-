import type { AdminActor } from "@/server/admin/orders/service";

import { getCatalogRepository } from "../catalog/index";
import type { CatalogRepository } from "../catalog/repository";
import { isProductSlug } from "../catalog/validation";
import { toAdminProductMediaView, type AdminProductMediaView } from "./dto";
import { readImageMetadata } from "./image-metadata";
import { getProductMediaRepository } from "./index";
import { productImageKey } from "./keys";
import { MAX_IMAGES_PER_PRODUCT } from "./prisma-repository";
import type { ProductMediaRepository } from "./repository";
import { getProductMediaStorage, MediaStorageError, type ProductMediaStorage } from "./storage";

/**
 * Managing a product's gallery.
 *
 * Every function takes an `AdminActor` — the same proof `requireAdmin()`
 * produces for the rest of the panel — as its first argument, so a page or
 * endpoint that has not resolved an administrator cannot read a gallery, let
 * alone reorder one. The compiler enforces that, rather than a comment asking
 * for it.
 *
 * Every function also resolves the product by slug first. An image id is
 * never enough on its own: the write is scoped to the product the URL names,
 * so a guessed id cannot reach another product's gallery.
 *
 * Cache revalidation is not here — it needs a Next request, and this layer
 * should be callable without one. The routes do it, through
 * `../catalog/revalidate.ts`, after a write succeeds.
 */

/** Largest upload accepted, before it is even decoded. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const MAX_ALT_TEXT = 300;
export const MAX_LABEL = 40;

export interface AdminMediaOptions {
  catalog?: CatalogRepository;
  media?: ProductMediaRepository;
  storage?: ProductMediaStorage;
}

function catalog(options?: AdminMediaOptions): CatalogRepository {
  return options?.catalog ?? getCatalogRepository();
}

function media(options?: AdminMediaOptions): ProductMediaRepository {
  return options?.media ?? getProductMediaRepository();
}

function storage(options?: AdminMediaOptions): ProductMediaStorage {
  return options?.storage ?? getProductMediaStorage();
}

function assertActor(actor: AdminActor): void {
  if (!actor?.id) {
    throw new Error("An administrator must be resolved before managing product media.");
  }
}

export type MediaOutcome =
  | { ok: true; view: AdminProductMediaView }
  | { ok: false; reason: MediaFailure; message: string };

export type MediaFailure =
  | "not-found"
  | "invalid"
  | "stale"
  | "last-image"
  | "too-many"
  | "read-only";

function view(
  slug: string,
  images: Awaited<ReturnType<ProductMediaRepository["listForProduct"]>>,
  driver: ProductMediaStorage,
): AdminProductMediaView {
  return toAdminProductMediaView({
    product: { slug },
    images,
    storage: driver,
    maxImages: MAX_IMAGES_PER_PRODUCT,
    maxUploadBytes: MAX_UPLOAD_BYTES,
  });
}

/** Resolves the product this request names, in any status. */
async function findProductId(
  slug: string,
  options?: AdminMediaOptions,
): Promise<string | null> {
  if (!isProductSlug(slug)) return null;
  const record = await catalog(options).findForAdmin(slug);
  return record?.product.id ?? null;
}

/* ------------------------------------------------------------------ read */

export async function getProductMedia(
  actor: AdminActor,
  slug: string,
  options?: AdminMediaOptions,
): Promise<AdminProductMediaView | null> {
  assertActor(actor);
  const productId = await findProductId(slug, options);
  if (!productId) return null;
  const images = await media(options).listForProduct(productId);
  return view(slug, images, storage(options));
}

/* ----------------------------------------------------------------- write */

export async function setImageAltText(
  actor: AdminActor,
  slug: string,
  imageId: string,
  altText: string,
  options?: AdminMediaOptions,
): Promise<MediaOutcome> {
  assertActor(actor);

  const trimmed = altText.trim().slice(0, MAX_ALT_TEXT);
  if (trimmed.length === 0) {
    return {
      ok: false,
      reason: "invalid",
      message: "Alt text describes the image to somebody who cannot see it, so it cannot be empty.",
    };
  }

  const productId = await findProductId(slug, options);
  if (!productId) return missing();

  const result = await media(options).setAltText(productId, imageId, trimmed);
  if (!result.ok) return missing();
  return { ok: true, view: view(slug, result.images, storage(options)) };
}

export async function setPrimaryImage(
  actor: AdminActor,
  slug: string,
  imageId: string,
  options?: AdminMediaOptions,
): Promise<MediaOutcome> {
  assertActor(actor);
  const productId = await findProductId(slug, options);
  if (!productId) return missing();

  const result = await media(options).setPrimary(productId, imageId);
  if (!result.ok) return missing();
  return { ok: true, view: view(slug, result.images, storage(options)) };
}

export async function reorderImages(
  actor: AdminActor,
  slug: string,
  orderedIds: readonly string[],
  options?: AdminMediaOptions,
): Promise<MediaOutcome> {
  assertActor(actor);

  if (orderedIds.length === 0 || orderedIds.length > MAX_IMAGES_PER_PRODUCT) {
    return { ok: false, reason: "invalid", message: "That is not a gallery order." };
  }
  if (!orderedIds.every((id) => typeof id === "string" && id.length > 0 && id.length <= 64)) {
    return { ok: false, reason: "invalid", message: "That is not a gallery order." };
  }

  const productId = await findProductId(slug, options);
  if (!productId) return missing();

  const result = await media(options).reorder(productId, orderedIds);
  if (!result.ok) {
    return result.reason === "stale"
      ? {
          ok: false,
          reason: "stale",
          message: "This gallery changed while you were looking at it. Reload and try again.",
        }
      : missing();
  }
  return { ok: true, view: view(slug, result.images, storage(options)) };
}

export async function removeImage(
  actor: AdminActor,
  slug: string,
  imageId: string,
  options?: AdminMediaOptions,
): Promise<MediaOutcome> {
  assertActor(actor);
  const productId = await findProductId(slug, options);
  if (!productId) return missing();

  const driver = storage(options);
  const result = await media(options).remove(productId, imageId);
  if (!result.ok || !result.images) {
    if (result.reason === "last-image") {
      return {
        ok: false,
        reason: "last-image",
        message:
          "A product keeps at least one image. Add its replacement first, then remove this one.",
      };
    }
    return missing();
  }

  // The row is gone either way. Deleting the object is best-effort: a
  // read-only driver cannot, and a gallery pointing at nothing is a worse
  // outcome than a bucket holding one object nothing references.
  if (result.removedKey && driver.writable) {
    try {
      await driver.remove(result.removedKey);
    } catch (error) {
      console.warn(
        `[media] Detached the image but could not delete the object: ${
          error instanceof Error ? error.name : "unknown error"
        }`,
      );
    }
  }

  return { ok: true, view: view(slug, result.images, driver) };
}

/**
 * Stores an uploaded image and attaches it.
 *
 * The bytes are the only thing trusted about the upload: the format and the
 * dimensions come from parsing the header, never from the filename or the
 * declared content type, and the storage key is *constructed* here from the
 * product's slug rather than taken from the client. A caller cannot choose
 * where the object lands, what it is called, or what the database believes it
 * to be.
 */
export async function addUploadedImage(
  actor: AdminActor,
  slug: string,
  upload: { bytes: Uint8Array; altText: string; label: string },
  options?: AdminMediaOptions,
): Promise<MediaOutcome> {
  assertActor(actor);

  const driver = storage(options);
  if (!driver.writable) {
    return {
      ok: false,
      reason: "read-only",
      message:
        "This deployment serves committed image files, so it cannot accept uploads. Add the image to the repository and re-run the media seed.",
    };
  }

  if (upload.bytes.byteLength === 0 || upload.bytes.byteLength > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      reason: "invalid",
      message: `An image must be between 1 byte and ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.`,
    };
  }

  const measured = readImageMetadata(upload.bytes);
  if (!measured) {
    return {
      ok: false,
      reason: "invalid",
      message: "That file is not a WebP, AVIF, PNG or JPEG image.",
    };
  }

  const altText = upload.altText.trim().slice(0, MAX_ALT_TEXT);
  if (altText.length === 0) {
    return {
      ok: false,
      reason: "invalid",
      message: "Describe the image so it can be read out to somebody who cannot see it.",
    };
  }
  const label = (upload.label.trim() || "Gallery").slice(0, MAX_LABEL);

  const productId = await findProductId(slug, options);
  if (!productId) return missing();

  const existing = await media(options).listForProduct(productId);
  if (existing.length >= MAX_IMAGES_PER_PRODUCT) {
    return {
      ok: false,
      reason: "too-many",
      message: `A product may have at most ${MAX_IMAGES_PER_PRODUCT} images.`,
    };
  }

  // Built from the slug and a content hash: two different files never collide
  // and the same file re-uploaded lands on the same key, which the
  // `(productId, storageKey)` constraint then turns into an update.
  const fingerprint = await digest(upload.bytes);
  const key = productImageKey(slug, `upload-${fingerprint}`, measured.format);

  try {
    await driver.put(key, upload.bytes, measured.format);
  } catch (error) {
    if (error instanceof MediaStorageError) {
      return { ok: false, reason: "read-only", message: error.message };
    }
    throw error;
  }

  await media(options).add({
    productId,
    storageKey: key,
    altText,
    label,
    source: "uploaded",
    width: measured.width,
    height: measured.height,
    byteSize: measured.byteSize,
    format: measured.format,
  });

  return {
    ok: true,
    view: view(slug, await media(options).listForProduct(productId), driver),
  };
}

async function digest(bytes: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return [...new Uint8Array(hash)]
    .slice(0, 8)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function missing(): MediaOutcome {
  // A product that does not exist and an image that belongs to another
  // product get the same answer: the panel learns nothing by guessing.
  return { ok: false, reason: "not-found", message: "That image could not be found." };
}
