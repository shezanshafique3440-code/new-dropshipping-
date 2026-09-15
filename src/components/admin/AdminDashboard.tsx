import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminOrderList } from "@/components/admin/AdminOrderList";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { fromMinorUnits } from "@/lib/money";
import { adminOrdersHref } from "@/lib/routes";
import { siteConfig } from "@/config/site";
import type { AdminOrderSummaryView } from "@/server/admin/orders/dto";
import type { AdminOrderCounts } from "@/server/admin/orders/repository";

export interface AdminDashboardProps {
  counts: AdminOrderCounts;
  recent: readonly AdminOrderSummaryView[];
}

/**
 * The operations dashboard.
 *
 * Six figures, every one of them a count or a sum PostgreSQL produced from
 * the orders table, and each labelled with what it actually counts. There is
 * no conversion rate, no average order value trend and no visitor number:
 * the application does not measure those, and a dashboard that shows a
 * plausible figure nobody can trace is worse than one that shows fewer.
 *
 * "Payments received" is the only money on the page, and it is deliberately
 * narrow: orders whose payment settled and has not since been refunded,
 * totalled per currency. Summing every order regardless of whether the money
 * arrived would be the easy version and the wrong one.
 */
export function AdminDashboard({ counts, recent }: AdminDashboardProps) {
  const settled = counts.settled;
  const refunded = counts.byPaymentStatus.refunded;

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="admin-figures-heading" className="flex flex-col gap-4">
        <h2 id="admin-figures-heading" className="type-h4">
          Orders at a glance
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AdminStatCard
            label="Total orders"
            value={counts.total.toLocaleString(siteConfig.locale)}
            note="Every order ever recorded, in any state."
            href={adminOrdersHref()}
          />
          <AdminStatCard
            label="Confirmed"
            value={counts.byStatus.paid.toLocaleString(siteConfig.locale)}
            note="Payment settled and the order still stands."
            href={adminOrdersHref({ status: "paid" })}
          />
          <AdminStatCard
            label="Awaiting payment"
            value={counts.byStatus.pending.toLocaleString(siteConfig.locale)}
            note="Recorded, with the payment not yet settled."
            href={adminOrdersHref({ status: "pending" })}
          />
          <AdminStatCard
            label="Cancelled"
            value={counts.byStatus.cancelled.toLocaleString(siteConfig.locale)}
            note="Cancelled by an operator. Terminal."
            href={adminOrdersHref({ status: "cancelled" })}
          />
          <AdminStatCard
            label="Failed"
            value={counts.byStatus.failed.toLocaleString(siteConfig.locale)}
            note="The payment attempt did not go through."
            href={adminOrdersHref({ status: "failed" })}
          />
          <div className="flex h-full flex-col gap-1.5 rounded-2xl border border-border bg-surface p-5">
            <span className="type-caption font-semibold tracking-wide text-foreground-muted uppercase">
              Payments received
            </span>
            {settled.length === 0 ? (
              <>
                <span className="text-3xl font-bold tabular-nums text-brand-primary">
                  {formatMinor(0, siteConfig.currency.code)}
                </span>
                <span className="type-caption text-foreground-subtle">
                  No settled payments yet.
                </span>
              </>
            ) : (
              <>
                <span className="flex flex-col gap-0.5">
                  {settled.map((total) => (
                    <span
                      key={total.currency}
                      className="text-3xl font-bold tabular-nums text-brand-primary"
                    >
                      {formatMinor(total.amount, total.currency)}
                    </span>
                  ))}
                </span>
                <span className="type-caption text-foreground-subtle">
                  Across{" "}
                  {settled.reduce((sum, total) => sum + total.orders, 0)} settled{" "}
                  {settled.reduce((sum, total) => sum + total.orders, 0) === 1
                    ? "order"
                    : "orders"}
                  , per currency. Refunds are excluded
                  {refunded > 0
                    ? ` (${refunded} refunded ${refunded === 1 ? "order" : "orders"})`
                    : ""}
                  .
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="admin-recent-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="admin-recent-heading" className="type-h4">
            Latest orders
          </h2>
          <ButtonLink href={adminOrdersHref()} variant="outline" size="sm">
            All orders
            <Icon name="arrowRight" className="size-4" strokeWidth={2} />
          </ButtonLink>
        </div>

        {recent.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface px-5 py-10 text-center text-sm text-foreground-muted">
            No orders have been placed yet. They will appear here as soon as a
            payment settles.
          </p>
        ) : (
          <AdminOrderList orders={recent} />
        )}
      </section>
    </div>
  );
}

/**
 * Formats a stored amount in its own currency.
 *
 * The order carries the currency it was charged in, so the figure is
 * formatted with that rather than with the storefront's configured one — a
 * euro total labelled with a dollar sign would be a lie about money.
 */
function formatMinor(minor: number, currency: string): string {
  try {
    return new Intl.NumberFormat(siteConfig.currency.locale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(fromMinorUnits(minor));
  } catch {
    // An unrecognised code still shows the number rather than crashing a page.
    return `${fromMinorUnits(minor).toFixed(2)} ${currency.toUpperCase()}`;
  }
}
