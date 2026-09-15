import { findDeliveryOption } from "@/data/checkout-options";
import type { Order, OrderStatus } from "@/types";

import { adminStatusOptions } from "../../orders/transitions";
import type { AdminOrderRecord, OrderStatusEvent } from "./repository";

/**
 * What the operations panel is allowed to see of an order.
 *
 * An admin legitimately sees more than a customer does — the delivery address
 * for every order, whether the shopper had an account, the payment intent to
 * reconcile against — so this is a second, wider projection rather than the
 * customer one with holes poked in it. Wider is not unlimited: it is still
 * hand-shaped, and the things that never belong in a response do not appear
 * in these types at all.
 *
 * Never here: password hashes, session tokens or digests, the Stripe secret
 * key or webhook secret, the Checkout Session id, card data of any kind (the
 * application has never held any — payment happens on Stripe's page), and the
 * database's own uuids for the order, the customer or the administrator.
 */

export interface AdminOrderItemView {
  /** The name as it was when the order was placed. */
  name: string;
  /** Catalogue identifier, useful when reconciling with a supplier later. */
  productId: string;
  quantity: number;
  unitAmount: number;
  lineAmount: number;
}

export interface AdminOrderSummaryView {
  reference: string;
  placedAt: string;
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
  currency: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  /** Whether the shopper was signed in. The account id itself stays private. */
  account: "registered" | "guest";
  /** Total units, so "3 items" counts quantities rather than lines. */
  itemCount: number;
}

export interface AdminOrderStatusEventView {
  at: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  /** Null when the administrator's account has since been removed. */
  adminName: string | null;
}

export interface AdminOrderDetailView extends AdminOrderSummaryView {
  updatedAt: string;
  subtotalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  shippingAddress: Order["shippingAddress"];
  delivery: { name: string; note: string } | null;
  /** The delivery option as persisted, shown when the catalogue no longer has it. */
  deliveryOptionId: string;
  items: readonly AdminOrderItemView[];
  /**
   * Stripe's PaymentIntent id, the reference an operator needs to find this
   * payment in the Stripe dashboard. An identifier, not a credential: it
   * grants nothing without an API key, and no key is ever sent anywhere near
   * the browser. Null when the order was recorded without one.
   */
  paymentIntentRef: string | null;
  /** Statuses this order can legitimately be moved to, from the state machine. */
  availableStatuses: readonly OrderStatus[];
  history: readonly AdminOrderStatusEventView[];
}

export function toAdminOrderSummary(order: Order): AdminOrderSummaryView {
  return {
    reference: order.reference,
    placedAt: order.createdAt,
    status: order.status,
    paymentStatus: order.paymentStatus,
    currency: order.currency,
    totalAmount: order.totalAmount,
    customerName: order.customer.name,
    customerEmail: order.customer.email,
    account: order.customerId ? "registered" : "guest",
    itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
  };
}

export function toAdminOrderDetail(record: AdminOrderRecord): AdminOrderDetailView {
  const { order } = record;
  const delivery = findDeliveryOption(order.deliveryOptionId);

  return {
    ...toAdminOrderSummary(order),
    updatedAt: order.updatedAt,
    subtotalAmount: order.subtotalAmount,
    shippingAmount: order.shippingAmount,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    shippingAddress: order.shippingAddress,
    delivery: delivery ? { name: delivery.name, note: delivery.note } : null,
    deliveryOptionId: order.deliveryOptionId,
    // Names and amounts are the historical snapshot. Nothing here consults
    // the catalogue for either: an order says what was charged.
    items: order.items.map((item) => ({
      name: item.name,
      productId: item.productId,
      quantity: item.quantity,
      unitAmount: item.unitAmount,
      lineAmount: item.lineAmount,
    })),
    paymentIntentRef: order.stripePaymentIntentId,
    availableStatuses: adminStatusOptions(order),
    history: record.history.map(toStatusEventView),
  };
}

function toStatusEventView(event: OrderStatusEvent): AdminOrderStatusEventView {
  return {
    at: event.at.toISOString(),
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    adminName: event.adminName,
  };
}
