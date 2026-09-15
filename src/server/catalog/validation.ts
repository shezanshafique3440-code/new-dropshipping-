import { parsePriceInput } from "@/lib/money";
import { isProductCategory } from "@/lib/product-categories";
import {
  ART_TONES,
  PRODUCT_ART_KEYS,
  type ArtTone,
  type ProductArtKey,
  type ProductBadgeTone,
  type ProductCategory,
} from "@/types";

import { PRODUCT_STATUSES, type NewProduct, type ProductStatus } from "./repository";

/**
 * What a product has to look like before it reaches the database.
 *
 * The admin form checks the same rules in the browser so an operator gets an
 * answer immediately, but that copy is a convenience: only this run decides
 * anything, and the table's CHECK constraints sit behind it as a third line.
 *
 * Everything is narrowed from `unknown`. Nothing is coerced into something
 * plausible — a price with three decimals is refused with a reason, not
 * rounded.
 */

export const MAX_NAME_LENGTH = 200;
export const MAX_SLUG_LENGTH = 160;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_SHORT_DESCRIPTION_LENGTH = 300;
export const MAX_FEATURES = 12;
export const MAX_FEATURE_LENGTH = 200;
export const MAX_SORT_ORDER = 100_000;

/** The one currency the shop takes today; the column is ready for more. */
export const SUPPORTED_CURRENCIES = ["usd"] as const;

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type ProductField =
  | "name"
  | "slug"
  | "shortDescription"
  | "description"
  | "category"
  | "price"
  | "compareAtPrice"
  | "currency"
  | "status"
  | "sortOrder"
  | "artKey"
  | "tone"
  | "features"
  | "badgeLabel"
  | "badgeTone";

export type ProductErrors = Partial<Record<ProductField, string>>;

/** The form's own shape: strings, as a browser sends them. */
export interface ProductInput {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  /** As typed: "19.99". */
  price: string;
  compareAtPrice: string;
  currency: string;
  status: string;
  featured: boolean;
  bestseller: boolean;
  trending: boolean;
  newArrival: boolean;
  sortOrder: string;
  artKey: string;
  tone: string;
  /** One per line in the form. */
  features: string;
  badgeLabel: string;
  badgeTone: string;
}

export const emptyProductInput: ProductInput = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "Tech",
  price: "",
  compareAtPrice: "",
  currency: "usd",
  status: "draft",
  featured: false,
  bestseller: false,
  trending: false,
  newArrival: false,
  sortOrder: "0",
  artKey: "headphones",
  tone: "violet",
  features: "",
  badgeLabel: "",
  badgeTone: "",
};

export type ValidationResult =
  | { ok: true; value: Omit<NewProduct, "id"> }
  | { ok: false; errors: ProductErrors };

/** Reads a form field from an untrusted body, trimmed and length-capped. */
export function readProductInput(body: Record<string, unknown>): ProductInput {
  const text = (key: keyof ProductInput, max: number): string => {
    const value = body[key];
    return typeof value === "string" ? value.slice(0, max).trim() : "";
  };
  const flag = (key: keyof ProductInput): boolean => body[key] === true;

  return {
    name: text("name", MAX_NAME_LENGTH + 1),
    slug: text("slug", MAX_SLUG_LENGTH + 1),
    shortDescription: text("shortDescription", MAX_SHORT_DESCRIPTION_LENGTH + 1),
    description: text("description", MAX_DESCRIPTION_LENGTH + 1),
    category: text("category", 40),
    price: text("price", 24),
    compareAtPrice: text("compareAtPrice", 24),
    currency: text("currency", 8).toLowerCase() || "usd",
    status: text("status", 20),
    featured: flag("featured"),
    bestseller: flag("bestseller"),
    trending: flag("trending"),
    newArrival: flag("newArrival"),
    sortOrder: text("sortOrder", 12),
    artKey: text("artKey", 40),
    tone: text("tone", 20),
    features: typeof body.features === "string" ? body.features.slice(0, 4000) : "",
    badgeLabel: text("badgeLabel", 40),
    badgeTone: text("badgeTone", 20),
  };
}

export function validateProduct(
  input: ProductInput,
  options: { requireSlug?: boolean } = {},
): ValidationResult {
  const errors: ProductErrors = {};

  const name = input.name.trim();
  if (!name) {
    errors.name = "Give the product a name.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Keep the name under ${MAX_NAME_LENGTH} characters.`;
  }

  const slug = input.slug.trim().toLowerCase();
  if (options.requireSlug !== false) {
    if (!slug) {
      errors.slug = "Give the product a slug.";
    } else if (slug.length > MAX_SLUG_LENGTH) {
      errors.slug = `Keep the slug under ${MAX_SLUG_LENGTH} characters.`;
    } else if (!SLUG_PATTERN.test(slug)) {
      errors.slug =
        "Use lowercase letters, numbers and single hyphens, like aeropulse-headphones.";
    }
  }

  const description = input.description.trim();
  if (!description) {
    errors.description = "Describe the product.";
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Keep the description under ${MAX_DESCRIPTION_LENGTH} characters.`;
  }

  if (input.shortDescription.length > MAX_SHORT_DESCRIPTION_LENGTH) {
    errors.shortDescription = `Keep this under ${MAX_SHORT_DESCRIPTION_LENGTH} characters.`;
  }

  if (!isProductCategory(input.category)) {
    errors.category = "Choose one of the catalogue's categories.";
  }

  const price = parsePriceInput(input.price);
  if (!price.ok) {
    errors.price = price.reason;
  }

  let compareAtPriceAmount: number | null = null;
  if (input.compareAtPrice.trim()) {
    const compare = parsePriceInput(input.compareAtPrice);
    if (!compare.ok) {
      errors.compareAtPrice = compare.reason;
    } else if (price.ok && compare.minor < price.minor) {
      // A struck-through price below the real one would be a lie about a
      // discount, so it is refused rather than quietly hidden.
      errors.compareAtPrice = "The compare-at price cannot be below the price.";
    } else {
      compareAtPriceAmount = compare.minor;
    }
  }

  if (!(SUPPORTED_CURRENCIES as readonly string[]).includes(input.currency)) {
    errors.currency = `The shop takes ${SUPPORTED_CURRENCIES.join(", ").toUpperCase()} today.`;
  }

  if (!(PRODUCT_STATUSES as readonly string[]).includes(input.status)) {
    errors.status = "Choose draft, published or archived.";
  }

  const sortOrder = Number(input.sortOrder || "0");
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > MAX_SORT_ORDER) {
    errors.sortOrder = `Use a whole number between 0 and ${MAX_SORT_ORDER}.`;
  }

  if (!(PRODUCT_ART_KEYS as readonly string[]).includes(input.artKey)) {
    errors.artKey = "Choose one of the built-in illustrations.";
  }
  if (!(ART_TONES as readonly string[]).includes(input.tone)) {
    errors.tone = "Choose one of the artwork tones.";
  }

  const features = input.features
    .split("\n")
    .map((feature) => feature.trim())
    .filter(Boolean);
  if (features.length > MAX_FEATURES) {
    errors.features = `List at most ${MAX_FEATURES} selling points.`;
  } else if (features.some((feature) => feature.length > MAX_FEATURE_LENGTH)) {
    errors.features = `Keep each selling point under ${MAX_FEATURE_LENGTH} characters.`;
  }

  const badgeLabel = input.badgeLabel.trim();
  const badgeTone = input.badgeTone.trim();
  const badgeTones: readonly ProductBadgeTone[] = [
    "new",
    "trending",
    "bestseller",
    "popular",
    "sale",
  ];
  if (badgeLabel && !badgeTone) {
    errors.badgeTone = "Choose a tone for the badge, or clear the label.";
  }
  if (badgeTone && !badgeLabel) {
    errors.badgeLabel = "Give the badge a label, or clear the tone.";
  }
  if (badgeTone && !(badgeTones as readonly string[]).includes(badgeTone)) {
    errors.badgeTone = "That is not one of the badge tones.";
  }

  if (Object.keys(errors).length > 0 || !price.ok) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      slug,
      name,
      description,
      shortDescription: input.shortDescription.trim() || null,
      // Narrowed by `isProductCategory` above; the guard is the only way a
      // category reaches this point.
      category: input.category as ProductCategory,
      features,
      priceAmount: price.minor,
      compareAtPriceAmount,
      currency: input.currency,
      status: input.status as ProductStatus,
      featured: input.featured,
      bestseller: input.bestseller,
      trending: input.trending,
      newArrival: input.newArrival,
      sortOrder,
      artKey: input.artKey as ProductArtKey,
      tone: input.tone as ArtTone,
      badge: badgeLabel && badgeTone ? { label: badgeLabel, tone: badgeTone } : null,
      // Ratings are demo figures from the seed; the form does not edit them,
      // and an edit preserves whatever the product already had.
      rating: null,
    },
  };
}

export function hasProductErrors(errors: ProductErrors): boolean {
  return Object.values(errors).some(Boolean);
}
