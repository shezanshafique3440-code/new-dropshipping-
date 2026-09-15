import type { Metadata } from "next";

import { AdminOrderFilters } from "@/components/admin/AdminOrderFilters";
import { AdminOrderList } from "@/components/admin/AdminOrderList";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Icon } from "@/components/ui/Icon";
import { adminOrdersHref } from "@/lib/routes";
import {
  hasActiveFilters,
  parseAdminOrderQuery,
} from "@/server/admin/orders/query";
import { listAdminOrders } from "@/server/admin/orders/service";
import { requireAdmin } from "@/server/admin/current-admin";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false, nocache: true },
};

/** Depends on the admin session and on live order data. */
export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Every order, filtered and paged by PostgreSQL.
 *
 * The filters, the search term and the page cursor all come from the URL and
 * all go into the query. Nothing is fetched and then narrowed here: a page
 * holds twenty orders whether the store has twenty or twenty thousand.
 *
 * Query parameters are validated before they are used, and anything
 * unrecognised degrades to "no filter" rather than an error page.
 *
 * The authorization is here, in the page, not only in the layout: a layout
 * that redirects does not stop its page from rendering and streaming, so the
 * administrator has to be resolved before a single order is read.
 */
export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { admin } = await requireAdmin();
  const query = parseAdminOrderQuery(await searchParams);

  const page = await listAdminOrders(
    admin,
    {
      status: query.status,
      paymentStatus: query.paymentStatus,
      search: query.search,
    },
    { cursor: query.cursor, direction: query.direction },
  );

  const filtered = hasActiveFilters(query);
  const link = (cursor: string, direction: "older" | "newer") =>
    adminOrdersHref({
      status: query.status,
      paymentStatus: query.paymentStatus,
      search: query.search,
      cursor,
      direction,
    });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Orders"
        description="Every order in the database, newest first."
      />

      <AdminOrderFilters
        status={query.status}
        paymentStatus={query.paymentStatus}
        search={query.search}
        active={filtered}
      />

      {page.orders.length === 0 ? (
        <EmptyResult filtered={filtered} search={query.search} />
      ) : (
        <>
          <AdminOrderList orders={page.orders} />
          <AdminPagination
            shown={page.orders.length}
            newerHref={page.newerCursor ? link(page.newerCursor, "newer") : null}
            olderHref={page.olderCursor ? link(page.olderCursor, "older") : null}
          />
        </>
      )}
    </div>
  );
}

/**
 * Nothing matched.
 *
 * Two different situations, and they need different sentences: a store with
 * no orders at all, and a search that found none. Showing "no orders yet" to
 * somebody who has just filtered by "cancelled" would be misleading.
 */
function EmptyResult({ filtered, search }: { filtered: boolean; search: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-surface-muted text-foreground-subtle">
        <Icon name={filtered ? "search" : "bag"} className="size-5" />
      </span>
      <p className="type-h4">{filtered ? "No matching orders" : "No orders yet"}</p>
      <p className="type-caption max-w-sm text-foreground-muted">
        {filtered
          ? search
            ? `Nothing matches “${search}” with the filters you have set. Check the reference, or clear the filters to see everything.`
            : "Nothing matches the filters you have set. Clear them to see every order."
          : "Orders appear here as soon as a payment settles. Nothing is shown before that, because nothing has been bought."}
      </p>
    </div>
  );
}
