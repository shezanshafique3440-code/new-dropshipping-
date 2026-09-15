import Link from "next/link";

import { OrderStatusBadges } from "@/components/account/OrderStatusBadges";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { ProductThumbnail } from "@/components/product/ProductThumbnail";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { findCountry } from "@/data/countries";
import { formatDate, formatPrice } from "@/lib/format";
import { fromMinorUnits } from "@/lib/money";
import { accountOrdersHref } from "@/lib/routes";
import type {
  CustomerOrderDetailView,
  CustomerOrderItemView,
} from "@/server/orders/customer-dto";

export interface OrderDetailProps {
  order: CustomerOrderDetailView;
}

/**
 * One order, in full.
 *
 * Every figure on this page is the amount that was persisted when the order
 * was paid for — nothing is recomputed from the catalogue, so a later price
 * change cannot rewrite what somebody was charged last month. Product names
 * are the snapshot too; only the artwork and the "View product" link come
 * from today's catalogue, and both are simply absent when the product is no
 * longer there.
 */
export function OrderDetail({ order }: OrderDetailProps) {
  const placed = formatDate(order.placedAt, {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Link
          href={accountOrdersHref()}
          className="link-underline -mx-2 inline-flex w-fit min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
          Back to my orders
        </Link>

        <div className="flex flex-col gap-3">
          <h1 className="type-h2 break-all">Order {order.reference}</h1>
          <p className="text-sm text-foreground-muted">Placed {placed}</p>
          <OrderStatusBadges status={order.status} paymentStatus={order.paymentStatus} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <section
            aria-labelledby="order-progress-heading"
            className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-6 shadow-soft"
          >
            <h2 id="order-progress-heading" className="type-h3">
              Progress
            </h2>
            <OrderTimeline
              status={order.status}
              paymentStatus={order.paymentStatus}
              placedAt={order.placedAt}
            />
          </section>

          <section
            aria-labelledby="order-items-heading"
            className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-6 shadow-soft"
          >
            <h2 id="order-items-heading" className="type-h3">
              Items
            </h2>
            <ul className="flex flex-col gap-5">
              {order.items.map((item, index) => (
                <OrderItemRow key={`${item.name}-${index}`} item={item} />
              ))}
            </ul>
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <section
            aria-labelledby="order-total-heading"
            className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 shadow-soft"
          >
            <h2 id="order-total-heading" className="type-h3">
              Payment summary
            </h2>
            <dl className="flex flex-col gap-2.5 text-sm">
              <Amount label="Subtotal" value={order.subtotalAmount} />
              <Amount
                label="Shipping"
                value={order.shippingAmount}
                note={order.shippingAmount === 0 ? "No delivery charge applied" : undefined}
              />
              {/* Tax and discounts exist in the record but are not calculated
                  by anything yet, so they are shown only when non-zero rather
                  than as permanent zeroes that imply a working tax engine. */}
              {order.taxAmount > 0 ? <Amount label="Tax" value={order.taxAmount} /> : null}
              {order.discountAmount > 0 ? (
                <Amount label="Discount" value={order.discountAmount} negative />
              ) : null}
              <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle pt-3">
                <dt className="text-base font-semibold">
                  {order.paymentStatus === "paid" ? "Total paid" : "Total"}
                </dt>
                <dd className="text-xl font-bold tabular-nums">
                  {formatPrice(fromMinorUnits(order.totalAmount))}
                </dd>
              </div>
            </dl>
          </section>

          <section
            aria-labelledby="order-delivery-heading"
            className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 shadow-soft"
          >
            <h2 id="order-delivery-heading" className="type-h3">
              Delivery
            </h2>

            {order.delivery ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{order.delivery.name}</p>
                <p className="type-caption text-foreground-muted">{order.delivery.note}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-1 border-t border-border-subtle pt-4 text-sm break-words">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-foreground-muted">{order.customerEmail}</p>
              {order.shippingAddress ? (
                <address className="mt-2 flex flex-col not-italic text-foreground-muted">
                  {order.shippingAddress.line1 ? <span>{order.shippingAddress.line1}</span> : null}
                  {order.shippingAddress.line2 ? <span>{order.shippingAddress.line2}</span> : null}
                  <span>
                    {[
                      order.shippingAddress.city,
                      [order.shippingAddress.region, order.shippingAddress.postalCode]
                        .filter(Boolean)
                        .join(" "),
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                  <span>
                    {findCountry(order.shippingAddress.country)?.name ??
                      order.shippingAddress.country}
                  </span>
                </address>
              ) : (
                <p className="type-caption mt-2 text-foreground-subtle">
                  No delivery address was recorded with this order.
                </p>
              )}
            </div>
          </section>

          <section
            aria-labelledby="order-help-heading"
            className="flex flex-col gap-3 rounded-3xl border border-border-subtle bg-surface-muted p-6"
          >
            <h2 id="order-help-heading" className="text-sm font-semibold">
              Need help with this order?
            </h2>
            <p className="type-caption text-foreground-muted">
              Quote reference <span className="font-semibold">{order.reference}</span> and
              we will pick it up from there.
            </p>
            <ButtonLink href="/contact" variant="outline" size="sm">
              Contact support
            </ButtonLink>
          </section>
        </div>
      </div>
    </div>
  );
}

function Amount({
  label,
  value,
  note,
  negative = false,
}: {
  label: string;
  /** Minor units, always non-negative; `negative` renders it as a deduction. */
  value: number;
  note?: string;
  negative?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-foreground-muted">
        {label}
        {note ? (
          <span className="type-caption block text-foreground-subtle">{note}</span>
        ) : null}
      </dt>
      <dd className="tabular-nums">
        {negative ? "−" : ""}
        {formatPrice(fromMinorUnits(value))}
      </dd>
    </div>
  );
}

function OrderItemRow({ item }: { item: CustomerOrderItemView }) {
  return (
    <li className="flex items-start gap-4">
      <span className="w-16 shrink-0 overflow-hidden rounded-xl border border-border-subtle">
        {/* Decorative: the line's name is read out immediately after it. */}
        <ProductThumbnail
          image={item.image}
          art={item.art}
          tone={item.tone}
          decorative
        />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-semibold break-words">{item.name}</span>
        <span className="type-caption text-foreground-subtle">
          {formatPrice(fromMinorUnits(item.unitAmount))} each ·{" "}
          <span className="sr-only">quantity </span>
          {item.quantity}
        </span>
        {item.href ? (
          <Link
            href={item.href}
            className="link-underline type-caption -my-1.5 inline-flex w-fit min-h-9 items-center py-1.5 font-semibold text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            View product
            <span className="sr-only">: {item.name}</span>
          </Link>
        ) : (
          <span className="type-caption text-foreground-subtle">
            No longer in the catalogue
          </span>
        )}
      </span>

      <span className="shrink-0 text-sm font-semibold tabular-nums">
        {formatPrice(fromMinorUnits(item.lineAmount))}
      </span>
    </li>
  );
}
