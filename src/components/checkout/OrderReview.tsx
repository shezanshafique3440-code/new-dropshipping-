"use client";

import { CheckoutItem } from "@/components/checkout/CheckoutItem";
import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { findDeliveryOption, paymentOptions, paymentStatus } from "@/data/checkout-options";
import { findCountry } from "@/data/countries";
import { formatAddressLines } from "@/lib/checkout";
import type {
  CheckoutStepId,
  CustomerInformation,
  PaymentMethodId,
  ShippingAddress,
} from "@/types";

export interface OrderReviewProps {
  information: CustomerInformation;
  address: ShippingAddress;
  deliveryOptionId: string;
  paymentMethodId: PaymentMethodId;
  onEdit: (step: CheckoutStepId) => void;
}

function ReviewSection({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: CheckoutStepId;
  onEdit: (step: CheckoutStepId) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2 border-b border-border-subtle pb-5 last:border-b-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="link-underline type-caption -my-2 inline-flex min-h-9 shrink-0 items-center px-1 py-2 font-semibold text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          Edit
          <span className="sr-only"> {title.toLowerCase()}</span>
        </button>
      </div>
      <div className="text-sm break-words text-foreground-muted">{children}</div>
    </section>
  );
}

/** Read-back of everything entered, with a route back to each step. */
export function OrderReview({
  information,
  address,
  deliveryOptionId,
  paymentMethodId,
  onEdit,
}: OrderReviewProps) {
  const { items } = useCart();
  const delivery = findDeliveryOption(deliveryOptionId);
  const payment = paymentOptions.find((option) => option.id === paymentMethodId);
  const countryName = findCountry(address.country)?.name ?? address.country;
  const addressLines = formatAddressLines(address, countryName);

  return (
    <div className="flex flex-col gap-5">
      <ReviewSection title="Contact information" step="information" onEdit={onEdit}>
        <p>{information.email}</p>
        <p>
          {information.firstName} {information.lastName}
        </p>
        {information.phone ? <p>{information.phone}</p> : null}
      </ReviewSection>

      <ReviewSection title="Shipping address" step="delivery" onEdit={onEdit}>
        {addressLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </ReviewSection>

      <ReviewSection title="Delivery method" step="delivery" onEdit={onEdit}>
        <p className="font-medium text-foreground">{delivery?.name}</p>
        <p className="type-caption">{delivery?.note}</p>
      </ReviewSection>

      <ReviewSection title="Payment method" step="payment" onEdit={onEdit}>
        <p className="font-medium text-foreground">{payment?.name}</p>
        <p className="type-caption flex items-start gap-1.5">
          <Icon name="lock" className="mt-px size-3.5 shrink-0" />
          {paymentStatus.message}
        </p>
      </ReviewSection>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Order items</h3>
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <CheckoutItem key={item.productId} item={item} />
          ))}
        </ul>
      </section>
    </div>
  );
}
