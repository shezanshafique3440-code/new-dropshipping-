import type { DeliveryOption, PaymentMethodSummary } from "@/types";

/**
 * Delivery and payment options.
 *
 * Delivery rates are still pending a fulfilment integration and are stated as
 * such rather than guessed at. Payment is live through Stripe Checkout, and
 * the wording describing that handover lives here too.
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

/**
 * What the shopper can pay with.
 *
 * Stripe Checkout decides the exact set it can offer for a given card,
 * country and device, so this list describes the methods the account is set
 * up for rather than pretending to be an authoritative switch.
 */
export const acceptedPaymentMethods: readonly PaymentMethodSummary[] = [
  {
    id: "card",
    name: "Card",
    description: "Visa, Mastercard and American Express.",
    icon: "lock",
  },
  {
    id: "wallet",
    name: "Digital wallets",
    description: "Apple Pay and Google Pay, where your device supports them.",
    icon: "bag",
  },
];

/**
 * How payment actually happens, in one place.
 *
 * Every payment surface reads these strings, so the description of the flow
 * cannot drift between the payment step, the review step and the button.
 */
export const paymentHandoff = {
  provider: "Stripe",
  title: "You will pay on Stripe's secure page",
  description:
    "Selecting continue takes you to Stripe Checkout to complete payment. Card details are entered on Stripe and never reach ZYVERO.",
  reviewSummary: "Card or digital wallet, paid on Stripe's secure page.",
  testModeNotice:
    "Stripe is running in test mode, so no real money moves. Use a Stripe test card to complete a payment.",
  unconfiguredNotice:
    "Payments are not available right now. Nothing you enter here is lost — please try again shortly.",
} as const;
