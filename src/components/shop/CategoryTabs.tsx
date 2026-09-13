"use client";

import { cn } from "@/lib/utils";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/types";

export interface CategoryTabsProps {
  value: ProductCategory | "all";
  onChange: (category: ProductCategory | "all") => void;
  className?: string;
}

/**
 * Horizontal category switcher. Scrolls sideways on narrow screens rather
 * than wrapping into a tall block that pushes the grid off the fold.
 */
export function CategoryTabs({ value, onChange, className }: CategoryTabsProps) {
  const categories: ReadonlyArray<ProductCategory | "all"> = [
    "all",
    ...PRODUCT_CATEGORIES,
  ];

  return (
    <div
      className={cn(
        "-mx-5 overflow-x-auto px-5 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0",
        className,
      )}
    >
      <ul className="flex w-max min-w-full items-center gap-2">
        {categories.map((category) => {
          const selected = value === category;
          return (
            <li key={category}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(category)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color] duration-200",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
                  selected
                    ? "border-transparent bg-brand-fill text-white shadow-soft"
                    : "border-border bg-surface text-foreground-muted hover:border-border-strong hover:text-foreground",
                )}
              >
                {category === "all" ? "All" : category}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
