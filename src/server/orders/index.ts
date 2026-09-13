import { isDatabaseConfigured } from "../db/config";
import { PrismaOrderRepository } from "./prisma-repository";
import type { OrderRepository } from "./repository";

/**
 * The order repository the application uses.
 *
 * One place decides which adapter is in play, so no route, service or test
 * ever reaches for a concrete implementation. PostgreSQL is the only answer
 * in a running application: if the database is not configured the call fails
 * here, loudly, rather than quietly accepting payments into a store that
 * forgets them.
 */

let repository: OrderRepository | null = null;

export function getOrderRepository(): OrderRepository {
  repository ??= new PrismaOrderRepository();
  return repository;
}

/** Lets a test substitute an adapter, and put the real one back afterwards. */
export function setOrderRepositoryForTesting(
  override: OrderRepository | null,
): void {
  repository = override;
}

export { isDatabaseConfigured };
export type { OrderRepository };
