import { randomUUID } from "node:crypto";

import type { Order } from "@/types";

import { generateOrderReference } from "./reference";
import type {
  CreateOrderResult,
  NewOrder,
  OrderRepository,
} from "./repository";

/**
 * In-memory order store.
 *
 * This repository holds orders for the life of the server process. That is
 * enough to make payment → order creation correct and testable end to end,
 * and it is deliberately not dressed up as production persistence: there is
 * no database in this repository yet, and writing orders to a JSON file would
 * be worse than useless (no atomicity, no concurrency control, a real risk of
 * losing a paid order). When the project gains a database, implement
 * `OrderRepository` against it and swap the factory below — nothing else
 * changes.
 *
 * Consequences while this adapter is in use:
 *   - orders do not survive a restart or a redeploy;
 *   - a multi-instance deployment would not share them.
 * Both are announced once at startup outside development.
 */

interface Store {
  ordersBySession: Map<string, Order>;
  processedEvents: Set<string>;
}

const globalKey = Symbol.for("zyvero.orders.memory-store");

/** Survives dev-server hot reloads, which otherwise reset module state. */
function getStore(): Store {
  const globals = globalThis as typeof globalThis & { [globalKey]?: Store };
  globals[globalKey] ??= {
    ordersBySession: new Map<string, Order>(),
    processedEvents: new Set<string>(),
  };
  return globals[globalKey];
}

let warned = false;

function warnOnce(): void {
  if (warned || process.env.NODE_ENV !== "production") {
    return;
  }
  warned = true;
  console.warn(
    "[orders] Using the in-memory order repository: orders are lost on restart " +
      "and are not shared between instances. Provide a database-backed " +
      "OrderRepository before taking live payments.",
  );
}

export class MemoryOrderRepository implements OrderRepository {
  async findByCheckoutSessionId(sessionId: string): Promise<Order | null> {
    return getStore().ordersBySession.get(sessionId) ?? null;
  }

  /**
   * Insert-or-return keyed on the Checkout Session id.
   *
   * The lookup and the insert happen in one synchronous stretch — no `await`
   * between them — so two concurrent callers (a webhook and the success page,
   * typically) cannot both decide to insert.
   */
  async create(draft: NewOrder): Promise<CreateOrderResult> {
    warnOnce();
    const store = getStore();
    const existing = store.ordersBySession.get(draft.stripeCheckoutSessionId);
    if (existing) {
      return { order: existing, created: false };
    }

    const now = new Date().toISOString();
    const order: Order = {
      ...draft,
      items: [...draft.items],
      id: randomUUID(),
      reference: generateOrderReference(),
      createdAt: now,
      updatedAt: now,
    };
    store.ordersBySession.set(order.stripeCheckoutSessionId, order);
    return { order, created: true };
  }

  async markPaid(
    sessionId: string,
    paymentIntentId: string | null,
  ): Promise<Order | null> {
    const store = getStore();
    const existing = store.ordersBySession.get(sessionId);
    if (!existing) {
      return null;
    }
    if (existing.paymentStatus === "paid") {
      return existing;
    }
    const updated: Order = {
      ...existing,
      status: "paid",
      paymentStatus: "paid",
      stripePaymentIntentId: paymentIntentId ?? existing.stripePaymentIntentId,
      updatedAt: new Date().toISOString(),
    };
    store.ordersBySession.set(sessionId, updated);
    return updated;
  }

  async markFailed(sessionId: string): Promise<Order | null> {
    const store = getStore();
    const existing = store.ordersBySession.get(sessionId);
    if (!existing) {
      return null;
    }
    // Money that has already arrived is never talked out of having arrived.
    if (existing.paymentStatus === "paid") {
      return existing;
    }
    const updated: Order = {
      ...existing,
      status: "failed",
      paymentStatus: "failed",
      updatedAt: new Date().toISOString(),
    };
    store.ordersBySession.set(sessionId, updated);
    return updated;
  }

  async claimEvent(eventId: string): Promise<boolean> {
    const store = getStore();
    if (store.processedEvents.has(eventId)) {
      return false;
    }
    store.processedEvents.add(eventId);
    return true;
  }
}

let repository: OrderRepository | null = null;

/** The repository every payment path goes through. Swap the adapter here. */
export function getOrderRepository(): OrderRepository {
  repository ??= new MemoryOrderRepository();
  return repository;
}
