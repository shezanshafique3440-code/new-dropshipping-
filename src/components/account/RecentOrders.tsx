import Link from "next/link";

import { OrderSummaryRow } from "@/components/account/OrderSummaryRow";
import { OrdersEmptyState } from "@/components/account/OrdersEmptyState";
import { Icon } from "@/components/ui/Icon";
import { accountOrdersHref } from "@/lib/routes";
import type { CustomerOrderSummaryView } from "@/server/orders/customer-dto";

export interface RecentOrdersProps {
  orders: readonly CustomerOrderSummaryView[];
  /** True when the history continues past what is shown here. */
  hasMore: boolean;
}

/**
 * The dashboard's window onto the order history.
 *
 * A server component with no state of its own: the orders arrive already
 * fetched and already scoped to the signed-in customer. When there are none
 * it says so, rather than inventing a row to fill the space.
 */
export function RecentOrders({ orders, hasMore }: RecentOrdersProps) {
  return (
    <section
      aria-labelledby="recent-orders-heading"
      className="flex flex-col gap-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="recent-orders-heading" className="type-h3">
          My orders
        </h2>
        {orders.length > 0 ? (
          <Link
            href={accountOrdersHref()}
            className="link-underline -my-2 inline-flex min-h-9 items-center gap-1.5 py-2 text-sm font-semibold text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            View all orders
            <Icon name="arrowRight" className="size-4" strokeWidth={2} />
          </Link>
        ) : null}
      </div>

      {orders.length === 0 ? (
        <OrdersEmptyState compact />
      ) : (
        <>
          <ul className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderSummaryRow key={order.reference} order={order} />
            ))}
          </ul>
          {hasMore ? (
            <p className="type-caption text-foreground-muted">
              Showing your most recent orders.{" "}
              <Link
                href={accountOrdersHref()}
                className="link-underline font-semibold text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                See the full history
              </Link>
              .
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
