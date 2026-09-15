import Link from "next/link";

import { Icon } from "@/components/ui/Icon";

export interface AdminPaginationProps {
  /** Link to the previous (newer) page, or null on the first page. */
  newerHref: string | null;
  /** Link to the next (older) page, or null at the end. */
  olderHref: string | null;
  /** How many rows this page is showing, for the status line. */
  shown: number;
}

/**
 * Keyset paging controls.
 *
 * Two links and a count, rather than numbered pages: with a keyset cursor
 * there is no "page 7" to jump to, and pretending otherwise would mean
 * counting the whole filtered set on every request to draw the numbers.
 */
export function AdminPagination({ newerHref, olderHref, shown }: AdminPaginationProps) {
  if (!newerHref && !olderHref) {
    return null;
  }

  return (
    <nav
      aria-label="Order list pages"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4"
    >
      <p aria-live="polite" className="type-caption text-foreground-muted">
        Showing {shown} {shown === 1 ? "order" : "orders"}
      </p>

      <div className="flex gap-2">
        <PageLink href={newerHref} direction="newer" />
        <PageLink href={olderHref} direction="older" />
      </div>
    </nav>
  );
}

function PageLink({
  href,
  direction,
}: {
  href: string | null;
  direction: "newer" | "older";
}) {
  const label = direction === "newer" ? "Newer orders" : "Older orders";
  const shared =
    "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold";

  if (!href) {
    return (
      <span
        aria-disabled="true"
        className={`${shared} border-border-subtle text-foreground-subtle opacity-60`}
      >
        {direction === "newer" ? (
          <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
        ) : null}
        {label}
        {direction === "older" ? (
          <Icon name="arrowRight" className="size-4" strokeWidth={2} />
        ) : null}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${shared} border-border-strong text-foreground transition-colors duration-200 hover:border-brand-primary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary`}
    >
      {direction === "newer" ? (
        <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
      ) : null}
      {label}
      {direction === "older" ? (
        <Icon name="arrowRight" className="size-4" strokeWidth={2} />
      ) : null}
    </Link>
  );
}
