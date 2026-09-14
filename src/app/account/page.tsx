import type { Metadata } from "next";

import { AccountDashboard } from "@/components/account/AccountDashboard";
import { RecentOrders } from "@/components/account/RecentOrders";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { toPublicCustomer } from "@/server/auth/dto";
import { requireCustomer } from "@/server/auth/current-customer";
import { listCustomerOrders } from "@/server/orders/service";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your ZYVERO profile.",
  // A signed-in view of one person's details; nothing for a crawler.
  robots: { index: false, follow: false },
};

/** Depends on the session cookie, so it is resolved per request. */
export const dynamic = "force-dynamic";

/** How many orders the dashboard shows before pointing at the full history. */
const RECENT_ORDERS = 3;

/**
 * The account area.
 *
 * Protection is here, on the server, not in a hidden navigation link or a
 * client-side check: `requireCustomer` resolves the session cookie and
 * redirects to sign-in when there is no live session, so the page's data is
 * never assembled for someone who has not proved who they are. The orders it
 * shows are fetched with that same customer id inside the query.
 */
export default async function AccountPage() {
  const { customer } = await requireCustomer("/account");
  const publicCustomer = toPublicCustomer(customer);

  // Scoped to this customer inside the query, and bounded: the dashboard
  // never loads a history, only its head.
  const recent = await listCustomerOrders(customer.id, { limit: RECENT_ORDERS });

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title={`Hello, ${publicCustomer.firstName}`}
        description="Your orders, profile and account security, all in one place."
      />

      <Container className="section-y-sm flex flex-col gap-10">
        <RecentOrders
          orders={recent.orders}
          hasMore={recent.olderCursor !== null}
        />

        <AccountDashboard customer={publicCustomer} />
      </Container>
    </>
  );
}
