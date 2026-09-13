"use client";

import { useId } from "react";

import { Icon } from "@/components/ui/Icon";
import { MAX_LINE_QUANTITY } from "@/lib/cart";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  onChange: (quantity: number) => void;
  /** Names the thing being counted, e.g. "AeroPulse Wireless Headphones". */
  label?: string;
  size?: "sm" | "md";
  /** Hides the visible "Quantity" caption; the group stays labelled for AT. */
  hideLabel?: boolean;
  className?: string;
}

const MIN = 1;

const sizeStyles = {
  sm: { button: "size-8", text: "w-7 text-sm", icon: "size-3.5" },
  md: { button: "size-10", text: "w-8 text-sm", icon: "size-4" },
} as const;

/**
 * Controlled quantity stepper.
 *
 * Minus is disabled at 1 — removing a line is a separate, explicit action, so
 * a stray click can never silently empty a cart line.
 */
export function QuantityStepper({
  value,
  onChange,
  label,
  size = "md",
  hideLabel = false,
  className,
}: QuantityStepperProps) {
  const id = useId();
  const styles = sizeStyles[size];
  const suffix = label ? ` of ${label}` : "";

  const buttonClass = cn(
    "grid place-items-center rounded-full text-foreground transition-colors duration-200",
    "hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-transparent",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
    styles.button,
  );

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        id={id}
        className={cn(
          "type-caption text-foreground-subtle",
          hideLabel && "sr-only",
        )}
      >
        Quantity
      </span>
      <div
        role="group"
        aria-labelledby={id}
        className="flex items-center gap-1 rounded-full border border-border bg-surface p-1"
      >
        <button
          type="button"
          onClick={() => onChange(Math.max(MIN, value - 1))}
          disabled={value <= MIN}
          aria-label={`Decrease quantity${suffix}`}
          className={buttonClass}
        >
          <Icon name="minus" className={styles.icon} strokeWidth={2.5} />
        </button>
        <output
          aria-live="polite"
          className={cn("text-center font-semibold tabular-nums", styles.text)}
        >
          {value}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(MAX_LINE_QUANTITY, value + 1))}
          disabled={value >= MAX_LINE_QUANTITY}
          aria-label={`Increase quantity${suffix}`}
          className={buttonClass}
        >
          <Icon name="plus" className={styles.icon} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
