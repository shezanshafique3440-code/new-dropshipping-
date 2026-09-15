"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Icon } from "@/components/ui/Icon";
import type { OrderPaymentStatus, OrderStatus } from "@/types";
import { adminOrdersHref, MAX_ORDER_SEARCH_LENGTH } from "@/lib/routes";

export interface AdminOrderFiltersProps {
  status: OrderStatus | null;
  paymentStatus: OrderPaymentStatus | null;
  search: string;
  /** True when anything is narrowing the list, so "Clear" is worth showing. */
  active: boolean;
}

/**
 * Search and filter controls for the order list.
 *
 * All three are server-side: they end up in the URL, the page reads them, and
 * PostgreSQL does the work. Nothing is filtered in the browser, and no page
 * ever holds more orders than it displays.
 *
 * It is a real `<form method="get">`, so it works with no JavaScript at all —
 * type, press Enter, get a filtered page. With JavaScript, the selects apply
 * as soon as they change and the search box waits 400ms after the last
 * keystroke, so a five-letter search is one request rather than five.
 *
 * Changing a filter drops the pagination cursor: page three of one filtered
 * set says nothing about another.
 */

const STATUS_OPTIONS: readonly { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Awaiting payment" },
  { value: "paid", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
];

const PAYMENT_OPTIONS: readonly { value: OrderPaymentStatus; label: string }[] = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const DEBOUNCE_MS = 400;

export function AdminOrderFilters({
  status,
  paymentStatus,
  search,
  active,
}: AdminOrderFiltersProps) {
  const router = useRouter();
  // What has been typed, and the URL it was typed against. Deriving the value
  // this way keeps the box in step when the URL changes underneath it — a
  // "Clear" click, or the browser's back button — without an effect that
  // would re-render the field a second time after every navigation.
  const [typed, setTyped] = useState({ value: search, base: search });
  const term = typed.base === search ? typed.value : search;
  const setTerm = (value: string) => setTyped({ value, base: search });

  useEffect(() => {
    const trimmed = term.trim();
    if (trimmed === search) {
      return;
    }
    const timer = setTimeout(() => {
      router.replace(adminOrdersHref({ status, paymentStatus, search: trimmed }));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term, search, status, paymentStatus, router]);

  const go = (next: {
    status?: OrderStatus | null;
    paymentStatus?: OrderPaymentStatus | null;
    search?: string;
  }) => {
    router.replace(
      adminOrdersHref({
        status: next.status !== undefined ? next.status : status,
        paymentStatus:
          next.paymentStatus !== undefined ? next.paymentStatus : paymentStatus,
        search: next.search !== undefined ? next.search : term.trim(),
      }),
    );
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Without JavaScript this is a plain GET; with it, the same destination
    // without the empty parameters a native submit would add.
    event.preventDefault();
    go({});
  };

  return (
    <form
      method="get"
      action="/admin/orders"
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-64">
        <label htmlFor="admin-order-search" className="text-sm font-medium">
          Search
        </label>
        <div className="relative">
          <Icon
            name="search"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-foreground-subtle"
          />
          <input
            id="admin-order-search"
            name="q"
            type="search"
            value={term}
            maxLength={MAX_ORDER_SEARCH_LENGTH}
            autoComplete="off"
            spellCheck={false}
            placeholder="ZYV-A1B2C3 or an email address"
            aria-describedby="admin-order-search-hint"
            onChange={(event) => setTerm(event.target.value)}
            className="h-11 w-full min-w-0 rounded-xl border border-border bg-surface pl-10 pr-3 text-base text-foreground transition-[border-color] duration-200 placeholder:text-foreground-subtle hover:border-border-strong focus-visible:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:text-sm"
          />
        </div>
        <p id="admin-order-search-hint" className="type-caption text-foreground-subtle">
          A full order reference, or any part of a customer&rsquo;s email address.
        </p>
      </div>

      <FilterSelect
        id="admin-order-status"
        name="status"
        label="Order status"
        value={status ?? ""}
        options={STATUS_OPTIONS}
        onChange={(value) => go({ status: (value || null) as OrderStatus | null })}
      />

      <FilterSelect
        id="admin-order-payment"
        name="payment"
        label="Payment"
        value={paymentStatus ?? ""}
        options={PAYMENT_OPTIONS}
        onChange={(value) =>
          go({ paymentStatus: (value || null) as OrderPaymentStatus | null })
        }
      />

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
              setTerm("");
              router.replace(adminOrdersHref());
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

function FilterSelect<T extends string>({
  id,
  name,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  options: readonly { value: T; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 min-w-40 rounded-xl border border-border bg-surface px-3 text-base text-foreground transition-[border-color] duration-200 hover:border-border-strong focus-visible:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:text-sm"
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
