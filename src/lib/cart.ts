import {
  ART_TONES,
  PRODUCT_ART_KEYS,
  PRODUCT_CATEGORIES,
  type CartItem,
  type CartItemImage,
  type CartState,
  type Product,
} from "@/types";

/**
 * Cart domain logic.
 *
 * Everything here is pure and framework-free: the same functions back the
 * provider, the drawer, the cart page and — later — a server-side cart. No
 * component should recompute a line total or read storage directly.
 */

/** Namespaced so it cannot collide with anything else on the origin. */
export const CART_STORAGE_KEY = "zyvero-cart";

/** Bumped when the stored shape changes, so old payloads can be discarded. */
export const CART_STORAGE_VERSION = 1;

/** Upper bound per line. Keeps totals sane and blocks absurd stored values. */
export const MAX_LINE_QUANTITY = 99;

export const emptyCart: CartState = { items: [], hydrated: false };

/* -------------------------------------------------------------------------
 * Guards
 * ---------------------------------------------------------------------- */

/** True for a real, finite, non-negative price. Rejects NaN and Infinity. */
export function isValidPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/** Coerces any input to a whole quantity within `[1, MAX_LINE_QUANTITY]`. */
export function sanitizeQuantity(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return 1;
  }
  return Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.floor(parsed)));
}

/* -------------------------------------------------------------------------
 * Line construction
 * ---------------------------------------------------------------------- */

/** Builds a cart line from a catalogue product, or null if it is unsellable. */
export function toCartItem(product: Product, quantity: number): CartItem | null {
  if (!isValidPrice(product.price)) {
    return null;
  }
  const image = product.images.find((entry) => entry.primary) ?? product.images[0];
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    quantity: sanitizeQuantity(quantity),
    art: product.art,
    tone: product.tone,
    ...(image
      ? {
          image: {
            src: image.src,
            alt: image.alt,
            width: image.width,
            height: image.height,
          },
        }
      : {}),
    ...(product.badge ? { badge: product.badge } : {}),
  };
}

/* -------------------------------------------------------------------------
 * Operations — each returns a new items array
 * ---------------------------------------------------------------------- */

export function addItem(
  items: readonly CartItem[],
  product: Product,
  quantity = 1,
): readonly CartItem[] {
  const line = toCartItem(product, quantity);
  if (!line) {
    return items;
  }

  const existing = items.find((item) => item.productId === product.id);
  if (!existing) {
    return [...items, line];
  }

  // Same product twice increases the line rather than duplicating it.
  return items.map((item) =>
    item.productId === product.id
      ? { ...line, quantity: sanitizeQuantity(item.quantity + line.quantity) }
      : item,
  );
}

export function setItemQuantity(
  items: readonly CartItem[],
  productId: string,
  quantity: number,
): readonly CartItem[] {
  const next = sanitizeQuantity(quantity);
  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: next } : item,
  );
}

export function removeItem(
  items: readonly CartItem[],
  productId: string,
): readonly CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

/* -------------------------------------------------------------------------
 * Calculations — the only place `price × quantity` is written
 * ---------------------------------------------------------------------- */

export function getCartLineTotal(item: CartItem): number {
  return item.price * item.quantity;
}

export function getCartItemCount(items: readonly CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(items: readonly CartItem[]): number {
  return items.reduce((total, item) => total + getCartLineTotal(item), 0);
}

export function isInCart(
  items: readonly CartItem[],
  productId: string,
): boolean {
  return items.some((item) => item.productId === productId);
}

export function getCartQuantity(
  items: readonly CartItem[],
  productId: string,
): number {
  return items.find((item) => item.productId === productId)?.quantity ?? 0;
}

/** Formats a count for the header badge, capping the width of the pill. */
export function formatCartCount(count: number): string {
  return count > 99 ? "99+" : String(count);
}

/* -------------------------------------------------------------------------
 * Persistence
 *
 * Stored payloads are untrusted: they may be hand-edited, left behind by an
 * older build, or corrupted. Every field is re-validated, and anything that
 * cannot be recovered is dropped rather than rendered.
 * ---------------------------------------------------------------------- */

interface StoredCart {
  version: number;
  items: unknown[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

/**
 * Rebuilds one line from stored data.
 *
 * Stored lines carry their own snapshot, so the cart renders without the
 * catalogue and this module stays dependency-free. Anything that fails
 * validation is dropped rather than rendered — a corrupted entry must never
 * reach the UI or the totals.
 */
/**
 * Validates a stored thumbnail before it is rendered.
 *
 * Local storage is not trusted input: it survives across sessions, it is
 * writable by anything running on this origin, and its contents end up in an
 * `src` attribute. So the shape is checked and the source has to be either a
 * relative path under the media folder or a plain https URL — never a
 * `javascript:` or `data:` source, never a protocol-relative `//host`, never
 * a backslash. Anything else drops the thumbnail and the line falls back to
 * the artwork panel, which is a cosmetic loss rather than a broken page.
 */
function reviveImage(raw: unknown): CartItemImage | undefined {
  if (!isRecord(raw)) return undefined;
  const { src, alt, width, height } = raw;

  if (typeof src !== "string" || src.length === 0 || src.length > 500) return undefined;
  if (typeof alt !== "string" || alt.length > 400) return undefined;
  if (!isPositiveInteger(width) || !isPositiveInteger(height)) return undefined;
  if (width > 10_000 || height > 10_000) return undefined;

  const relative =
    src.startsWith("/products/") && !src.includes("\\") && !src.includes("//");
  const remote = /^https:\/\/[^\s"'\\]+$/.test(src);
  if (!relative && !remote) return undefined;

  return { src, alt, width, height };
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function reviveItem(raw: unknown): CartItem | null {
  if (!isRecord(raw)) {
    return null;
  }

  const { productId, slug, name, category, price, art, tone } = raw;

  if (
    typeof productId !== "string" ||
    productId.length === 0 ||
    typeof slug !== "string" ||
    slug.length === 0 ||
    typeof name !== "string" ||
    name.length === 0 ||
    !isOneOf(category, PRODUCT_CATEGORIES) ||
    !isOneOf(art, PRODUCT_ART_KEYS) ||
    !isOneOf(tone, ART_TONES) ||
    !isValidPrice(price)
  ) {
    return null;
  }

  const image = reviveImage(raw.image);

  return {
    productId,
    slug,
    name,
    category,
    price,
    quantity: sanitizeQuantity(raw.quantity),
    art,
    tone,
    ...(image ? { image } : {}),
  };
}

/** Parses a raw storage string into valid lines. Never throws. */
export function parseStoredCart(raw: string | null): readonly CartItem[] {
  if (!raw) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!isRecord(parsed)) {
    return [];
  }
  const stored: Partial<StoredCart> = parsed;
  if (!Array.isArray(stored.items)) {
    return [];
  }
  if (stored.version !== CART_STORAGE_VERSION) {
    // Unknown version: start clean rather than guess at the shape.
    return [];
  }

  const revived = stored.items
    .map(reviveItem)
    .filter((item): item is CartItem => item !== null);

  // Collapse any duplicate lines a corrupted payload may contain.
  const merged = new Map<string, CartItem>();
  for (const item of revived) {
    const existing = merged.get(item.productId);
    merged.set(
      item.productId,
      existing
        ? { ...item, quantity: sanitizeQuantity(existing.quantity + item.quantity) }
        : item,
    );
  }
  return [...merged.values()];
}

export function serializeCart(items: readonly CartItem[]): string {
  return JSON.stringify({ version: CART_STORAGE_VERSION, items });
}

/** Reads the persisted cart. Safe to call only in the browser. */
export function readStoredCart(): readonly CartItem[] {
  try {
    return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    // Storage can throw in private mode or when blocked by the user.
    return [];
  }
}

export function writeStoredCart(items: readonly CartItem[]): void {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(items));
  } catch {
    // A cart that cannot be persisted still works for this session.
  }
}
