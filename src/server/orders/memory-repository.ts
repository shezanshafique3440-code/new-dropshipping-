import { randomUUID } from "node:crypto";

import type { Order } from "@/types";

import { generateOrderReference } from "./reference";
import type {
  CreateOrderResult,
  NewOrder,
  OrderRepository,
} from "./repository";
import { canTransition, FAILED_STATE, PAID_STATE } from "./transitions";

/**
 * In-memory order store.
 *
 * Kept for tests: it makes the order domain exercisable without a database,
 * which is why the repository interface exists in the first place. The
 * running application uses `PrismaOrderRepository` — orders here live only
 * for the life of the process and are not shared between instances, so this
 * adapter refuses to be used in production.
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

function refuseInProduction(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "The in-memory order repository is for tests only: orders would be lost " +
        "on restart and would not be shared between instances.",
    );
  }
}

export class MemoryOrderRepository implements OrderRepository {
  async findByCheckoutSessionId(sessionId: string): Promise<Order | null> {
    return getStore().ordersBySession.get(sessionId) ?? null;
  }

  async findByReference(reference: string): Promise<Order | null> {
    for (const order of getStore().ordersBySession.values()) {
      if (order.reference === reference) {
        return order;
      }
    }
    return null;
  }

  /**
   * Insert-or-return keyed on the Checkout Session id.
   *
   * The lookup and the insert happen in one synchronous stretch — no `await`
   * between them — so two concurrent callers (a webhook and the success page,
   * typically) cannot both decide to insert.
   */
  async create(draft: NewOrder): Promise<CreateOrderResult> {
    refuseInProduction();
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
    if (!canTransition(existing, PAID_STATE)) {
      return existing;
    }
    const updated: Order = {
      ...existing,
      ...PAID_STATE,
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
    if (!canTransition(existing, FAILED_STATE)) {
      return existing;
    }
    const updated: Order = {
      ...existing,
      ...FAILED_STATE,
      updatedAt: new Date().toISOString(),
    };
    store.ordersBySession.set(sessionId, updated);
    return updated;
  }

  async claimEvent(eventId: string): Promise<boolean> {
    // The event type is only kept for diagnosis, which a test store has no
    // use for; the interface's second argument is simply ignored here.
    const store = getStore();
    if (store.processedEvents.has(eventId)) {
      return false;
    }
    store.processedEvents.add(eventId);
    return true;
  }
}
