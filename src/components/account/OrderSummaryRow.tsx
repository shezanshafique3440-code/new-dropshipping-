import Link from "next/link";

import { OrderStatusBadges } from "@/components/account/OrderStatusBadges";
import { ProductThumbnail } from "@/components/product/ProductThumbnail";
import { Icon } from "@/components/ui/Icon";
import { formatDate, formatPrice } from "@/lib/format";
import { fromMinorUnits } from "@/lib/money";
import { accountOrderHref } from "@/lib/routes";
import type { CustomerOrderSummaryView } from "@/server/orders/customer-dto";

export interface OrderSummaryRowProps {
  order: CustomerOrderSummaryView;
}

/**
 * One order in the history list.
 *
 * A card rather than a table row: at 320px a table either scrolls sideways or
 * shrinks its columns into nonsense, and this needs to read the same on a
 * phone as on a desktop. The whole card is a link, with the visible "View
 * order" affordance as its accessible name so a screen-reader list of links
 * says which order each one opens.
 */
export function OrderSummaryRow({ order }: OrderSummaryRowProps) {
  const placed = formatDate(order.placedAt, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <li>
      <Link
        href={accountOrderHref(order.reference)}
        className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:flex-row sm:items-center sm:gap-6"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-3">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-semibold tracking-wide break-all">
              {order.reference}
            </span>
            <span className="type-caption text-foreground-subtle">{placed}</span>
          </span>

          <OrderStatusBadges
            status={order.status}
            paymentStatus={order.paymentStatus}
          />
        </span>

        {order.preview.length > 0 ? (
          <span aria-hidden="true" className="flex shrink-0 -space-x-3">
            {order.preview.map((item, index) => (
              <span
                key={`${item.name}-${index}`}
                className="block w-11 overflow-hidden rounded-xl border border-border-subtle bg-surface"
              >
                <ProductThumbnail
                  image={item.image}
                  art={item.art}
                  tone={item.tone}
                  decorative
                />
              </span>
            ))}
          </span>
        ) : null}

        <span className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1">
          <span className="type-caption text-foreground-subtle">
            {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
          </span>
          <span className="text-lg font-bold tabular-nums">
            {formatPrice(fromMinorUnits(order.totalAmount))}
          </span>
        </span>

        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-primary">
          View order
          <span className="sr-only"> {order.reference}</span>
          <Icon
            name="arrowRight"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </span>
      </Link>
    </li>
  );
}
