import { findCountry } from "@/data/countries";
import { findDeliveryOption } from "@/data/checkout-options";
import { validateAddress, validateInformation } from "@/lib/checkout";
import { lineAmount, sumMinorUnits } from "@/lib/money";
import { MAX_LINE_QUANTITY } from "@/lib/cart";
import type {
  CustomerInformation,
  Product,
  ShippingAddress,
} from "@/types";

import { MAX_CHECKOUT_LINES } from "./config";

/**
 * Server-side validation of a checkout request.
 *
 * The browser is treated as an untrusted party throughout: it says which
 * products and how many, and nothing else. Names, prices and totals are
 * looked up here, so a request claiming a $1 pair of headphones buys the same
 * $79.99 headphones as everyone else.
 *
 * The lookup is now a database read, and it is scoped to *published*
 * products: a draft or an archived product is simply not found, so it cannot
 * be bought at any price. The resolver is injected rather than imported so
 * this module stays pure and testable, and so the whole basket is one query
 * instead of one per line.
 */

export interface TrustedLine {
  product: Product;
  quantity: number;
  /** Catalogue unit price in minor units. */
  unitAmount: number;
  /** `unitAmount * quantity`. */
  lineAmount: number;
}

export interface TrustedCheckoutRequest {
  lines: readonly TrustedLine[];
  subtotalAmount: number;
  information: CustomerInformation;
  address: ShippingAddress;
  deliveryOptionId: string;
  /** Client-supplied de-duplication key, if it looked sane. */
  requestId: string | null;
}

export interface RequestRejection {
  /** Stable machine code; the HTTP layer maps it to a shopper-facing message. */
  code:
    | "invalid_body"
    | "empty_cart"
    | "too_many_lines"
    | "unknown_product"
    | "invalid_quantity"
    | "invalid_customer"
    | "invalid_address"
    | "unknown_delivery_option"
    | "unsellable_product";
  /** Safe to log. Never contains customer data. */
  detail: string;
}

export type ParseResult =
  | { ok: true; value: TrustedCheckoutRequest }
  | { ok: false; error: RequestRejection };

const MAX_ID_LENGTH = 100;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Accepts only a whole number in `[1, MAX_LINE_QUANTITY]`.
 *
 * Strings that look like numbers, decimals, NaN, Infinity and negatives are
 * all rejected rather than coerced: the cart UI cannot produce them, so a
 * request carrying one is not a shopper making a mistake.
 */
function readQuantity(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }
  if (value < 1 || value > MAX_LINE_QUANTITY) {
    return null;
  }
  return value;
}

/** Resolves ids to the products that may actually be sold, in one query. */
export type SellableProductLookup = (
  ids: readonly string[],
) => Promise<ReadonlyMap<string, Product>>;

export async function parseCheckoutRequest(
  body: unknown,
  findSellable: SellableProductLookup,
): Promise<ParseResult> {
  if (!isRecord(body)) {
    return reject("invalid_body", "Body is not a JSON object.");
  }

  const rawItems = body.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return reject("empty_cart", "No basket lines supplied.");
  }
  if (rawItems.length > MAX_CHECKOUT_LINES) {
    return reject("too_many_lines", `More than ${MAX_CHECKOUT_LINES} lines.`);
  }

  // Two passes: read and validate the shape of every line first, then resolve
  // all the products at once. A basket of ten lines is one query, not ten.
  const requested: { productId: string; quantity: number }[] = [];
  const seen = new Set<string>();

  for (const raw of rawItems) {
    if (!isRecord(raw)) {
      return reject("invalid_body", "A basket line is not an object.");
    }

    const productId = readString(raw.productId, MAX_ID_LENGTH);
    if (!productId) {
      return reject("unknown_product", "A basket line has no product id.");
    }
    if (seen.has(productId)) {
      return reject("invalid_body", "A product appears on two lines.");
    }
    seen.add(productId);

    const quantity = readQuantity(raw.quantity);
    if (quantity === null) {
      return reject(
        "invalid_quantity",
        `Quantity for ${productId} is not a whole number in 1-${MAX_LINE_QUANTITY}.`,
      );
    }

    requested.push({ productId, quantity });
  }

  // The one source of price truth. Anything the client sent about price,
  // name or total is discarded; only published products are in this map.
  const catalogue = await findSellable(requested.map((line) => line.productId));

  const lines: TrustedLine[] = [];
  for (const { productId, quantity } of requested) {
    const product = catalogue.get(productId);
    if (!product) {
      // Covers "no such product" and "not on sale" with one answer: the
      // shopper does not need to learn which, and a draft should not be
      // discoverable by trying to buy it.
      return reject("unknown_product", `No published product ${productId}.`);
    }

    // Already an integer number of minor units, straight from the column.
    // Nothing here multiplies a float.
    const unitAmount = product.priceAmount;
    if (!Number.isSafeInteger(unitAmount) || unitAmount <= 0) {
      return reject("unsellable_product", `Product ${productId} is not sellable.`);
    }

    lines.push({
      product,
      quantity,
      unitAmount,
      lineAmount: lineAmount(unitAmount, quantity),
    });
  }

  const subtotalAmount = sumMinorUnits(lines.map((line) => line.lineAmount));

  const information = readInformation(body.customer);
  if (hasAnyError(validateInformation(information))) {
    return reject("invalid_customer", "Customer details failed validation.");
  }

  const address = readAddress(body.shipping);
  if (hasAnyError(validateAddress(address))) {
    return reject("invalid_address", "Shipping address failed validation.");
  }
  if (!findCountry(address.country)) {
    return reject("invalid_address", "Country is not one we ship to.");
  }

  const deliveryOptionId = readString(body.deliveryOptionId, MAX_ID_LENGTH);
  if (!findDeliveryOption(deliveryOptionId)) {
    return reject("unknown_delivery_option", "Unknown delivery option.");
  }

  const rawRequestId = readString(body.requestId, 64);
  const requestId = REQUEST_ID_PATTERN.test(rawRequestId) ? rawRequestId : null;

  return {
    ok: true,
    value: {
      lines,
      subtotalAmount,
      information,
      address,
      deliveryOptionId,
      requestId,
    },
  };
}

function readInformation(value: unknown): CustomerInformation {
  const source = isRecord(value) ? value : {};
  return {
    email: readString(source.email, 254),
    firstName: readString(source.firstName, 60),
    lastName: readString(source.lastName, 60),
    phone: readString(source.phone, 40),
  };
}

function readAddress(value: unknown): ShippingAddress {
  const source = isRecord(value) ? value : {};
  return {
    country: readString(source.country, 2).toUpperCase(),
    firstName: readString(source.firstName, 60),
    lastName: readString(source.lastName, 60),
    address1: readString(source.address1, 120),
    address2: readString(source.address2, 120),
    city: readString(source.city, 120),
    region: readString(source.region, 120),
    postalCode: readString(source.postalCode, 32),
    phone: readString(source.phone, 40),
  };
}

function hasAnyError(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

function reject(
  code: RequestRejection["code"],
  detail: string,
): { ok: false; error: RequestRejection } {
  return { ok: false, error: { code, detail } };
}
