import type { AdminActor } from "@/server/admin/orders/service";

import { toAdminProductView, type AdminProductView } from "./admin-dto";
import { getCatalogRepository } from "./index";
import { isSlugTakenError } from "./prisma-repository";
import type {
  AdminProductFilters,
  CatalogRepository,
  NewProduct,
  ProductStatus,
} from "./repository";
import {
  hasProductErrors,
  isProductSlug,
  validateProduct,
  type ProductErrors,
  type ProductInput,
} from "./validation";

/**
 * Managing the catalogue.
 *
 * Every function takes an `AdminActor` — the same proof `requireAdmin()`
 * produces for the order panel — as its first argument, so a page or endpoint
 * that has not resolved an administrator cannot read an unpublished product,
 * let alone write one. That is the compiler enforcing the rule, not a comment
 * asking for it.
 *
 * Validation runs here rather than in the route: the same rules apply whether
 * a product arrives from the form, a future import, or a test.
 *
 * Cache revalidation is *not* here — it needs a Next request, and this layer
 * should be callable without one. The routes do it, through
 * `./revalidate.ts`, after a write succeeds.
 */

export interface AdminCatalogOptions {
  repository?: CatalogRepository;
}

function repo(options?: AdminCatalogOptions): CatalogRepository {
  return options?.repository ?? getCatalogRepository();
}

function assertActor(actor: AdminActor): void {
  if (!actor?.id) {
    throw new Error("An administrator must be resolved before managing products.");
  }
}

/* ------------------------------------------------------------------ reads */

export interface AdminProductListView {
  products: readonly AdminProductView[];
  total: number;
  page: number;
  pageCount: number;
}

export async function listAdminProducts(
  actor: AdminActor,
  filters: AdminProductFilters,
  page: number,
  perPage: number,
  options?: AdminCatalogOptions,
): Promise<AdminProductListView> {
  assertActor(actor);

  const safePage = Math.max(1, Math.trunc(page));
  const result = await repo(options).listForAdmin({
    ...filters,
    limit: perPage,
    offset: (safePage - 1) * perPage,
  });

  return {
    products: result.products.map(toAdminProductView),
    total: result.total,
    page: safePage,
    pageCount: Math.max(1, Math.ceil(result.total / perPage)),
  };
}

export async function getAdminProduct(
  actor: AdminActor,
  slug: string,
  options?: AdminCatalogOptions,
): Promise<AdminProductView | null> {
  assertActor(actor);
  if (!isProductSlug(slug)) {
    return null;
  }
  const record = await repo(options).findForAdmin(slug);
  return record ? toAdminProductView(record) : null;
}

/* ----------------------------------------------------------------- writes */

export type SaveOutcome =
  | { ok: true; product: AdminProductView }
  | { ok: false; reason: "invalid"; errors: ProductErrors }
  | { ok: false; reason: "slug-taken" }
  | { ok: false; reason: "not-found" }
  | { ok: false; reason: "conflict" };

/**
 * Creates a product.
 *
 * The slug doubles as the product's id, which is what `order_items` and
 * Stripe metadata already record for every product the shop has ever sold.
 * Uniqueness is decided by the database, not by looking first: two
 * simultaneous creates would both pass a "does this exist?" check, and only
 * the unique index can actually stop the second.
 */
export async function createProduct(
  actor: AdminActor,
  input: ProductInput,
  options?: AdminCatalogOptions,
): Promise<SaveOutcome> {
  assertActor(actor);

  const validated = validateProduct(input);
  if (!validated.ok) {
    return { ok: false, reason: "invalid", errors: validated.errors };
  }

  const draft: NewProduct = { ...validated.value, id: validated.value.slug };

  try {
    const record = await repo(options).create(draft);
    console.info(`[catalog] ${actor.email} created product ${draft.slug}.`);
    return { ok: true, product: toAdminProductView(record) };
  } catch (error) {
    if (isSlugTakenError(error)) {
      return { ok: false, reason: "slug-taken" };
    }
    throw error;
  }
}

/**
 * Applies an edit.
 *
 * The slug is not editable — an existing URL must not stop working, and an
 * order's snapshot must keep naming something recognisable — so it is read
 * from the route, never from the body. `expectedUpdatedAt` is the version the
 * editor loaded; a save against a stale copy is refused rather than silently
 * overwriting a colleague's work.
 *
 * Nothing here touches `order_items`. Editing a product cannot change what an
 * old order says was bought or charged.
 */
export async function updateProduct(
  actor: AdminActor,
  slug: string,
  input: ProductInput,
  expectedUpdatedAt: Date,
  options?: AdminCatalogOptions,
): Promise<SaveOutcome> {
  assertActor(actor);

  const validated = validateProduct({ ...input, slug }, { requireSlug: false });
  if (!validated.ok) {
    return { ok: false, reason: "invalid", errors: validated.errors };
  }

  const existing = await repo(options).findForAdmin(slug);
  if (!existing) {
    return { ok: false, reason: "not-found" };
  }

  const result = await repo(options).update(
    slug,
    {
      ...validated.value,
      // Ratings are seed figures the form does not edit; keep whatever the
      // product already had rather than clearing it on every save.
      rating: existing.product.rating
        ? {
            value: Math.round(existing.product.rating.value * 10),
            count: existing.product.rating.count,
          }
        : null,
    },
    expectedUpdatedAt,
  );

  if (!result.ok) {
    return result;
  }

  console.info(`[catalog] ${actor.email} updated product ${slug}.`);
  return { ok: true, product: toAdminProductView(result.product) };
}

/**
 * Publishes, unpublishes or archives.
 *
 * Every one of these is a status change and nothing else: no price, no name,
 * no flag moves with it. Archiving is how a product leaves the shop — it is
 * never deleted, because an order may name it and the catalogue is the only
 * place that knows what that name looked like.
 */
export async function setProductStatus(
  actor: AdminActor,
  slug: string,
  status: ProductStatus,
  expectedUpdatedAt: Date,
  options?: AdminCatalogOptions,
): Promise<SaveOutcome> {
  assertActor(actor);

  const result = await repo(options).setStatus(slug, status, expectedUpdatedAt);
  if (!result.ok) {
    return result;
  }

  console.info(`[catalog] ${actor.email} set product ${slug} to ${status}.`);
  return { ok: true, product: toAdminProductView(result.product) };
}

export function productHasErrors(errors: ProductErrors): boolean {
  return hasProductErrors(errors);
}
