import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { adminOrdersHref } from "@/lib/routes";

/**
 * No such order.
 *
 * One page for "there is no order with that reference" and for "that is not a
 * reference". An operator needs to know the lookup failed, not which of the
 * two ways it failed.
 */
export default function AdminOrderNotFound() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-6">
      <span className="grid size-11 place-items-center rounded-xl bg-surface-muted text-foreground-subtle">
        <Icon name="search" className="size-5" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="type-h4">Order not found</h1>
        <p className="text-sm text-foreground-muted">
          No order matches that reference. It may have been mistyped — a
          reference looks like ZYV-A1B2C3.
        </p>
      </div>
      <Link
        href={adminOrdersHref()}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border-strong px-4 text-sm font-semibold transition-colors duration-200 hover:border-brand-primary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      >
        <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
        Back to orders
      </Link>
    </div>
  );
}
