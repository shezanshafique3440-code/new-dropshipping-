"use client";

import { CheckoutItem } from "@/components/checkout/CheckoutItem";
import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { findDeliveryOption } from "@/data/checkout-options";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CheckoutOrderSummaryProps {
  deliveryOptionId: string;
  /** Collapsible on phones, where the form should come first. */
  collapsible?: boolean;
  className?: string;
}

/**
 * Order summary.
 *
 * Reads the live cart, so changing a quantity in another tab or removing an
 * item updates the totals here immediately. Shipping is never given a number:
 * the row says where it comes from instead.
 */
export function CheckoutOrderSummary({
  deliveryOptionId,
  collapsible = false,
  className,
}: CheckoutOrderSummaryProps) {
  const { items, itemCount, subtotal } = useCart();
  const delivery = findDeliveryOption(deliveryOptionId);

  const body = (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <CheckoutItem key={item.productId} item={item} />
        ))}
      </ul>

      <dl className="flex flex-col gap-3 border-t border-border-subtle pt-5 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-foreground-muted">
            Subtotal
            <span className="type-caption ml-1.5 text-foreground-subtle">
              ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
          </dt>
          <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
        </div>

        <div className="flex items-start justify-between gap-4">
          <dt className="text-foreground-muted">
            Shipping
            {delivery ? (
              <span className="type-caption block text-foreground-subtle">
                {delivery.name}
              </span>
            ) : null}
          </dt>
          <dd className="type-caption text-right text-foreground-subtle">
            Calculated later
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle pt-3">
          <dt className="text-base font-semibold">Total</dt>
          <dd className="text-xl font-bold tabular-nums">
            {formatPrice(subtotal)}
          </dd>
        </div>
      </dl>

      <p className="type-caption text-foreground-subtle">
        The total covers items only. Any delivery charge appears here once the
        fulfilment integration is live.
      </p>
    </div>
  );

  if (collapsible) {
    return (
      <details
        className={cn(
          "group rounded-2xl border border-border bg-surface",
          className,
        )}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="bag" className="size-[1.15rem]" />
            Order summary
            <span className="text-foreground-subtle">({itemCount})</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-base font-bold tabular-nums">
              {formatPrice(subtotal)}
            </span>
            <Icon
              name="arrowRight"
              className="size-4 rotate-90 text-foreground-subtle transition-transform duration-300 group-open:-rotate-90"
              strokeWidth={2}
            />
          </span>
        </summary>
        <div className="border-t border-border-subtle p-5">{body}</div>
      </details>
    );
  }

  return (
    <section
      aria-labelledby="order-summary-heading"
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-soft",
        className,
      )}
    >
      <h2 id="order-summary-heading" className="type-h3 mb-5">
        Order summary
      </h2>
      {body}
    </section>
  );
}
