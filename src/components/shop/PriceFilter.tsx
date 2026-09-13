"use client";

import { useId } from "react";

import { priceBounds } from "@/data/mock-storefront";
import { formatPrice } from "@/lib/format";

export interface PriceFilterProps {
  min: number;
  max: number;
  onChange: (range: { min: number; max: number }) => void;
}

const STEP = 1;

/**
 * Min/max price range.
 *
 * Two number inputs carry the actual value — they are labelled, typeable and
 * keyboard-friendly — with a pair of sliders layered over a single track for
 * quick dragging. Each handle clamps against the other, so the range can never
 * invert.
 */
export function PriceFilter({ min, max, onChange }: PriceFilterProps) {
  const minId = useId();
  const maxId = useId();

  const clampMin = (value: number) =>
    Math.min(Math.max(priceBounds.min, value), max);
  const clampMax = (value: number) =>
    Math.max(Math.min(priceBounds.max, value), min);

  const span = priceBounds.max - priceBounds.min;
  const leftPercent = ((min - priceBounds.min) / span) * 100;
  const rightPercent = ((max - priceBounds.min) / span) * 100;

  const sliderClass =
    "pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none " +
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-surface " +
    "[&::-webkit-slider-thumb]:bg-brand-fill [&::-webkit-slider-thumb]:shadow-soft " +
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full " +
    "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-surface [&::-moz-range-thumb]:bg-brand-fill " +
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium">
        {formatPrice(min, { maximumFractionDigits: 0 })} —{" "}
        {formatPrice(max, { maximumFractionDigits: 0 })}
      </p>

      {/* Track with the selected span highlighted. */}
      <div className="relative h-6">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-surface-muted"
        />
        <span
          aria-hidden="true"
          style={{
            left: `${leftPercent}%`,
            right: `${100 - rightPercent}%`,
          }}
          className="gradient-brand absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={priceBounds.min}
          max={priceBounds.max}
          step={STEP}
          value={min}
          onChange={(event) =>
            onChange({ min: clampMin(Number(event.target.value)), max })
          }
          className={sliderClass}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={priceBounds.min}
          max={priceBounds.max}
          step={STEP}
          value={max}
          onChange={(event) =>
            onChange({ min, max: clampMax(Number(event.target.value)) })
          }
          className={sliderClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={minId} className="type-caption text-foreground-subtle">
            Min
          </label>
          <input
            id={minId}
            type="number"
            inputMode="numeric"
            min={priceBounds.min}
            max={max}
            step={STEP}
            value={min}
            onChange={(event) =>
              onChange({ min: clampMin(Number(event.target.value)), max })
            }
            className="h-10 w-full min-w-0 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={maxId} className="type-caption text-foreground-subtle">
            Max
          </label>
          <input
            id={maxId}
            type="number"
            inputMode="numeric"
            min={min}
            max={priceBounds.max}
            step={STEP}
            value={max}
            onChange={(event) =>
              onChange({ min, max: clampMax(Number(event.target.value)) })
            }
            className="h-10 w-full min-w-0 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          />
        </div>
      </div>
    </div>
  );
}
