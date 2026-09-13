"use client";

import { deliveryOptions } from "@/data/checkout-options";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface DeliveryMethodPickerProps {
  value: string;
  onChange: (id: string) => void;
}

/**
 * Delivery options as a radio group.
 *
 * No rate is shown because none is known: the storefront is not connected to a
 * fulfilment provider yet, and inventing a price would be a lie the shopper
 * only discovers later.
 */
export function DeliveryMethodPicker({
  value,
  onChange,
}: DeliveryMethodPickerProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">Delivery method</legend>

      {deliveryOptions.map((option) => {
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
              name="delivery-method"
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

            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-sm font-semibold">{option.name}</span>
                <span className="type-caption text-foreground-subtle">
                  Rate pending
                </span>
              </span>
              <span className="type-caption text-foreground-muted">
                {option.description}
              </span>
              <span className="type-caption flex items-start gap-1.5 text-foreground-subtle">
                <Icon name="truck" className="mt-px size-3.5 shrink-0" />
                {option.note}
              </span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
