import Link from "next/link";

import { ProductStatusBadge } from "@/components/admin/ProductStatusBadge";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import { fromMinorUnits } from "@/lib/money";
import { adminProductHref } from "@/lib/routes";
import { siteConfig } from "@/config/site";
import type { AdminProductView } from "@/server/catalog/admin-dto";

export interface AdminProductListProps {
  products: readonly AdminProductView[];
}

/**
 * The catalogue, as a table on a desk and as cards on a phone.
 *
 * One component, two layouts, the same rows — so the mobile view cannot drift
 * from the table. Flags are words ("Featured", "Best seller"), not coloured
 * dots, and a product's status is spelled out rather than implied by how
 * faint the row looks.
 */
export function AdminProductList({ products }: AdminProductListProps) {
  return (
    <>
      <div className="relative hidden min-w-0 overflow-x-auto rounded-2xl border border-border bg-surface lg:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Products, most recently updated first. Each row links to the
            product.
          </caption>
          <thead>
            <tr className="border-b border-border-subtle text-left">
              <Th>Product</Th>
              <Th>Category</Th>
              <Th align="right">Price</Th>
              <Th>Status</Th>
              <Th>Flags</Th>
              <Th>Updated</Th>
              <Th>
                <span className="sr-only">Action</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.slug}
                className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/60"
              >
                <Td>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold">{product.name}</span>
                    <span className="type-caption truncate text-foreground-subtle">
                      {product.slug}
                    </span>
                  </span>
                </Td>
                <Td>
                  <span className="whitespace-nowrap text-foreground-muted">
                    {product.category}
                  </span>
                </Td>
                <Td align="right">
                  <Price product={product} />
                </Td>
                <Td>
                  <ProductStatusBadge status={product.status} />
                </Td>
                <Td>
                  <Flags product={product} />
                </Td>
                <Td>
                  <span className="whitespace-nowrap text-foreground-muted">
                    {formatDate(product.updatedAt, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </Td>
                <Td align="right">
                  <Link
                    href={adminProductHref(product.slug)}
                    className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 font-semibold text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    Edit
                    <span className="sr-only"> {product.name}</span>
                    <Icon name="arrowRight" className="size-4" strokeWidth={2} />
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 lg:hidden">
        {products.map((product) => (
          <li key={product.slug}>
            <Link
              href={adminProductHref(product.slug)}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              <span className="flex min-w-0 flex-col">
                <span className="font-semibold break-words">{product.name}</span>
                <span className="type-caption truncate text-foreground-subtle">
                  {product.slug}
                </span>
              </span>

              <span className="flex flex-wrap items-center gap-2">
                <ProductStatusBadge status={product.status} />
                <Flags product={product} />
              </span>

              <span className="flex items-center justify-between gap-4 border-t border-border-subtle pt-3">
                <span className="type-caption text-foreground-subtle">
                  {product.category} · updated{" "}
                  {formatDate(product.updatedAt, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <Price product={product} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function Price({ product }: { product: AdminProductView }) {
  return (
    <span className="flex flex-col items-end">
      <span className="font-semibold tabular-nums">
        {money(product.priceAmount, product.currency)}
      </span>
      {product.compareAtPriceAmount === null ? null : (
        <span className="type-caption text-foreground-subtle line-through tabular-nums">
          {money(product.compareAtPriceAmount, product.currency)}
        </span>
      )}
    </span>
  );
}

/** Merchandising flags as words. Nothing here is colour-only. */
function Flags({ product }: { product: AdminProductView }) {
  const flags = [
    product.featured ? "Featured" : null,
    product.bestseller ? "Best seller" : null,
    product.trending ? "Trending" : null,
    product.newArrival ? "New" : null,
  ].filter(Boolean);

  if (flags.length === 0) {
    return <span className="type-caption text-foreground-subtle">—</span>;
  }

  return (
    <span className="type-caption flex flex-wrap gap-x-2 gap-y-0.5 text-foreground-muted">
      {flags.join(" · ")}
    </span>
  );
}

function money(minor: number, currency: string): string {
  try {
    return new Intl.NumberFormat(siteConfig.currency.locale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(fromMinorUnits(minor));
  } catch {
    return `${fromMinorUnits(minor).toFixed(2)} ${currency.toUpperCase()}`;
  }
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
