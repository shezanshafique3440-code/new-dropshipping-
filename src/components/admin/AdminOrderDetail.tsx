import Link from "next/link";

import { OrderStatusBadges } from "@/components/account/OrderStatusBadges";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { Icon } from "@/components/ui/Icon";
import { findCountry } from "@/data/countries";
import { formatDate } from "@/lib/format";
import { fromMinorUnits } from "@/lib/money";
import { adminOrdersHref } from "@/lib/routes";
import { siteConfig } from "@/config/site";
import type { AdminOrderDetailView } from "@/server/admin/orders/dto";

export interface AdminOrderDetailProps {
  order: AdminOrderDetailView;
}

const STATUS_WORDS: Record<string, string> = {
  pending: "awaiting payment",
  paid: "confirmed",
  cancelled: "cancelled",
  failed: "failed",
};

/**
 * One order, as an operator needs to see it.
 *
 * Wider than the customer's own view — the full address, whether they had an
 * account, the payment reference to reconcile against — and narrower than the
 * database row: no internal uuid for the order, the customer or the
 * administrator, no Checkout Session, no hash of anything, and nothing
 * resembling a credential or a card. There is none to show: payment happens
 * on Stripe's own page and this application has never held card data.
 *
 * Every figure is the amount that was persisted when the order was paid for.
 * Nothing is recomputed from the catalogue, so a price change today cannot
 * rewrite what somebody was charged last month.
 */
export function AdminOrderDetail({ order }: AdminOrderDetailProps) {
  const money = (minor: number) => formatMinor(minor, order.currency);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={adminOrdersHref()}
        className="link-underline -mx-2 inline-flex w-fit min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      >
        <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
        Back to orders
      </Link>

      <AdminPageHeader
        title={`Order ${order.reference}`}
        description={`Placed ${formatDate(order.placedAt, {
          dateStyle: "long",
          timeStyle: "short",
        })} · last updated ${formatDate(order.updatedAt, {
          dateStyle: "medium",
          timeStyle: "short",
        })}`}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <Panel heading="Order" id="order-info">
            <div className="flex flex-col gap-4">
              <OrderStatusBadges
                status={order.status}
                paymentStatus={order.paymentStatus}
              />
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <Detail label="Reference" value={order.reference} mono />
                <Detail
                  label="Order status"
                  value={STATUS_WORDS[order.status] ?? order.status}
                />
                <Detail label="Payment status" value={order.paymentStatus} />
                <Detail label="Currency" value={order.currency.toUpperCase()} />
                <Detail
                  label="Created"
                  value={formatDate(order.placedAt, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                />
                <Detail
                  label="Updated"
                  value={formatDate(order.updatedAt, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                />
              </dl>
            </div>
          </Panel>

          <Panel heading="Items" id="order-items">
            <ul className="flex flex-col gap-4">
              {order.items.map((item, index) => (
                <li
                  key={`${item.productId}-${index}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border-subtle pb-4 last:border-b-0 last:pb-0"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold break-words">
                      {item.name}
                    </span>
                    <span className="type-caption text-foreground-subtle">
                      {item.productId} · {money(item.unitAmount)} each ·{" "}
                      <span className="sr-only">quantity </span>×{item.quantity}
                    </span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {money(item.lineAmount)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel heading="Customer" id="order-customer">
            <div className="flex flex-col gap-1 text-sm break-words">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-foreground-muted">{order.customerEmail}</p>
              <p className="type-caption mt-1 text-foreground-subtle">
                {order.account === "registered"
                  ? "Placed while signed in to a ZYVERO account."
                  : "Placed as a guest. This order is not attached to any account."}
              </p>
            </div>
          </Panel>

          <Panel heading="Shipping" id="order-shipping">
            {order.shippingAddress ? (
              <address className="flex flex-col text-sm not-italic break-words">
                <span className="font-medium">
                  {order.shippingAddress.name || order.customerName}
                </span>
                <span className="text-foreground-muted">
                  {order.shippingAddress.line1}
                </span>
                {order.shippingAddress.line2 ? (
                  <span className="text-foreground-muted">
                    {order.shippingAddress.line2}
                  </span>
                ) : null}
                <span className="text-foreground-muted">
                  {[
                    order.shippingAddress.city,
                    [order.shippingAddress.region, order.shippingAddress.postalCode]
                      .filter(Boolean)
                      .join(" "),
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
                <span className="text-foreground-muted">
                  {findCountry(order.shippingAddress.country)?.name ??
                    order.shippingAddress.country}
                </span>
              </address>
            ) : (
              <p className="type-caption text-foreground-muted">
                No delivery address was recorded with this order.
              </p>
            )}
          </Panel>

          <Panel heading="Status history" id="order-history">
            {order.history.length === 0 ? (
              <p className="type-caption text-foreground-muted">
                No operator has changed this order&rsquo;s status. Payment
                events recorded by Stripe are not listed here — this trail
                covers manual changes only.
              </p>
            ) : (
              <ol className="flex flex-col gap-3">
                {order.history.map((event, index) => (
                  <li
                    key={`${event.at}-${index}`}
                    className="flex flex-col gap-0.5 border-l-2 border-border pl-4"
                  >
                    <span className="text-sm font-medium">
                      {STATUS_WORDS[event.fromStatus] ?? event.fromStatus} →{" "}
                      {STATUS_WORDS[event.toStatus] ?? event.toStatus}
                    </span>
                    <span className="type-caption text-foreground-subtle">
                      {formatDate(event.at, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      · {event.adminName ?? "an administrator since removed"}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Panel heading="Actions" id="order-actions">
            <OrderStatusControl
              reference={order.reference}
              status={order.status}
              availableStatuses={order.availableStatuses}
            />
            <p className="type-caption mt-4 border-t border-border-subtle pt-3 text-foreground-subtle">
              Payment status is not editable here. It follows the payment
              provider — refunds and captures happen in Stripe, and this record
              reflects what Stripe reports.
            </p>
          </Panel>

          <Panel heading="Financials" id="order-financials">
            <dl className="flex flex-col gap-2.5 text-sm">
              <Amount label="Subtotal" value={money(order.subtotalAmount)} />
              <Amount label="Shipping" value={money(order.shippingAmount)} />
              <Amount label="Tax" value={money(order.taxAmount)} />
              <Amount label="Discount" value={money(order.discountAmount)} />
              <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle pt-3">
                <dt className="font-semibold">Total</dt>
                <dd className="text-lg font-bold tabular-nums">
                  {money(order.totalAmount)}
                </dd>
              </div>
            </dl>
            <p className="type-caption mt-3 text-foreground-subtle">
              Tax and discount are recorded per order and are zero here: no tax
              engine or promotion system is connected yet.
            </p>
          </Panel>

          <Panel heading="Delivery" id="order-delivery">
            {order.delivery ? (
              <div className="flex flex-col gap-1 text-sm">
                <p className="font-medium">{order.delivery.name}</p>
                <p className="type-caption text-foreground-muted">
                  {order.delivery.note}
                </p>
              </div>
            ) : (
              <p className="type-caption text-foreground-muted">
                Delivery option <span className="font-semibold">{order.deliveryOptionId}</span>,
                which is no longer offered.
              </p>
            )}
            <p className="type-caption mt-3 border-t border-border-subtle pt-3 text-foreground-subtle">
              No carrier is integrated, so there is no dispatch date and no
              tracking number to show.
            </p>
          </Panel>

          <Panel heading="Payment" id="order-payment">
            <dl className="flex flex-col gap-2.5 text-sm">
              <Detail label="Payment status" value={order.paymentStatus} />
              <Detail
                label="Stripe payment intent"
                value={order.paymentIntentRef ?? "Not recorded"}
                mono
              />
            </dl>
            <p className="type-caption mt-3 text-foreground-subtle">
              The payment intent is the reference to look this payment up in
              Stripe. No card details are held by this application.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({
  heading,
  id,
  children,
}: {
  heading: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="flex flex-col rounded-2xl border border-border bg-surface p-5"
    >
      <h2 id={`${id}-heading`} className="type-h5 mb-4">
        {heading}
      </h2>
      {children}
    </section>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="type-caption text-foreground-subtle">{label}</dt>
      <dd className={`text-sm ${mono ? "font-mono break-all" : "capitalize"}`}>
        {value}
      </dd>
    </div>
  );
}

function Amount({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-foreground-muted">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

/** Formats a stored amount in the currency the order was charged in. */
function formatMinor(minor: number, currency: string): string {
  try {
    return new Intl.NumberFormat(siteConfig.currency.locale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(fromMinorUnits(minor));
  } catch {
    return `${fromMinorUnits(minor).toFixed(2)} ${currency.toUpperCase()}`;
  }
}
