"use client";

import { PriceFilter } from "@/components/shop/PriceFilter";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import {
  PRODUCT_CATEGORIES,
  type CatalogFilters,
  type ProductCategory,
  type ProductTag,
} from "@/types";

/** Merchandising filters, labelled for shoppers rather than by field name. */
const tagOptions: ReadonlyArray<{ value: ProductTag; label: string }> = [
  { value: "bestSeller", label: "Best Sellers" },
  { value: "newArrival", label: "New Arrivals" },
  { value: "trending", label: "Trending" },
];

export interface FilterPanelProps {
  filters: CatalogFilters;
  onCategoryChange: (category: ProductCategory | "all") => void;
  onTagToggle: (tag: ProductTag) => void;
  onPriceChange: (range: { min: number; max: number }) => void;
  /** Product count per category, so the labels carry useful information. */
  categoryCounts: Readonly<Record<string, number>>;
  className?: string;
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border-subtle pb-6 last:border-b-0 last:pb-0">
      <h3 className="type-eyebrow text-foreground-subtle">{title}</h3>
      {children}
    </div>
  );
}

/** Filter controls, shared by the desktop sidebar and the mobile drawer. */
export function FilterPanel({
  filters,
  onCategoryChange,
  onTagToggle,
  onPriceChange,
  categoryCounts,
  className,
}: FilterPanelProps) {
  const categories: ReadonlyArray<ProductCategory | "all"> = [
    "all",
    ...PRODUCT_CATEGORIES,
  ];

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Group title="Category">
        <ul className="flex flex-col gap-1">
          {categories.map((category) => {
            const selected = filters.category === category;
            const label = category === "all" ? "All products" : category;
            const count =
              category === "all"
                ? Object.values(categoryCounts).reduce(
                    (total, value) => total + value,
                    0,
                  )
                : (categoryCounts[category] ?? 0);

            return (
              <li key={category}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onCategoryChange(category)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors duration-200",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
                    selected
                      ? "bg-brand-primary-soft font-semibold text-brand-primary"
                      : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  <span className="min-w-0 truncate">{label}</span>
                  <span className="type-caption shrink-0 tabular-nums opacity-70">
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Group>

      <Group title="Price">
        <PriceFilter
          min={filters.minPrice}
          max={filters.maxPrice}
          onChange={onPriceChange}
        />
      </Group>

      <Group title="Highlights">
        <ul className="flex flex-col gap-1">
          {tagOptions.map((option) => {
            const checked = filters.tags.includes(option.value);
            return (
              <li key={option.value}>
                <button
                  type="button"
                  aria-pressed={checked}
                  onClick={() => onTagToggle(option.value)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors duration-200",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
                    checked
                      ? "font-semibold text-foreground"
                      : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-md border transition-colors duration-200",
                      checked
                        ? "border-transparent bg-brand-fill text-white"
                        : "border-border-strong",
                    )}
                  >
                    {checked ? (
                      <Icon name="check" className="size-3" strokeWidth={3} />
                    ) : null}
                  </span>
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      </Group>
    </div>
  );
}
