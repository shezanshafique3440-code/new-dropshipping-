import { PrismaCatalogRepository } from "./prisma-repository";
import type { CatalogRepository } from "./repository";

/**
 * The catalogue repository the application uses.
 *
 * One place decides which adapter is in play, mirroring the order and admin
 * repositories. PostgreSQL is the only answer in a running application.
 */

let repository: CatalogRepository | null = null;

export function getCatalogRepository(): CatalogRepository {
  repository ??= new PrismaCatalogRepository();
  return repository;
}

/** Lets a test substitute an adapter, and put the real one back afterwards. */
export function setCatalogRepositoryForTesting(
  override: CatalogRepository | null,
): void {
  repository = override;
}

export type { CatalogRepository };
