import Link from "next/link";

import { Icon } from "@/components/ui/Icon";

export interface AdminPagePaginationProps {
  page: number;
  pageCount: number;
  total: number;
  /** Builds the URL for a page, keeping the current filters. */
  hrefForPage: (page: number) => string;
  /** What is being counted, for the status line: "product" / "order". */
  noun: string;
}

/**
 * Numbered paging for the product list.
 *
 * The catalogue is small and an operator thinks in pages ("it was on page
 * two"), so this counts rather than walking a cursor — and the count comes
 * from the same filtered query as the rows, in the same transaction.
 */
export function AdminPagePagination({
  page,
  pageCount,
  total,
  hrefForPage,
  noun,
}: AdminPagePaginationProps) {
  if (pageCount <= 1) {
    return (
      <p className="type-caption border-t border-border-subtle pt-4 text-foreground-muted">
        {total} {total === 1 ? noun : `${noun}s`}
      </p>
    );
  }

  return (
    <nav
      aria-label={`${noun} list pages`}
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4"
    >
      <p aria-live="polite" className="type-caption text-foreground-muted">
        Page {page} of {pageCount} · {total} {total === 1 ? noun : `${noun}s`}
      </p>

      <div className="flex gap-2">
        <PageLink
          href={page > 1 ? hrefForPage(page - 1) : null}
          label="Previous"
          direction="back"
        />
        <PageLink
          href={page < pageCount ? hrefForPage(page + 1) : null}
          label="Next"
          direction="forward"
        />
      </div>
    </nav>
  );
}

function PageLink({
  href,
  label,
  direction,
}: {
  href: string | null;
  label: string;
  direction: "back" | "forward";
}) {
  const shared =
    "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold";
  const arrow = (
    <Icon
      name="arrowRight"
      className={direction === "back" ? "size-4 rotate-180" : "size-4"}
      strokeWidth={2}
    />
  );

  if (!href) {
    return (
      <span
        aria-disabled="true"
        className={`${shared} border-border-subtle text-foreground-subtle opacity-60`}
      >
        {direction === "back" ? arrow : null}
        {label}
        {direction === "forward" ? arrow : null}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${shared} border-border-strong text-foreground transition-colors duration-200 hover:border-brand-primary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary`}
    >
      {direction === "back" ? arrow : null}
      {label}
      {direction === "forward" ? arrow : null}
    </Link>
  );
}
