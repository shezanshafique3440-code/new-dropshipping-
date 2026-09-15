import { revalidatePath } from "next/cache";

/**
 * Clearing the cached renders a catalogue change makes wrong.
 *
 * Kept apart from the service on purpose: `next/cache` only works inside a
 * Next request, and the service is domain logic that a test — or a future
 * script — should be able to call without a framework around it. The routes
 * know they are in a request; the service does not have to.
 *
 * The storefront routes are dynamic, so this is mostly about the client's
 * router cache: without it, a shopper who has already visited /shop can keep
 * seeing yesterday's price after navigating back to it.
 */
export function revalidateCatalogue(slug: string): void {
  for (const path of [
    "/",
    "/shop",
    `/shop/${slug}`,
    "/admin/products",
    `/admin/products/${slug}`,
  ]) {
    revalidatePath(path);
  }
}
