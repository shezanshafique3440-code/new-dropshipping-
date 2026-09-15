"use client";

import type { PriceBounds } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import type { CatalogFilters, ProductTag } from "@/types";

const tagLabels: Record<ProductTag, string> = {
  bestSeller: "Best Sellers",
  newArrival: "New Arrivals",
  trending: "Trending",
};

export interface ActiveFiltersProps {
  filters: CatalogFilters;
  /** The published catalogue's price range, read on the server. */
  priceBounds: PriceBounds;
  onClearQuery: () => void;
  onClearCategory: () => void;
  onClearTag: (tag: ProductTag) => void;
  onClearPrice: () => void;
  onClearAll: () => void;
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface py-1.5 pr-2 pl-3 text-[0.8125rem] font-medium text-foreground transition-colors duration-200 hover:border-border-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      >
        <span className="max-w-45 truncate">{label}</span>
        <span
          aria-hidden="true"
          className="grid size-4 place-items-center rounded-full bg-surface-muted text-foreground-subtle transition-colors duration-200 group-hover:bg-brand-primary-soft group-hover:text-brand-primary"
        >
          <Icon name="close" className="size-2.5" strokeWidth={3} />
        </span>
      </button>
    </li>
  );
}

/** Removable chips for every filter currently narrowing the catalogue. */
export function ActiveFilters({
  filters,
  priceBounds,
  onClearQuery,
  onClearCategory,
  onClearTag,
  onClearPrice,
  onClearAll,
}: ActiveFiltersProps) {
  const priceNarrowed =
    filters.minPrice > priceBounds.min || filters.maxPrice < priceBounds.max;

  const priceLabel = (() => {
    const money = (value: number) =>
      formatPrice(value, { maximumFractionDigits: 0 });
    if (filters.minPrice > priceBounds.min && filters.maxPrice < priceBounds.max) {
      return `${money(filters.minPrice)} – ${money(filters.maxPrice)}`;
    }
    return filters.maxPrice < priceBounds.max
      ? `Under ${money(filters.maxPrice)}`
      : `Over ${money(filters.minPrice)}`;
  })();

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {filters.query.trim() ? (
        <Chip label={`“${filters.query.trim()}”`} onRemove={onClearQuery} />
      ) : null}
      {filters.category !== "all" ? (
        <Chip label={filters.category} onRemove={onClearCategory} />
      ) : null}
      {filters.tags.map((tag) => (
        <Chip
          key={tag}
          label={tagLabels[tag]}
          onRemove={() => onClearTag(tag)}
        />
      ))}
      {priceNarrowed ? (
        <Chip label={priceLabel} onRemove={onClearPrice} />
      ) : null}
      <li>
        <button
          type="button"
          onClick={onClearAll}
          className="link-underline px-1 text-[0.8125rem] font-semibold text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          Clear all
        </button>
      </li>
    </ul>
  );
}
