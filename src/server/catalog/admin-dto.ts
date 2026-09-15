import { toPriceInput } from "@/lib/money";
import type { ProductCategory } from "@/types";

import type { AdminProductRecord, ProductStatus } from "./repository";

/**
 * What the operations panel is allowed to see of a product.
 *
 * Wider than the storefront's view — status, sort order, timestamps, the
 * unpublished ones at all — and still hand-written. It carries catalogue
 * fields and nothing else: no connection details, no environment values, no
 * customer data, no hash or token of any kind, because none of those are in
 * the type.
 *
 * Prices appear twice on purpose: `priceAmount` is the record, in minor
 * units, and `priceInput` is the same number formatted the way the form's
 * text field wants it, so the editor never has to divide by a hundred.
 */

export interface AdminProductView {
  slug: string;
  name: string;
  description: string;
  shortDescription: string | null;
  category: ProductCategory;
  features: readonly string[];
  /** Minor units — the record. */
  priceAmount: number;
  compareAtPriceAmount: number | null;
  /** The same values as the form types them: "79.99". */
  priceInput: string;
  compareAtPriceInput: string;
  currency: string;
  status: ProductStatus;
  featured: boolean;
  bestseller: boolean;
  trending: boolean;
  newArrival: boolean;
  sortOrder: number;
  artKey: string;
  tone: string;
  badgeLabel: string;
  badgeTone: string;
  /** ISO 8601. */
  createdAt: string;
  updatedAt: string;
}

export function toAdminProductView(record: AdminProductRecord): AdminProductView {
  const { product } = record;

  return {
    slug: product.slug,
    name: product.name,
    description: product.description,
    shortDescription: record.shortDescription,
    category: product.category,
    features: product.features,
    priceAmount: product.priceAmount,
    compareAtPriceAmount: product.compareAtPriceAmount ?? null,
    priceInput: toPriceInput(product.priceAmount),
    compareAtPriceInput:
      product.compareAtPriceAmount === undefined
        ? ""
        : toPriceInput(product.compareAtPriceAmount),
    currency: product.currency,
    status: record.status,
    featured: product.featured === true,
    bestseller: product.tags.includes("bestSeller"),
    trending: product.tags.includes("trending"),
    newArrival: product.tags.includes("newArrival"),
    sortOrder: record.sortOrder,
    artKey: product.art,
    tone: product.tone,
    badgeLabel: product.badge?.label ?? "",
    badgeTone: product.badge?.tone ?? "",
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
