import Link from "next/link";

import { OrderStatusBadges } from "@/components/account/OrderStatusBadges";
import { Icon } from "@/components/ui/Icon";
import { formatDate, formatPrice } from "@/lib/format";
import { fromMinorUnits } from "@/lib/money";
import { adminOrderHref } from "@/lib/routes";
import type { AdminOrderSummaryView } from "@/server/admin/orders/dto";

export interface AdminOrderListProps {
  orders: readonly AdminOrderSummaryView[];
}

/**
 * The orders, as a table on a desk and as cards on a phone.
 *
 * Both render the same rows from the same data — this is one component with
 * two layouts, not a table plus a mobile summary that can drift apart. The
 * table keeps its header row for screen readers at every size; below `lg` it
 * is hidden visually and the cards take over, which is more readable at 320px
 * than eight columns squeezed or scrolled sideways.
 */
export function AdminOrderList({ orders }: AdminOrderListProps) {
  return (
    <>
      {/* Desk: a real table.

          Two classes here are load-bearing. `min-w-0`, because this is a flex
          item and a flex item's automatic minimum size is its content's —
          without it the wrapper grows to the table's width and pushes the
          page sideways instead of scrolling inside its own border. And
          `relative`, because the visually-hidden labels in the cells are
          absolutely positioned: with no positioned ancestor they resolve
          against the page, escape this container's clipping entirely, and
          widen the document by their own text width. */}
      <div className="relative hidden min-w-0 overflow-x-auto rounded-2xl border border-border bg-surface lg:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Orders, newest first. Each row links to the full order.
          </caption>
          <thead>
            <tr className="border-b border-border-subtle text-left">
              <Th>Order</Th>
              <Th>Placed</Th>
              <Th>Customer</Th>
              <Th align="right">Items</Th>
              <Th align="right">Total</Th>
              <Th>Status</Th>
              <Th>
                <span className="sr-only">Action</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.reference}
                className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/60"
              >
                <Td>
                  <span className="font-semibold tracking-wide">{order.reference}</span>
                </Td>
                <Td>
                  <span className="whitespace-nowrap text-foreground-muted">
                    {formatDate(order.placedAt, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </Td>
                <Td>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{order.customerName}</span>
                    <span className="type-caption truncate text-foreground-subtle">
                      {order.customerEmail}
                    </span>
                  </span>
                </Td>
                <Td align="right">
                  <span className="tabular-nums">{order.itemCount}</span>
                </Td>
                <Td align="right">
                  <span className="font-semibold tabular-nums">
                    {formatPrice(fromMinorUnits(order.totalAmount))}
                  </span>
                </Td>
                <Td>
                  <OrderStatusBadges
                    status={order.status}
                    paymentStatus={order.paymentStatus}
                  />
                </Td>
                <Td align="right">
                  <Link
                    href={adminOrderHref(order.reference)}
                    className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 font-semibold text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    Open
                    <span className="sr-only"> order {order.reference}</span>
                    <Icon name="arrowRight" className="size-4" strokeWidth={2} />
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone and tablet: one card per order, the whole card a link. */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {orders.map((order) => (
          <li key={order.reference}>
            <Link
              href={adminOrderHref(order.reference)}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-semibold tracking-wide break-all">
                  {order.reference}
                </span>
                <span className="type-caption text-foreground-subtle">
                  {formatDate(order.placedAt, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </span>

              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {order.customerName}
                </span>
                <span className="type-caption truncate text-foreground-subtle">
                  {order.customerEmail}
                </span>
              </span>

              <OrderStatusBadges
                status={order.status}
                paymentStatus={order.paymentStatus}
              />

              <span className="flex items-center justify-between gap-4 border-t border-border-subtle pt-3">
                <span className="type-caption text-foreground-subtle">
                  {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                </span>
                <span className="text-base font-bold tabular-nums">
                  {formatPrice(fromMinorUnits(order.totalAmount))}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-xs font-semibold tracking-wide text-foreground-muted uppercase ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`max-w-64 px-4 py-3 align-middle ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}
