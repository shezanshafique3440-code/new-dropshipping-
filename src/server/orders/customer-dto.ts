import { findDeliveryOption } from "@/data/checkout-options";
import type { ArtTone, Order, Product, ProductArtKey } from "@/types";

/**
 * What a signed-in customer is allowed to see of their own order.
 *
 * Shaped by hand, like every other response in this project. An order row
 * carries things that are ours and not theirs — the internal id, the Stripe
 * Checkout Session and PaymentIntent, the account id — and none of them cross
 * this boundary. The customer gets their reference, their money, their
 * address and what they bought.
 *
 * Amounts are the persisted integers, in minor units. Nothing here recomputes
 * a total from the catalogue: an order is a record of what was charged, not a
 * live quote. The same goes for the item names — they are the snapshot taken
 * when the order was paid for.
 *
 * The catalogue is consulted for exactly two things: the artwork to draw, and
 * whether a product page still exists to link to. Both are absent when the
 * product has gone, and neither can change what the order says.
 */

export interface CustomerOrderItemView {
  /** The name as it was when the order was placed. */
  name: string;
  quantity: number;
  unitAmount: number;
  lineAmount: number;
  /** Present only while the product is still in the catalogue. */
  href: string | null;
  /** Artwork for the product if it still exists; null draws a placeholder. */
  art: ProductArtKey | null;
  tone: ArtTone | null;
}

export interface CustomerOrderSummaryView {
  reference: string;
  placedAt: string;
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
  currency: string;
  totalAmount: number;
  /** Total units, so "3 items" counts quantities rather than lines. */
  itemCount: number;
  /** Enough of the basket to recognise the order in a list. */
  preview: readonly { name: string; art: ProductArtKey | null; tone: ArtTone | null }[];
}

export interface CustomerOrderDetailView extends CustomerOrderSummaryView {
  updatedAt: string;
  subtotalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: Order["shippingAddress"];
  delivery: { name: string; note: string } | null;
  items: readonly CustomerOrderItemView[];
}

/** How many product thumbnails a list row shows. */
const PREVIEW_LIMIT = 3;

/** Artwork and links for the products an order mentions, if they still exist. */
export type OrderArtworkLookup = ReadonlyMap<string, Product>;

export function toCustomerOrderSummary(
  order: Order,
  catalogue: OrderArtworkLookup = new Map(),
): CustomerOrderSummaryView {
  return {
    reference: order.reference,
    placedAt: order.createdAt,
    status: order.status,
    paymentStatus: order.paymentStatus,
    currency: order.currency,
    totalAmount: order.totalAmount,
    itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
    preview: order.items.slice(0, PREVIEW_LIMIT).map((item) => {
      const product = catalogue.get(item.productId);
      return {
        name: item.name,
        art: product?.art ?? null,
        tone: product?.tone ?? null,
      };
    }),
  };
}

export function toCustomerOrderDetail(
  order: Order,
  catalogue: OrderArtworkLookup = new Map(),
): CustomerOrderDetailView {
  const delivery = findDeliveryOption(order.deliveryOptionId);

  return {
    ...toCustomerOrderSummary(order, catalogue),
    updatedAt: order.updatedAt,
    subtotalAmount: order.subtotalAmount,
    shippingAmount: order.shippingAmount,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    customerName: order.customer.name,
    customerEmail: order.customer.email,
    shippingAddress: order.shippingAddress,
    delivery: delivery ? { name: delivery.name, note: delivery.note } : null,
    items: order.items.map((item) => {
      // The catalogue is consulted for artwork and for whether a product page
      // still exists — never for the name or the price, which are the
      // historical record and must not drift.
      const product = catalogue.get(item.productId);
      return {
        name: item.name,
        quantity: item.quantity,
        unitAmount: item.unitAmount,
        lineAmount: item.lineAmount,
        href: product ? `/shop/${product.slug}` : null,
        art: product?.art ?? null,
        tone: product?.tone ?? null,
      };
    }),
  };
}
