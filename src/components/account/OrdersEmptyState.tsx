import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { shopHref } from "@/lib/routes";

export interface OrdersEmptyStateProps {
  /** Slightly quieter inside the dashboard than on the orders page. */
  compact?: boolean;
}

/**
 * No orders yet.
 *
 * An honest empty state rather than a placeholder order: nothing here
 * pretends the account has history it does not have.
 */
export function OrdersEmptyState({ compact = false }: OrdersEmptyStateProps) {
  return (
    <div
      className={
        compact
          ? "flex flex-col items-start gap-3 rounded-2xl border border-border-subtle bg-surface-muted p-5"
          : "flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface px-6 py-14 text-center"
      }
    >
      <span
        className={
          compact
            ? "grid size-10 place-items-center rounded-xl bg-surface text-foreground-subtle"
            : "grid size-14 place-items-center rounded-2xl bg-brand-primary-soft text-brand-primary"
        }
      >
        <Icon name="bag" className={compact ? "size-5" : "size-6"} />
      </span>

      <div className={compact ? "flex flex-col gap-1" : "flex flex-col gap-2"}>
        <p className={compact ? "text-sm font-semibold" : "type-h3"}>No orders yet</p>
        <p className="type-caption max-w-sm text-foreground-muted">
          Your next great find is waiting. Anything you order will appear here
          with its reference, items and total.
        </p>
      </div>

      <ButtonLink href={shopHref()} variant={compact ? "outline" : "primary"} size={compact ? "sm" : "md"}>
        Start shopping
        <Icon name="arrowRight" className="size-4" strokeWidth={2} />
      </ButtonLink>
    </div>
  );
}
