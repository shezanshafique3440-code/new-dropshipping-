import type { Metadata } from "next";

import { AdminPagePagination } from "@/components/admin/AdminPagePagination";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductFilters } from "@/components/admin/AdminProductFilters";
import { AdminProductList } from "@/components/admin/AdminProductList";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { adminNewProductHref, adminProductsHref } from "@/lib/routes";
import { requireAdmin } from "@/server/admin/current-admin";
import { listAdminProducts } from "@/server/catalog/admin-service";
import {
  ADMIN_PRODUCTS_PER_PAGE,
  hasActiveProductFilters,
  parseAdminProductQuery,
  type RawSearchParams,
} from "@/server/catalog/admin-query";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: Promise<RawSearchParams>;
}

/**
 * The catalogue, in every status.
 *
 * `requireAdmin()` runs in the page, not only in the layout: Next renders the
 * two in parallel, so a layout that redirects does not stop a page reading
 * data. Drafts are only visible here, and only to an administrator.
 *
 * Filtering, searching, counting and paging all happen in PostgreSQL — the
 * browser never receives more products than it displays.
 */
export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const { admin } = await requireAdmin();
  const query = parseAdminProductQuery(await searchParams);

  const page = await listAdminProducts(
    admin,
    { status: query.status, category: query.category, search: query.search },
    query.page,
    ADMIN_PRODUCTS_PER_PAGE,
  );

  const filtered = hasActiveProductFilters(query);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Products"
        description="Everything in the catalogue, published or not."
        actions={
          <ButtonLink href={adminNewProductHref()} size="sm">
            <Icon name="plus" className="size-4" strokeWidth={2} />
            New product
          </ButtonLink>
        }
      />

      <AdminProductFilters
        status={query.status}
        category={query.category}
        search={query.search}
        active={filtered}
      />

      {page.products.length === 0 ? (
        <EmptyResult filtered={filtered} search={query.search} />
      ) : (
        <>
          <AdminProductList products={page.products} />
          <AdminPagePagination
            page={page.page}
            pageCount={page.pageCount}
            total={page.total}
            noun="product"
            hrefForPage={(next) =>
              adminProductsHref({
                status: query.status,
                category: query.category,
                search: query.search,
                page: next,
              })
            }
          />
        </>
      )}
    </div>
  );
}

/**
 * Nothing matched.
 *
 * "No products yet" and "nothing matches your filters" are different
 * situations and get different sentences; showing the first to somebody who
 * has just filtered by "archived" would be misleading.
 */
function EmptyResult({ filtered, search }: { filtered: boolean; search: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-surface-muted text-foreground-subtle">
        <Icon name={filtered ? "search" : "bag"} className="size-5" />
      </span>
      <p className="type-h4">
        {filtered ? "No matching products" : "The catalogue is empty"}
      </p>
      <p className="type-caption max-w-sm text-foreground-muted">
        {filtered
          ? search
            ? `Nothing matches “${search}” with the filters you have set.`
            : "Nothing matches the filters you have set."
          : "Create a product, or run the seed script to load the starter catalogue."}
      </p>
      {filtered ? null : (
        <ButtonLink href={adminNewProductHref()} size="sm">
          New product
        </ButtonLink>
      )}
    </div>
  );
}
