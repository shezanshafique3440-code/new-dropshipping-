import type { DeliveryOption, PaymentOption, PaymentStatus } from "@/types";

/**
 * Delivery and payment options.
 *
 * Centralised so a fulfilment or payment integration replaces this one file.
 * No rates are quoted and no gateway is wired up: both are stated as pending
 * rather than guessed at.
 */

export const deliveryOptions: readonly DeliveryOption[] = [
  {
    id: "standard",
    name: "Standard delivery",
    description: "Our default service from the nearest partner hub.",
    note: "Rate and timing confirmed once fulfilment is connected.",
  },
  {
    id: "express",
    name: "Express delivery",
    description: "Prioritised handling and the fastest available carrier.",
    note: "Availability and rate confirmed once fulfilment is connected.",
  },
  {
    id: "pickup",
    name: "Collection point",
    description: "Delivered to a nearby pickup location instead of your door.",
    note: "Locations shown once fulfilment is connected.",
  },
];

export const defaultDeliveryOptionId = deliveryOptions[0]!.id;

export function findDeliveryOption(id: string): DeliveryOption | undefined {
  return deliveryOptions.find((option) => option.id === id);
}

export const paymentOptions: readonly PaymentOption[] = [
  {
    id: "card",
    name: "Card payment",
    description: "Visa, Mastercard and American Express.",
    icon: "lock",
  },
  {
    id: "wallet",
    name: "Digital wallet",
    description: "Apple Pay, Google Pay and similar wallets.",
    icon: "bag",
  },
  {
    id: "bank",
    name: "Bank transfer",
    description: "Pay directly from your bank account.",
    icon: "layers",
  },
];

/**
 * The single statement of why payment cannot run yet. Every payment surface
 * reads this, so the message can never drift into implying a live gateway.
 */
export const paymentStatus: PaymentStatus = {
  kind: "not-connected",
  message:
    "Payment is not connected yet. No card details are collected here and nothing can be charged.",
};
