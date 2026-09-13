"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { CheckoutEmptyState } from "@/components/checkout/CheckoutEmptyState";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { CheckoutPreviewNotice } from "@/components/checkout/CheckoutPreviewNotice";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { CheckoutTrust } from "@/components/checkout/CheckoutTrust";
import { CustomerInformationForm } from "@/components/checkout/CustomerInformationForm";
import { DeliveryMethodPicker } from "@/components/checkout/DeliveryMethodPicker";
import { ErrorSummary } from "@/components/checkout/ErrorSummary";
import { OrderReview } from "@/components/checkout/OrderReview";
import { PaymentPlaceholder } from "@/components/checkout/PaymentPlaceholder";
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
  PaymentMethodId,
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

/**
 * Checkout orchestrator.
 *
 * Owns the step, the entered details and validation. State is component-local
 * and intentionally not persisted: an email address, a name and a home address
 * have no business sitting in `localStorage` on a shared machine, and none of
 * it is in the URL either. The cart remains the single source of truth for
 * what is being bought — this never copies it.
 */
export function CheckoutShell() {
  const { items, hydrated } = useCart();
  const [state, setState] = useState<CheckoutState>(() =>
    initialCheckoutState(defaultDeliveryOptionId),
  );
  const [showErrors, setShowErrors] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

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
   * "Place order" shows a preview notice. It sends nothing, creates nothing
   * and charges nothing — see `CheckoutPreviewNotice`.
   */
  const placeOrder = useCallback(() => {
    setState((current) => ({ ...current, outcome: { kind: "preview-notice" } }));
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
  }, []);

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
  const showNotice = state.outcome.kind === "preview-notice";

  return (
    <Container className="section-y-sm grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
      <div className="flex min-w-0 flex-col gap-7">
        <CheckoutProgress
          current={state.step}
          furthest={state.furthest}
          onNavigate={goTo}
        />

        {/* Summary sits above the form on phones, collapsed by default. */}
        <CheckoutOrderSummary
          deliveryOptionId={state.deliveryOptionId}
          collapsible
          className="lg:hidden"
        />

        <div ref={formRef} className="flex scroll-mt-24 flex-col gap-6">
          {showNotice ? (
            <CheckoutPreviewNotice />
          ) : (
            <>
              <header className="flex flex-col gap-1.5">
                <h1 className="type-h2">{step.title}</h1>
                <p className="text-sm text-foreground-muted">
                  {step.description}
                </p>
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

              {state.step === "payment" ? (
                <PaymentPlaceholder
                  value={state.paymentMethodId}
                  onChange={(paymentMethodId: PaymentMethodId) =>
                    setState((current) => ({ ...current, paymentMethodId }))
                  }
                />
              ) : null}

              {state.step === "review" ? (
                <OrderReview
                  information={state.information}
                  address={state.address}
                  deliveryOptionId={state.deliveryOptionId}
                  paymentMethodId={state.paymentMethodId}
                  onEdit={goTo}
                />
              ) : null}

              <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
                {state.step === "information" ? (
                  <ButtonLink href="/cart" variant="ghost">
                    <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
                    Back to cart
                  </ButtonLink>
                ) : (
                  <Button variant="ghost" onClick={goBack}>
                    <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
                    Back
                  </Button>
                )}

                <Button
                  variant="gradient"
                  size="lg"
                  onClick={isReview ? placeOrder : advance}
                  className="sm:min-w-56"
                >
                  {isReview ? "Place order" : `Continue to ${nextLabel(state.step)}`}
                  <Icon name="arrowRight" className="size-4" strokeWidth={2} />
                </Button>
              </div>
            </>
          )}
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
