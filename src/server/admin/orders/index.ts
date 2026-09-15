import { PrismaAdminOrderRepository } from "./prisma-repository";
import type { AdminOrderRepository } from "./repository";

/**
 * The admin order repository the panel uses.
 *
 * One place decides which adapter is in play, mirroring the storefront's
 * `getOrderRepository()`. PostgreSQL is the only answer in a running
 * application; the override exists so a test can substitute an adapter and
 * put the real one back afterwards.
 */

let repository: AdminOrderRepository | null = null;

export function getAdminOrderRepository(): AdminOrderRepository {
  repository ??= new PrismaAdminOrderRepository();
  return repository;
}

export function setAdminOrderRepositoryForTesting(
  override: AdminOrderRepository | null,
): void {
  repository = override;
}

export type { AdminOrderRepository };
