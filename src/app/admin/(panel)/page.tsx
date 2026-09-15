import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/server/admin/current-admin";
import { getOrderCounts, listAdminOrders } from "@/server/admin/orders/service";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false, nocache: true },
};

/** Depends on the admin session and on live order data. */
export const dynamic = "force-dynamic";

/** How many orders the dashboard shows before pointing at the full list. */
const RECENT_ORDERS = 5;

/**
 * The operations dashboard.
 *
 * Two database round trips: one set of grouped aggregates for the figures,
 * and one bounded page of the newest orders. The order table is never read
 * in full, and nothing is counted in JavaScript.
 *
 * `requireAdmin()` runs here, in the page, and not only in the layout above
 * it. Next renders a layout and its page in parallel, so a layout that
 * redirects does not stop the page from running or from putting its data in
 * the RSC payload — which is why the admin data functions will not even be
 * called without the administrator this resolves.
 */
export default async function AdminDashboardPage() {
  const { admin } = await requireAdmin();

  const [counts, recent] = await Promise.all([
    getOrderCounts(admin),
    listAdminOrders(
      admin,
      { status: null, paymentStatus: null, search: "" },
      { limit: RECENT_ORDERS },
    ),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Operations"
        description="Live order figures, straight from the database."
      />
      <AdminDashboard counts={counts} recent={recent.orders} />
    </div>
  );
}
