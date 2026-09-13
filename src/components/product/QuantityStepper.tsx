"use client";

import { useId, useState } from "react";

import { Icon } from "@/components/ui/Icon";

const MIN = 1;
const MAX = 10;

export interface QuantityStepperProps {
  onChange?: (quantity: number) => void;
}

/** Quantity control for the product page. Local state only — no cart yet. */
export function QuantityStepper({ onChange }: QuantityStepperProps) {
  const [quantity, setQuantity] = useState(MIN);
  const id = useId();

  const set = (value: number) => {
    const next = Math.min(MAX, Math.max(MIN, value));
    setQuantity(next);
    onChange?.(next);
  };

  const buttonClass =
    "grid size-10 place-items-center rounded-full text-foreground transition-colors duration-200 hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary";

  return (
    <div className="flex items-center gap-3">
      <span id={id} className="type-caption text-foreground-subtle">
        Quantity
      </span>
      <div
        role="group"
        aria-labelledby={id}
        className="flex items-center gap-1 rounded-full border border-border bg-surface p-1"
      >
        <button
          type="button"
          onClick={() => set(quantity - 1)}
          disabled={quantity <= MIN}
          aria-label="Decrease quantity"
          className={buttonClass}
        >
          <Icon name="minus" className="size-4" strokeWidth={2.5} />
        </button>
        <output
          aria-live="polite"
          className="w-8 text-center text-sm font-semibold tabular-nums"
        >
          {quantity}
        </output>
        <button
          type="button"
          onClick={() => set(quantity + 1)}
          disabled={quantity >= MAX}
          aria-label="Increase quantity"
          className={buttonClass}
        >
          <Icon name="plus" className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
