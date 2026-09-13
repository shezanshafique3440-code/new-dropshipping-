"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { CheckoutEmptyState } from "@/components/checkout/CheckoutEmptyState";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { CheckoutTrust } from "@/components/checkout/CheckoutTrust";
import { CustomerInformationForm } from "@/components/checkout/CustomerInformationForm";
import { DeliveryMethodPicker } from "@/components/checkout/DeliveryMethodPicker";
import { ErrorSummary } from "@/components/checkout/ErrorSummary";
import { OrderReview } from "@/components/checkout/OrderReview";
import { PaymentCancelledNotice } from "@/components/checkout/PaymentCancelledNotice";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { ShippingAddressForm } from "@/components/checkout/ShippingAddressForm";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { defaultDeliveryOptionId } from "@/data/checkout-options";
import {
  canVisitStep,
  hasErrors,
  initialCheckoutState,
  nextStep,
  previousStep,
  stepById,
  stepIndex,
  validateAddress,
  validateInformation,
} from "@/lib/checkout";
import type {
  AddressField,
  CheckoutState,
  CheckoutStepId,
  InformationField,
  PaymentMode,
} from "@/types";

/** Field order per step, so the error summary reads top to bottom. */
const informationFieldOrder: readonly InformationField[] = [
  "email",
  "firstName",
  "lastName",
  "phone",
];

const addressFieldOrder: readonly AddressField[] = [
  "country",
  "firstName",
  "lastName",
  "address1",
  "address2",
  "city",
  "region",
  "postalCode",
  "phone",
];

const GENERIC_PAYMENT_ERROR =
  "Unable to start secure checkout. Please try again.";

export interface CheckoutShellProps {
  /** Resolved server-side; carries no credential, only which mode is active. */
  paymentMode: PaymentMode;
  /** True when Stripe sent the shopper back through the cancel URL. */
  cancelled?: boolean;
}

/**
 * Checkout orchestrator.
 *
 * Owns the step, the entered details and validation. State is component-local
 * and intentionally not persisted: an email address, a name and a home address
 * have no business sitting in `localStorage` on a shared machine, and none of
 * it is in the URL either. The cart remains the single source of truth for
 * what is being bought — this never copies it, and never clears it: only a
 * payment Stripe has confirmed does that, on the success page.
 */
export function CheckoutShell({ paymentMode, cancelled = false }: CheckoutShellProps) {
  const { items, hydrated } = useCart();
  const [state, setState] = useState<CheckoutState>(() =>
    initialCheckoutState(defaultDeliveryOptionId),
  );
  const [showErrors, setShowErrors] = useState(false);
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const attemptRef = useRef<{ signature: string; requestId: string } | null>(null);

  const step = stepById(state.step);

  const informationErrors = useMemo(
    () => validateInformation(state.information),
    [state.information],
  );
  const addressErrors = useMemo(
    () => validateAddress(state.address),
    [state.address],
  );

  /** Only the current step is validated; later steps are not pre-judged. */
  const activeErrors = useMemo(() => {
    if (state.step === "information") {
      return informationFieldOrder
        .filter((field) => informationErrors[field])
        .map((field) => ({ field, message: informationErrors[field]! }));
    }
    if (state.step === "delivery") {
      return addressFieldOrder
        .filter((field) => addressErrors[field])
        .map((field) => ({ field, message: addressErrors[field]! }));
    }
    return [];
  }, [state.step, informationErrors, addressErrors]);

  const focusField = useCallback((field: string) => {
    const input = formRef.current?.querySelector<HTMLElement>(
      `[data-field="${field}"]`,
    );
    input?.focus();
    input?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  const goTo = useCallback((target: CheckoutStepId) => {
    setShowErrors(false);
    setState((current) =>
      canVisitStep(target, current.furthest)
        ? { ...current, step: target, outcome: { kind: "editing" } }
        : current,
    );
    // Bring the step heading into view rather than leaving the reader mid-page.
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
  }, []);

  const advance = useCallback(() => {
    const blocking =
      state.step === "information"
        ? hasErrors(informationErrors)
        : state.step === "delivery"
          ? hasErrors(addressErrors)
          : false;

    if (blocking) {
      setShowErrors(true);
      requestAnimationFrame(() => {
        const summary =
          formRef.current?.querySelector<HTMLElement>("[data-error-summary]");
        summary?.focus();
        summary?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }

    setShowErrors(false);
    setState((current) => {
      const next = nextStep(current.step);
      const furthest =
        stepIndex(next) > stepIndex(current.furthest) ? next : current.furthest;
      return { ...current, step: next, furthest, outcome: { kind: "editing" } };
    });
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
  }, [state.step, informationErrors, addressErrors]);

  const goBack = useCallback(() => {
    setShowErrors(false);
    setState((current) => ({
      ...current,
      step: previousStep(current.step),
      outcome: { kind: "editing" },
    }));
  }, []);

  /**
   * Hands over to Stripe.
   *
   * The request carries product ids and quantities only — the server prices
   * the order from the catalogue — and the cart is left untouched, because
   * the shopper has not paid for anything yet.
   */
  const startPayment = useCallback(async () => {
    if (isStartingPayment) {
      return;
    }

    const payload = {
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      customer: state.information,
      shipping: state.address,
      deliveryOptionId: state.deliveryOptionId,
    };

    // One idempotency key per distinct attempt: retrying the same order reuses
    // the Stripe session instead of opening a second one, while a changed
    // basket or address starts a fresh key.
    const signature = JSON.stringify(payload);
    if (attemptRef.current?.signature !== signature) {
      attemptRef.current = { signature, requestId: createRequestId() };
    }

    setIsStartingPayment(true);
    setState((current) => ({ ...current, outcome: { kind: "redirecting" } }));

    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, requestId: attemptRef.current.requestId }),
      });

      const data: unknown = await response.json().catch(() => null);
      const url = readUrl(data);

      if (!response.ok || !url) {
        throw new Error(readErrorMessage(data) ?? GENERIC_PAYMENT_ERROR);
      }

      // Leaving for Stripe. The button stays disabled through the navigation.
      window.location.assign(url);
    } catch (error) {
      setIsStartingPayment(false);
      setState((current) => ({
        ...current,
        outcome: {
          kind: "error",
          message: error instanceof Error ? error.message : GENERIC_PAYMENT_ERROR,
        },
      }));
    }
  }, [isStartingPayment, items, state.information, state.address, state.deliveryOptionId]);

  // Wait for the persisted cart before deciding whether checkout is possible.
  if (!hydrated) {
    return (
      <Container className="section-y-sm">
        <div role="status" aria-label="Loading checkout" className="flex flex-col gap-4">
          <span className="sr-only">Loading checkout</span>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              aria-hidden="true"
              className="h-24 animate-pulse rounded-2xl bg-surface-muted"
            />
          ))}
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return <CheckoutEmptyState />;
  }

  const isReview = state.step === "review";
  const paymentError =
    state.outcome.kind === "error" ? state.outcome.message : null;

  return (
    <Container className="section-y-sm grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
      <div className="flex min-w-0 flex-col gap-7">
        <CheckoutProgress
          current={state.step}
          furthest={state.furthest}
          onNavigate={goTo}
        />

        {cancelled ? <PaymentCancelledNotice /> : null}

        {/* Summary sits above the form on phones, collapsed by default. */}
        <CheckoutOrderSummary
          deliveryOptionId={state.deliveryOptionId}
          collapsible
          className="lg:hidden"
        />

        <div ref={formRef} className="flex scroll-mt-24 flex-col gap-6">
          <header className="flex flex-col gap-1.5">
            <h1 className="type-h2">{step.title}</h1>
            <p className="text-sm text-foreground-muted">{step.description}</p>
          </header>

          {showErrors ? (
            <ErrorSummary errors={activeErrors} onFocusField={focusField} />
          ) : null}

          {state.step === "information" ? (
            <CustomerInformationForm
              values={state.information}
              errors={showErrors ? informationErrors : {}}
              onChange={(field, value) =>
                setState((current) => ({
                  ...current,
                  information: { ...current.information, [field]: value },
                }))
              }
            />
          ) : null}

          {state.step === "delivery" ? (
            <div className="flex flex-col gap-8">
              <ShippingAddressForm
                values={state.address}
                errors={showErrors ? addressErrors : {}}
                hasContactPhone={Boolean(state.information.phone.trim())}
                onChange={(field, value) =>
                  setState((current) => ({
                    ...current,
                    address: { ...current.address, [field]: value },
                  }))
                }
              />
              <section className="flex flex-col gap-3">
                <h2 className="type-h3">Delivery method</h2>
                <DeliveryMethodPicker
                  value={state.deliveryOptionId}
                  onChange={(deliveryOptionId) =>
                    setState((current) => ({ ...current, deliveryOptionId }))
                  }
                />
              </section>
            </div>
          ) : null}

          {state.step === "payment" ? <PaymentStep mode={paymentMode} /> : null}

          {state.step === "review" ? (
            <OrderReview
              information={state.information}
              address={state.address}
              deliveryOptionId={state.deliveryOptionId}
              onEdit={goTo}
            />
          ) : null}

          {paymentError ? (
            <p
              role="alert"
              data-payment-error
              className="type-caption flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/5 p-3.5 font-medium text-danger"
            >
              <Icon name="close" className="mt-px size-4 shrink-0" strokeWidth={2.5} />
              {paymentError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
            {state.step === "information" ? (
              <ButtonLink href="/cart" variant="ghost">
                <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
                Back to cart
              </ButtonLink>
            ) : (
              <Button variant="ghost" onClick={goBack} disabled={isStartingPayment}>
                <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
                Back
              </Button>
            )}

            <Button
              variant="gradient"
              size="lg"
              onClick={isReview ? startPayment : advance}
              disabled={isStartingPayment}
              aria-busy={isStartingPayment}
              className="sm:min-w-56"
            >
              {isReview
                ? isStartingPayment
                  ? "Preparing secure checkout…"
                  : "Continue to secure payment"
                : `Continue to ${nextLabel(state.step)}`}
              {isStartingPayment ? (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
              ) : (
                <Icon name="arrowRight" className="size-4" strokeWidth={2} />
              )}
            </Button>
          </div>
        </div>

        <CheckoutTrust />
      </div>

      <aside
        aria-label="Order summary"
        className="hidden lg:sticky lg:top-8 lg:block lg:max-h-[calc(100dvh-4rem)] lg:overflow-y-auto"
      >
        <CheckoutOrderSummary deliveryOptionId={state.deliveryOptionId} />
      </aside>
    </Container>
  );
}

function nextLabel(current: CheckoutStepId): string {
  return stepById(nextStep(current)).label.toLowerCase();
}

/** Opaque per-attempt id. Falls back where `crypto.randomUUID` is missing. */
function createRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function readUrl(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "url" in data) {
    const url = (data as { url?: unknown }).url;
    // Never follow anything but an absolute HTTPS URL. The value comes from
    // Stripe by way of our own endpoint, which checks it too; a Checkout URL
    // may sit on a custom domain, so the host itself is not pinned here.
    if (typeof url === "string" && url.startsWith("https://")) {
      return url;
    }
  }
  return null;
}

function readErrorMessage(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "error" in data) {
    const message = (data as { error?: unknown }).error;
    if (typeof message === "string" && message.length > 0 && message.length <= 200) {
      return message;
    }
  }
  return null;
}
