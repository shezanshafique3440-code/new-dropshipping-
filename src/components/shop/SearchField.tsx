"use client";

import { useId, type ChangeEvent } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Catalogue search box. Filters locally — no request is made. */
export function SearchField({ value, onChange, className }: SearchFieldProps) {
  const id = useId();

  return (
    <div className={cn("relative min-w-0", className)}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <Icon
        name="search"
        className="pointer-events-none absolute top-1/2 left-4 size-[1.15rem] -translate-y-1/2 text-foreground-subtle"
      />
      <input
        id={id}
        type="search"
        size={1}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
        placeholder="Search products"
        autoComplete="off"
        className="h-11 w-full rounded-full border border-border bg-surface pr-11 pl-11 text-sm text-foreground transition-colors duration-200 placeholder:text-foreground-subtle hover:border-border-strong focus-visible:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-foreground-subtle transition-colors duration-200 hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          <Icon name="close" className="size-4" strokeWidth={2} />
        </button>
      ) : null}
    </div>
  );
}
