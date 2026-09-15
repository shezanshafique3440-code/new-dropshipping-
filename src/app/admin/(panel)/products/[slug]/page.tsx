import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { ProductStatusBadge } from "@/components/admin/ProductStatusBadge";
import { ProductMediaManager } from "@/components/admin/ProductMediaManager";
import { ProductStatusControl } from "@/components/admin/ProductStatusControl";
import { ProductArtwork } from "@/components/product/ProductArtwork";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import { adminProductsHref, productHref } from "@/lib/routes";
import { requireAdmin } from "@/server/admin/current-admin";
import { getAdminProduct } from "@/server/catalog/admin-service";
import { getProductMedia } from "@/server/media/admin-service";
import type { ArtTone, ProductArtKey } from "@/types";

export const metadata: Metadata = {
  title: "Product",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

interface AdminProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * One product, in full.
 *
 * `requireAdmin()` runs here rather than relying on the layout, which Next
 * renders in parallel and therefore cannot stop this page. A draft is only
 * ever visible through this route.
 */
export default async function AdminProductPage({ params }: AdminProductPageProps) {
  const { admin } = await requireAdmin();
  const { slug } = await params;

  // Both reads are scoped to the administrator resolved above, and both are
  // issued together: the gallery is not a second round trip waiting on the
  // product.
  const [product, media] = await Promise.all([
    getAdminProduct(admin, slug),
    getProductMedia(admin, slug),
  ]);
  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={adminProductsHref()}
        className="link-underline -mx-2 inline-flex w-fit min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      >
        <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
        Back to products
      </Link>

      <AdminPageHeader
        title={product.name}
        description={`${product.slug} · updated ${formatDate(product.updatedAt, {
          dateStyle: "medium",
          timeStyle: "short",
        })}`}
        actions={
          product.status === "published" ? (
            <Link
              href={productHref(product.slug)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border-strong px-4 text-sm font-semibold transition-colors duration-200 hover:border-brand-primary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              View in shop
              <Icon name="arrowRight" className="size-4" strokeWidth={2} />
            </Link>
          ) : null
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <AdminProductForm product={product} />
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <section
            aria-labelledby="product-status-heading"
            className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5"
          >
            <h2 id="product-status-heading" className="type-h5">
              Status
            </h2>
            <ProductStatusBadge status={product.status} />
            <p className="type-caption text-foreground-muted">
              {product.status === "published"
                ? "Visible in the shop, searchable, and can be bought."
                : product.status === "draft"
                  ? "Hidden from the shop. Nobody can find it or buy it."
                  : "Withdrawn from the shop. Existing orders keep working."}
            </p>
            <ProductStatusControl
              slug={product.slug}
              status={product.status}
              updatedAt={product.updatedAt}
            />
          </section>

          <section
            aria-labelledby="product-media-heading"
            className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5"
          >
            <h2 id="product-media-heading" className="type-h5">
              Images
            </h2>
            {media ? <ProductMediaManager slug={product.slug} media={media} /> : null}
          </section>

          <section
            aria-labelledby="product-preview-heading"
            className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5"
          >
            <h2 id="product-preview-heading" className="type-h5">
              Fallback artwork
            </h2>
            <div className="overflow-hidden rounded-xl border border-border-subtle">
              <ProductArtwork
                art={product.artKey as ProductArtKey}
                tone={product.tone as ArtTone}
                ratio="square"
                zoom={false}
              />
            </div>
            <p className="type-caption text-foreground-subtle">
              Drawn from the built-in illustration set. The shop uses this only
              when the product has no images at all — the database stores the
              key, never an image.
            </p>
          </section>

          <section
            aria-labelledby="product-record-heading"
            className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-muted p-5"
          >
            <h2 id="product-record-heading" className="text-sm font-semibold">
              Record
            </h2>
            <dl className="flex flex-col gap-2 text-sm">
              <Detail
                label="Created"
                value={formatDate(product.createdAt, { dateStyle: "medium" })}
              />
              <Detail
                label="Updated"
                value={formatDate(product.updatedAt, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              />
              <Detail label="Price (minor units)" value={String(product.priceAmount)} />
            </dl>
            <p className="type-caption text-foreground-subtle">
              Orders that include this product keep their own copy of its name
              and price. Editing or archiving it here cannot change them.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="type-caption text-foreground-subtle">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
