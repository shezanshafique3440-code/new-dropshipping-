"use client";

import { useCallback, useMemo, useState } from "react";

import { ActiveFilters } from "@/components/shop/ActiveFilters";
import { CategoryTabs } from "@/components/shop/CategoryTabs";
import { EmptyResults } from "@/components/shop/EmptyResults";
import { FilterDrawer } from "@/components/shop/FilterDrawer";
import { FilterPanel } from "@/components/shop/FilterPanel";
import { SearchField } from "@/components/shop/SearchField";
import { SortSelect } from "@/components/shop/SortSelect";
import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui/Container";
import { priceBounds } from "@/data/mock-storefront";
import {
  countActiveFilters,
  defaultFilters,
  filterProducts,
  filtersToSearchParams,
  isDefaultFilters,
} from "@/lib/catalog";
import type {
  CatalogFilters,
  Product,
  ProductCategory,
  ProductTag,
  SortValue,
} from "@/types";

export interface ShopCatalogProps {
  /** Full catalogue, passed from the server component. */
  products: readonly Product[];
  /** Filter state parsed from the URL on the server, so SSR matches. */
  initialFilters: CatalogFilters;
}

/**
 * The catalogue browser.
 *
 * Filter state lives here and is mirrored into the URL with
 * `history.replaceState`, so a filtered view can be shared or refreshed
 * without a server round-trip on every keystroke. The server parses the same
 * query string, so the first render already matches the URL.
 */
export function ShopCatalog({ products, initialFilters }: ShopCatalogProps) {
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const update = useCallback((next: CatalogFilters) => {
    setFilters(next);
    const search = filtersToSearchParams(next);
    // Shallow: keeps the URL shareable without re-running the server render.
    window.history.replaceState(
      null,
      "",
      search ? `/shop?${search}` : "/shop",
    );
  }, []);

  const patch = useCallback(
    (partial: Partial<CatalogFilters>) =>
      update({ ...filters, ...partial }),
    [filters, update],
  );

  const results = useMemo(
    () => filterProducts(filters, products),
    [filters, products],
  );

  /** Counts ignore the category filter, so each label shows its own total. */
  const categoryCounts = useMemo(() => {
    const withoutCategory: CatalogFilters = { ...filters, category: "all" };
    const pool = filterProducts(withoutCategory, products);
    return pool.reduce<Record<string, number>>((counts, product) => {
      counts[product.category] = (counts[product.category] ?? 0) + 1;
      return counts;
    }, {});
  }, [filters, products]);

  const activeCount = countActiveFilters(filters);
  const showChips = !isDefaultFilters(filters);

  const clearAll = () => update(defaultFilters);
  const toggleTag = (tag: ProductTag) =>
    patch({
      tags: filters.tags.includes(tag)
        ? filters.tags.filter((item) => item !== tag)
        : [...filters.tags, tag],
    });

  const filterPanel = (
    <FilterPanel
      filters={filters}
      categoryCounts={categoryCounts}
      onCategoryChange={(category: ProductCategory | "all") =>
        patch({ category })
      }
      onTagToggle={toggleTag}
      onPriceChange={({ min, max }) => patch({ minPrice: min, maxPrice: max })}
    />
  );

  return (
    <section aria-labelledby="catalog-heading" className="section-y-sm">
      <h2 id="catalog-heading" className="sr-only">
        Product catalogue
      </h2>

      <Container className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        {/* Desktop sidebar */}
        {/* The aside itself sticks: with `items-start` on the row it is only as
            tall as its content, so a sticky child would have no travel. It also
            scrolls internally, since the panel can exceed a short viewport. */}
        <aside
          aria-label="Product filters"
          className="hidden w-64 shrink-0 lg:sticky lg:top-32 lg:block lg:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto xl:w-72"
        >
          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
            {filterPanel}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchField
                value={filters.query}
                onChange={(query) => patch({ query })}
                className="sm:flex-1"
              />
              <div className="flex items-center gap-3">
                <FilterDrawer
                  open={drawerOpen}
                  onOpenChange={setDrawerOpen}
                  activeCount={activeCount}
                  resultCount={results.length}
                  onClearAll={clearAll}
                >
                  {filterPanel}
                </FilterDrawer>
                <SortSelect
                  value={filters.sort}
                  onChange={(sort: SortValue) => patch({ sort })}
                  className="flex-1 sm:w-56 sm:flex-none"
                />
              </div>
            </div>

            <CategoryTabs
              value={filters.category}
              onChange={(category) => patch({ category })}
              className="lg:hidden"
            />

            {showChips ? (
              <ActiveFilters
                filters={filters}
                onClearQuery={() => patch({ query: "" })}
                onClearCategory={() => patch({ category: "all" })}
                onClearTag={toggleTag}
                onClearPrice={() =>
                  patch({
                    minPrice: priceBounds.min,
                    maxPrice: priceBounds.max,
                  })
                }
                onClearAll={clearAll}
              />
            ) : null}

            <p
              aria-live="polite"
              className="type-caption text-foreground-subtle"
            >
              {results.length === 0
                ? "No products"
                : `${results.length} ${results.length === 1 ? "product" : "products"}`}
            </p>
          </div>

          {results.length === 0 ? (
            <EmptyResults query={filters.query} onClearFilters={clearAll} />
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {results.map((product) => (
                <li key={product.id} className="flex">
                  <ProductCard product={product} showRating className="w-full" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
