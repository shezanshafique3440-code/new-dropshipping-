/**
 * Where product images live.
 *
 * One interface, two drivers, and a deliberate shape: nothing above this file
 * knows whether an image is a file in `public/` or an object in a bucket
 * behind a CDN. A row stores a key; the driver turns the key into a public URL
 * and, if it can accept writes, into an object.
 *
 * Adding S3, R2 or GCS is a third class implementing `ProductMediaStorage` and
 * one more branch in `createStorage` — no migration, no change to a component,
 * no change to a row. That is the whole point of keeping URLs out of the
 * database.
 *
 * Nothing here ever exposes a credential or a filesystem path: `publicUrl`
 * returns a public URL and the absolute path a local write lands on stays
 * inside this module.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { isValidStorageKey, type MediaFormat } from "./keys";

export class MediaStorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "MediaStorageError";
  }
}

export interface ProductMediaStorage {
  /** Names the driver in diagnostics and in the panel. Never a credential. */
  readonly driver: string;

  /**
   * Whether this deployment can accept new objects.
   *
   * False is an honest answer, not a failure: a CDN driver with no write
   * credentials, or a read-only filesystem, genuinely cannot store an upload.
   * The panel reads this and says so rather than offering a button that
   * pretends.
   */
  readonly writable: boolean;

  /** The URL a browser fetches this key from. */
  publicUrl(key: string): string;

  /** Stores an object. Throws `MediaStorageError` if the driver is read-only. */
  put(key: string, body: Uint8Array, format: MediaFormat): Promise<void>;

  /** Removes an object. Missing is success — deleting twice is not an error. */
  remove(key: string): Promise<void>;
}

function assertKey(key: string): void {
  if (!isValidStorageKey(key)) {
    // The key is echoed because it is ours, not a secret; a path is not.
    throw new MediaStorageError(`"${key}" is not a valid storage key.`);
  }
}

/* ------------------------------------------------- driver: public/ folder */

/**
 * The repository's own `public/products` folder.
 *
 * The development and single-server default. Keys resolve to same-origin
 * paths, which Next's image optimiser serves without any remote host being
 * allowed at all.
 *
 * Writes are real — `put` writes the bytes — but they are only durable where
 * the filesystem is: a platform that rebuilds the bundle on each deploy, or
 * serves it read-only, loses them. So writes are off unless switched on, and
 * `writable` tells the truth either way.
 */
export class PublicDirectoryStorage implements ProductMediaStorage {
  readonly driver = "public-directory";

  readonly writable: boolean;

  private readonly root: string;

  constructor(options: { root?: string; writable?: boolean } = {}) {
    this.root = options.root ?? path.join(process.cwd(), "public");
    this.writable = options.writable ?? false;
  }

  publicUrl(key: string): string {
    assertKey(key);
    return `/${key}`;
  }

  /**
   * The interface's `format` argument is not taken here: a file served off
   * disk gets its content type from its extension, which the key already
   * carries. A bucket driver needs it, so the interface keeps it.
   */
  async put(key: string, body: Uint8Array): Promise<void> {
    assertKey(key);
    if (!this.writable) {
      throw new MediaStorageError(
        "This deployment stores product images as committed files, so it cannot accept uploads.",
      );
    }
    const destination = this.resolve(key);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, body);
  }

  async remove(key: string): Promise<void> {
    assertKey(key);
    if (!this.writable) {
      throw new MediaStorageError(
        "This deployment stores product images as committed files, so it cannot delete them.",
      );
    }
    await rm(this.resolve(key), { force: true });
  }

  /**
   * Belt and braces over `assertKey`: the resolved path is checked to still be
   * inside the root, so no future loosening of the key rules can turn into a
   * write outside `public/`.
   */
  private resolve(key: string): string {
    const destination = path.resolve(this.root, key);
    const root = path.resolve(this.root);
    if (destination !== root && !destination.startsWith(root + path.sep)) {
      throw new MediaStorageError("Refusing to touch a path outside the media root.");
    }
    return destination;
  }
}

/* ------------------------------------------------------------ driver: CDN */

/**
 * A public bucket or CDN, addressed by base URL.
 *
 * Read-only on purpose. Uploading would need bucket credentials, and this
 * driver has none — so rather than half-implement a write path, it reports
 * `writable: false` and the panel explains that images are published by the
 * pipeline that fills the bucket.
 */
export class PublicBaseUrlStorage implements ProductMediaStorage {
  readonly driver = "cdn";

  readonly writable = false;

  private readonly base: URL;

  constructor(baseUrl: string) {
    let parsed: URL;
    try {
      parsed = new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
    } catch {
      throw new MediaStorageError("MEDIA_PUBLIC_BASE_URL is not a valid absolute URL.");
    }
    if (parsed.protocol !== "https:") {
      throw new MediaStorageError("MEDIA_PUBLIC_BASE_URL must be an https URL.");
    }
    if (parsed.username || parsed.password || parsed.search || parsed.hash) {
      // A base URL carrying credentials or a signature would put them in every
      // rendered <img src>, which is exactly the leak this refuses.
      throw new MediaStorageError(
        "MEDIA_PUBLIC_BASE_URL must be a plain https base URL: no credentials, query or fragment.",
      );
    }
    this.base = parsed;
  }

  publicUrl(key: string): string {
    assertKey(key);
    return new URL(key, this.base).toString();
  }

  async put(): Promise<void> {
    throw new MediaStorageError(
      "The CDN media driver is read-only: objects are published by the pipeline that fills the bucket.",
    );
  }

  async remove(): Promise<void> {
    throw new MediaStorageError("The CDN media driver is read-only.");
  }
}

/* -------------------------------------------------------------- selection */

/**
 * Reads the environment once.
 *
 * `MEDIA_STORAGE_DRIVER`  public-directory (default) | cdn
 * `MEDIA_PUBLIC_BASE_URL` required by the cdn driver; an https base URL
 * `MEDIA_UPLOADS_ENABLED` opt-in for writes through the public-directory
 *                         driver. Off by default, including in production,
 *                         because most deployments serve `public/` read-only.
 *
 * None of these is a secret and none is a `NEXT_PUBLIC_` variable: the browser
 * never needs to know which driver is in play, only the URL it produced.
 */
export function createStorage(env: NodeJS.ProcessEnv = process.env): ProductMediaStorage {
  const driver = (env.MEDIA_STORAGE_DRIVER ?? "public-directory").trim();

  if (driver === "cdn") {
    const base = env.MEDIA_PUBLIC_BASE_URL?.trim();
    if (!base) {
      throw new MediaStorageError(
        'MEDIA_STORAGE_DRIVER is "cdn" but MEDIA_PUBLIC_BASE_URL is not set.',
      );
    }
    return new PublicBaseUrlStorage(base);
  }

  if (driver !== "public-directory") {
    throw new MediaStorageError(
      `Unknown MEDIA_STORAGE_DRIVER "${driver}". Expected "public-directory" or "cdn".`,
    );
  }

  return new PublicDirectoryStorage({
    writable: env.MEDIA_UPLOADS_ENABLED === "true",
  });
}

let storage: ProductMediaStorage | null = null;

export function getProductMediaStorage(): ProductMediaStorage {
  storage ??= createStorage();
  return storage;
}

/** Lets a test substitute a driver, and put the real one back afterwards. */
export function setProductMediaStorageForTesting(override: ProductMediaStorage | null): void {
  storage = override;
}
