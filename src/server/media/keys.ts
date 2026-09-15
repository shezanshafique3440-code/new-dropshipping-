/**
 * Storage keys.
 *
 * A key is the *only* thing the database stores about where an image lives:
 * `products/aeropulse-wireless-headphones/front.webp`. It is not a URL and it
 * is not a filesystem path, and keeping it that way is what makes the media
 * layer portable — the same row resolves to `/products/...` on this origin in
 * development and to a bucket behind a CDN in production.
 *
 * The rules below are mirrored by a CHECK constraint in
 * `20260915104200_product_media`. Two copies on purpose: the constraint is the
 * one that cannot be bypassed, this one is the one that can explain itself.
 */

/** The container formats the storefront will serve. */
export const MEDIA_FORMATS = ["webp", "avif", "png", "jpeg"] as const;

export type MediaFormat = (typeof MEDIA_FORMATS)[number];

export function isMediaFormat(value: string): value is MediaFormat {
  return (MEDIA_FORMATS as readonly string[]).includes(value);
}

/** File extension a format is written with. */
export const MEDIA_EXTENSIONS: Record<MediaFormat, string> = {
  webp: "webp",
  avif: "avif",
  png: "png",
  jpeg: "jpg",
};

export const MEDIA_CONTENT_TYPES: Record<MediaFormat, string> = {
  webp: "image/webp",
  avif: "image/avif",
  png: "image/png",
  jpeg: "image/jpeg",
};

const KEY_PATTERN = /^[a-z0-9][a-z0-9._/-]*\.[a-z0-9]{2,5}$/;

export const MAX_KEY_LENGTH = 300;

/**
 * True for a key that is safe to hand to any storage driver.
 *
 * The interesting half is what is rejected: an absolute path, a Windows path,
 * a scheme, a protocol-relative `//host`, a `..` segment, a backslash, a
 * percent escape, a NUL. A driver that joins a key onto a directory or onto a
 * bucket URL cannot be talked out of its own namespace by any of them.
 */
export function isValidStorageKey(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value.length === 0 || value.length > MAX_KEY_LENGTH) return false;
  if (!KEY_PATTERN.test(value)) return false;
  if (value.includes("..") || value.includes("//")) return false;
  return value.split("/").every((segment) => segment !== "" && segment !== "." && segment !== "..");
}

/** The key the generated render of one product view is stored under. */
export function productImageKey(slug: string, view: string, format: MediaFormat): string {
  return `products/${slug}/${view}.${MEDIA_EXTENSIONS[format]}`;
}
