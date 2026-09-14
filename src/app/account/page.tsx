import type { Metadata } from "next";

import { AccountDashboard } from "@/components/account/AccountDashboard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { toPublicCustomer } from "@/server/auth/dto";
import { requireCustomer } from "@/server/auth/current-customer";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your ZYVERO profile.",
  // A signed-in view of one person's details; nothing for a crawler.
  robots: { index: false, follow: false },
};

/** Depends on the session cookie, so it is resolved per request. */
export const dynamic = "force-dynamic";

/**
 * The account area.
 *
 * Protection is here, on the server, not in a hidden navigation link or a
 * client-side check: `requireCustomer` resolves the session cookie and
 * redirects to sign-in when there is no live session, so the page's data is
 * never assembled for someone who has not proved who they are.
 */
export default async function AccountPage() {
  const { customer } = await requireCustomer("/account");
  const publicCustomer = toPublicCustomer(customer);

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title={`Hello, ${publicCustomer.firstName}`}
        description="Your profile and account security live here. Order history arrives in the next step."
      />

      <Container className="section-y-sm flex flex-col gap-8">
        <AccountDashboard customer={publicCustomer} />

        <aside className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-muted p-5">
          <Icon
            name="bag"
            className="mt-0.5 size-[1.15rem] shrink-0 text-foreground-subtle"
          />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">Orders</p>
            <p className="type-caption text-foreground-muted">
              Orders you place while signed in are already linked to this
              account in our database. The page that lists them is being built —
              until then, keep the reference shown at checkout.
            </p>
          </div>
        </aside>
      </Container>
    </>
  );
}
