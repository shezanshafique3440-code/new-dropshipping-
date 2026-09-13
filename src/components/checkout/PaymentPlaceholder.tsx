"use client";

import { paymentOptions, paymentStatus } from "@/data/checkout-options";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { PaymentMethodId } from "@/types";

export interface PaymentPlaceholderProps {
  value: PaymentMethodId;
  onChange: (id: PaymentMethodId) => void;
}

/**
 * Payment step.
 *
 * Deliberately collects nothing. There are no card, expiry or CVV inputs
 * because there is no gateway behind them — offering fields that look real
 * would invite people to type a card number into a form that cannot use it.
 * The shopper picks a preferred method and is told plainly where things stand.
 */
export function PaymentPlaceholder({
  value,
  onChange,
}: PaymentPlaceholderProps) {
  return (
    <div className="flex flex-col gap-5">
      <div
        role="note"
        className="flex items-start gap-3 rounded-2xl border border-border-highlight bg-brand-primary-soft/40 p-4"
      >
        <Icon
          name="lock"
          className="mt-0.5 size-[1.15rem] shrink-0 text-brand-primary"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">No payment is taken here</p>
          <p className="type-caption text-foreground-muted">
            {paymentStatus.message} Choosing a method here simply records your
            preference for when the gateway goes live.
          </p>
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">Preferred payment method</legend>

        {paymentOptions.map((option) => {
          const selected = option.id === value;

          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-[border-color,background-color,box-shadow] duration-200",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-primary",
                selected
                  ? "border-brand-primary bg-brand-primary-soft/40 shadow-soft"
                  : "border-border bg-surface hover:border-border-strong",
              )}
            >
              <input
                type="radio"
                name="payment-method"
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                className="sr-only"
              />

              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200",
                  selected ? "border-brand-fill" : "border-border-strong",
                )}
              >
                {selected ? (
                  <span className="size-2.5 rounded-full bg-brand-fill" />
                ) : null}
              </span>

              <span className="flex min-w-0 flex-1 items-start gap-3">
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm font-semibold">{option.name}</span>
                  <span className="type-caption text-foreground-muted">
                    {option.description}
                  </span>
                </span>
                <Icon
                  name={option.icon}
                  className="mt-0.5 size-[1.15rem] shrink-0 text-foreground-subtle"
                />
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
