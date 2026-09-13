"use client";

import { useId } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, type SortValue } from "@/types";

export interface SortSelectProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
  className?: string;
}

/**
 * Native select, deliberately: it gives correct keyboard behaviour and the
 * platform picker on mobile for free, styled to match the design system.
 */
export function SortSelect({ value, onChange, className }: SortSelectProps) {
  const id = useId();

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <label
        htmlFor={id}
        className="type-caption shrink-0 text-foreground-subtle"
      >
        Sort
      </label>
      <div className="relative min-w-0 flex-1">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as SortValue)}
          className="h-11 w-full min-w-0 appearance-none rounded-full border border-border bg-surface pr-9 pl-4 text-sm font-medium text-foreground transition-colors duration-200 hover:border-border-strong focus-visible:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="arrowRight"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 rotate-90 text-foreground-subtle"
          strokeWidth={2}
        />
      </div>
    </div>
  );
}
