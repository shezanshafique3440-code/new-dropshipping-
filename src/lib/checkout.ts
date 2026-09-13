import { addressRulesFor } from "@/data/countries";
import {
  CHECKOUT_STEP_IDS,
  type AddressField,
  type CheckoutState,
  type CheckoutStep,
  type CheckoutStepId,
  type CustomerInformation,
  type FieldErrors,
  type InformationField,
  type ShippingAddress,
} from "@/types";

/**
 * Checkout domain logic.
 *
 * Pure and UI-free: the same validation runs from a form, a test, or a future
 * server action. Nothing here talks to a payment provider — payment is not
 * connected in this step, by design.
 */

export const checkoutSteps: readonly CheckoutStep[] = [
  {
    id: "information",
    label: "Information",
    title: "Contact information",
    description: "Where we send your order confirmation and delivery updates.",
  },
  {
    id: "delivery",
    label: "Delivery",
    title: "Delivery address",
    description: "Tell us where the order should go.",
  },
  {
    id: "payment",
    label: "Payment",
    title: "Payment method",
    description: "How your payment is taken, and what we accept.",
  },
  {
    id: "review",
    label: "Review",
    title: "Review your order",
    description: "Check everything over before you pay.",
  },
];

export function stepIndex(id: CheckoutStepId): number {
  return CHECKOUT_STEP_IDS.indexOf(id);
}

export function stepById(id: CheckoutStepId): CheckoutStep {
  const step = checkoutSteps.find((item) => item.id === id);
  if (!step) {
    throw new Error(`Unknown checkout step: ${id}`);
  }
  return step;
}

/** A step is reachable once every step before it has been completed. */
export function canVisitStep(
  target: CheckoutStepId,
  furthest: CheckoutStepId,
): boolean {
  return stepIndex(target) <= stepIndex(furthest);
}

export function nextStep(id: CheckoutStepId): CheckoutStepId {
  return CHECKOUT_STEP_IDS[Math.min(stepIndex(id) + 1, CHECKOUT_STEP_IDS.length - 1)]!;
}

export function previousStep(id: CheckoutStepId): CheckoutStepId {
  return CHECKOUT_STEP_IDS[Math.max(stepIndex(id) - 1, 0)]!;
}

/* -------------------------------------------------------------------------
 * Validation
 *
 * Messages name the field and say what to do, because "Invalid input" helps
 * nobody. Rules stay deliberately permissive about format so legitimate
 * international names, addresses and phone numbers are not rejected.
 * ---------------------------------------------------------------------- */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Digits, spaces and the punctuation real phone numbers are written with. */
const PHONE_PATTERN = /^[+()\d][\d\s().-]{5,24}$/;

const MAX_NAME = 60;
const MAX_LINE = 120;

function trimmed(value: string): string {
  return value.trim();
}

function requiredText(
  value: string,
  message: string,
  max = MAX_LINE,
): string | undefined {
  const text = trimmed(value);
  if (!text) {
    return message;
  }
  if (text.length > max) {
    return `Keep this under ${max} characters.`;
  }
  return undefined;
}

export function validateInformation(
  values: CustomerInformation,
): FieldErrors<InformationField> {
  const errors: FieldErrors<InformationField> = {};

  const email = trimmed(values.email);
  if (!email) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address, like you@example.com.";
  }

  const firstName = requiredText(
    values.firstName,
    "Enter your first name.",
    MAX_NAME,
  );
  if (firstName) {
    errors.firstName = firstName;
  }

  const lastName = requiredText(
    values.lastName,
    "Enter your last name.",
    MAX_NAME,
  );
  if (lastName) {
    errors.lastName = lastName;
  }

  const phone = trimmed(values.phone);
  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.phone = "Enter a phone number we can reach, or leave this empty.";
  }

  return errors;
}

export function validateAddress(
  values: ShippingAddress,
): FieldErrors<AddressField> {
  const errors: FieldErrors<AddressField> = {};
  const rules = addressRulesFor(values.country);

  if (!trimmed(values.country)) {
    errors.country = "Choose the country you want the order delivered to.";
  }

  const firstName = requiredText(
    values.firstName,
    "Enter the first name for this address.",
    MAX_NAME,
  );
  if (firstName) {
    errors.firstName = firstName;
  }

  const lastName = requiredText(
    values.lastName,
    "Enter the last name for this address.",
    MAX_NAME,
  );
  if (lastName) {
    errors.lastName = lastName;
  }

  const address1 = requiredText(
    values.address1,
    "Enter your street address.",
  );
  if (address1) {
    errors.address1 = address1;
  }

  const city = requiredText(values.city, "Enter your city or town.");
  if (city) {
    errors.city = city;
  }

  if (rules.regionRequired && !trimmed(values.region)) {
    errors.region = `Enter your ${rules.regionLabel.toLowerCase()}.`;
  }

  if (rules.postalRequired && !trimmed(values.postalCode)) {
    errors.postalCode = `Enter your ${rules.postalLabel.toLowerCase()}.`;
  }

  const phone = trimmed(values.phone);
  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.phone = "Enter a phone number we can reach, or leave this empty.";
  }

  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

/* -------------------------------------------------------------------------
 * Initial state
 * ---------------------------------------------------------------------- */

export const emptyInformation: CustomerInformation = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
};

export const emptyAddress: ShippingAddress = {
  country: "",
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  region: "",
  postalCode: "",
  phone: "",
};

export function initialCheckoutState(
  defaultDeliveryOptionId: string,
): CheckoutState {
  return {
    step: "information",
    furthest: "information",
    information: emptyInformation,
    address: emptyAddress,
    deliveryOptionId: defaultDeliveryOptionId,
    outcome: { kind: "editing" },
  };
}

/** Joins the parts of an address for read-back on the review step. */
export function formatAddressLines(
  address: ShippingAddress,
  countryName: string,
): readonly string[] {
  const regionAndPostal = [address.region, address.postalCode]
    .map(trimmed)
    .filter(Boolean)
    .join(" ");

  return [
    `${trimmed(address.firstName)} ${trimmed(address.lastName)}`.trim(),
    trimmed(address.address1),
    trimmed(address.address2),
    [trimmed(address.city), regionAndPostal].filter(Boolean).join(", "),
    countryName,
    trimmed(address.phone),
  ].filter(Boolean);
}
