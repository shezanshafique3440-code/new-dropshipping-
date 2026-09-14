import type { Metadata } from "next";
import Link from "next/link";

import { OrderSummaryRow } from "@/components/account/OrderSummaryRow";
import { OrdersEmptyState } from "@/components/account/OrdersEmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { accountHref, accountOrdersHref } from "@/lib/routes";
import { requireCustomer } from "@/server/auth/current-customer";
import { decodeOrderCursor, encodeOrderCursor } from "@/server/orders/cursor";
import { listCustomerOrders } from "@/server/orders/service";

export const metadata: Metadata = {
  title: "My orders",
  description: "Your ZYVERO order history.",
  robots: { index: false, follow: false },
};

/** One customer's private history: resolved per request, never cached. */
export const dynamic = "force-dynamic";

interface OrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AccountOrdersPage({ searchParams }: OrdersPageProps) {
  const { customer } = await requireCustomer("/account/orders");
  const params = await searchParams;

  // A tampered or stale cursor simply shows the first page; it can never
  // widen the query, because the customer id comes from the session.
  const cursor = decodeOrderCursor(
    typeof params.cursor === "string" ? params.cursor : undefined,
  );
  const direction = params.direction === "newer" ? "newer" : "older";

  const page = await listCustomerOrders(customer.id, {
    cursor: cursor ?? undefined,
    direction: cursor ? direction : "older",
  });

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="My orders"
        description="Every order you have placed while signed in, newest first."
      />

      <Container className="section-y-sm flex flex-col gap-6">
        <Link
          href={accountHref()}
          className="link-underline -mx-2 inline-flex w-fit min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
          Back to account
        </Link>

        {page.orders.length === 0 ? (
          <OrdersEmptyState />
        ) : (
          <>
            <ul className="flex flex-col gap-4">
              {page.orders.map((order) => (
                <OrderSummaryRow key={order.reference} order={order} />
              ))}
            </ul>

            {page.newerCursor || page.olderCursor ? (
              <nav
                aria-label="Order history pages"
                className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-5"
              >
                {page.newerCursor ? (
                  <Link
                    href={accountOrdersHref({
                      cursor: encodeOrderCursor(page.newerCursor),
                      direction: "newer",
                    })}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
                    Newer orders
                  </Link>
                ) : (
                  <span />
                )}

                {page.olderCursor ? (
                  <Link
                    href={accountOrdersHref({
                      cursor: encodeOrderCursor(page.olderCursor),
                      direction: "older",
                    })}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    Older orders
                    <Icon name="arrowRight" className="size-4" strokeWidth={2} />
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            ) : null}
          </>
        )}
      </Container>
    </>
  );
}
