import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface AdminStatCardProps {
  label: string;
  value: string;
  /** What the number actually counts. Shown, not hidden in a tooltip. */
  note?: string;
  /** Filters the order list to whatever this card counts. */
  href?: string;
  emphasis?: boolean;
}

/**
 * One figure on the dashboard.
 *
 * Every card is a count or a sum the database produced. There is no target,
 * no percentage change and no sparkline: the store has no historical series
 * to compare against, and inventing one would be inventing a business fact.
 *
 * Where a card can be explained in a few words — which statuses it counts,
 * what it excludes — it says so underneath, because a number nobody can
 * define is worse than no number.
 */
export function AdminStatCard({
  label,
  value,
  note,
  href,
  emphasis = false,
}: AdminStatCardProps) {
  const body = (
    <>
      <span className="type-caption font-semibold tracking-wide text-foreground-muted uppercase">
        {label}
      </span>
      <span
        className={cn(
          "text-3xl font-bold tabular-nums",
          emphasis && "text-brand-primary",
        )}
      >
        {value}
      </span>
      {note ? (
        <span className="type-caption text-foreground-subtle">{note}</span>
      ) : null}
      {href ? (
        <span className="type-caption mt-auto inline-flex items-center gap-1 pt-2 font-semibold text-brand-primary">
          View orders
          <Icon name="arrowRight" className="size-3.5" strokeWidth={2} />
        </span>
      ) : null}
    </>
  );

  const className = cn(
    "flex h-full flex-col gap-1.5 rounded-2xl border border-border bg-surface p-5",
    href &&
      "transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
  );

  if (!href) {
    return <div className={className}>{body}</div>;
  }

  return (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}
