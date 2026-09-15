"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Icon } from "@/components/ui/Icon";
import { adminProductsHref, MAX_PRODUCT_SEARCH_LENGTH } from "@/lib/routes";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";
import type { ProductStatus } from "@/server/catalog/repository";

export interface AdminProductFiltersProps {
  status: ProductStatus | null;
  category: string | null;
  search: string;
  active: boolean;
}

/**
 * Search and filter controls for the product list.
 *
 * Server-side, like the order list's: the values end up in the URL, the page
 * reads them, and PostgreSQL does the work. It is a real `<form method="get">`
 * so it works with no JavaScript; with JavaScript the selects apply on change
 * and the search box waits 400ms after the last keystroke, so a five-letter
 * search is one request rather than five.
 *
 * Changing a filter drops the page number: page three of one filtered set
 * says nothing about another.
 */

const STATUS_OPTIONS: readonly { value: ProductStatus; label: string }[] = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const DEBOUNCE_MS = 400;

export function AdminProductFilters({
  status,
  category,
  search,
  active,
}: AdminProductFiltersProps) {
  const router = useRouter();
  // What has been typed, and the URL it was typed against — derived rather
  // than synced in an effect, so a "Clear" or a back button just works.
  const [typed, setTyped] = useState({ value: search, base: search });
  const term = typed.base === search ? typed.value : search;

  useEffect(() => {
    const trimmed = term.trim();
    if (trimmed === search) {
      return;
    }
    const timer = setTimeout(() => {
      router.replace(adminProductsHref({ status, category, search: trimmed }));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term, search, status, category, router]);

  const go = (next: { status?: string | null; category?: string | null }) => {
    router.replace(
      adminProductsHref({
        status: next.status !== undefined ? next.status : status,
        category: next.category !== undefined ? next.category : category,
        search: term.trim(),
      }),
    );
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    go({});
  };

  return (
    <form
      method="get"
      action="/admin/products"
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-64">
        <label htmlFor="admin-product-search" className="text-sm font-medium">
          Search
        </label>
        <div className="relative">
          <Icon
            name="search"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-foreground-subtle"
          />
          <input
            id="admin-product-search"
            name="q"
            type="search"
            value={term}
            maxLength={MAX_PRODUCT_SEARCH_LENGTH}
            autoComplete="off"
            spellCheck={false}
            placeholder="Name or slug"
            aria-describedby="admin-product-search-hint"
            onChange={(event) => setTyped({ value: event.target.value, base: search })}
            className="h-11 w-full min-w-0 rounded-xl border border-border bg-surface pr-3 pl-10 text-base text-foreground transition-[border-color] duration-200 placeholder:text-foreground-subtle hover:border-border-strong focus-visible:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:text-sm"
          />
        </div>
        <p id="admin-product-search-hint" className="type-caption text-foreground-subtle">
          Any part of a product&rsquo;s name, or its slug.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="admin-product-status" className="text-sm font-medium">
          Status
        </label>
        <select
          id="admin-product-status"
          name="status"
          value={status ?? ""}
          onChange={(event) => go({ status: event.target.value || null })}
          className="h-11 min-w-40 rounded-xl border border-border bg-surface px-3 text-base text-foreground transition-[border-color] duration-200 hover:border-border-strong focus-visible:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:text-sm"
        >
          <option value="">Any</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="admin-product-category" className="text-sm font-medium">
          Category
        </label>
        <select
          id="admin-product-category"
          name="category"
          value={category ?? ""}
          onChange={(event) => go({ category: event.target.value || null })}
          className="h-11 min-w-44 rounded-xl border border-border bg-surface px-3 text-base text-foreground transition-[border-color] duration-200 hover:border-border-strong focus-visible:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:text-sm"
        >
          <option value="">Any</option>
          {PRODUCT_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-full bg-brand-fill px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-fill-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          Apply
        </button>
        {active ? (
          <button
            type="button"
            onClick={() => {
              setTyped({ value: "", base: search });
              router.replace(adminProductsHref());
            }}
            className="inline-flex h-11 items-center rounded-full border border-border-strong px-5 text-sm font-semibold text-foreground-muted transition-colors duration-200 hover:border-brand-primary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Clear
          </button>
        ) : null}
      </div>
    </form>
  );
}
