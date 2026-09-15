import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { adminProductsHref } from "@/lib/routes";

/** No product with that slug — in any status. */
export default function AdminProductNotFound() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-6">
      <span className="grid size-11 place-items-center rounded-xl bg-surface-muted text-foreground-subtle">
        <Icon name="search" className="size-5" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="type-h4">Product not found</h1>
        <p className="text-sm text-foreground-muted">
          No product uses that slug — not as a draft, and not archived.
        </p>
      </div>
      <Link
        href={adminProductsHref()}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border-strong px-4 text-sm font-semibold transition-colors duration-200 hover:border-brand-primary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      >
        <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
        Back to products
      </Link>
    </div>
  );
}
