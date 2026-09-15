import { PrismaProductMediaRepository } from "./prisma-repository";
import type { ProductMediaRepository } from "./repository";

/**
 * The media repository the application uses.
 *
 * One place decides which adapter is in play, mirroring the catalogue, order
 * and admin repositories. PostgreSQL is the only answer in a running
 * application.
 */

let repository: ProductMediaRepository | null = null;

export function getProductMediaRepository(): ProductMediaRepository {
  repository ??= new PrismaProductMediaRepository();
  return repository;
}

/** Lets a test substitute an adapter, and put the real one back afterwards. */
export function setProductMediaRepositoryForTesting(
  override: ProductMediaRepository | null,
): void {
  repository = override;
}

export type { ProductMediaRepository };
