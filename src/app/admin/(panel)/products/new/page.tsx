import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { Icon } from "@/components/ui/Icon";
import { adminProductsHref } from "@/lib/routes";
import { requireAdmin } from "@/server/admin/current-admin";

export const metadata: Metadata = {
  title: "New product",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * Creating a product.
 *
 * The form defaults to draft: something half-written should not appear in the
 * shop because somebody pressed save. Publishing is a separate, deliberate
 * action on the product's own page.
 */
export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link
        href={adminProductsHref()}
        className="link-underline -mx-2 inline-flex w-fit min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      >
        <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
        Back to products
      </Link>

      <AdminPageHeader
        title="New product"
        description="Saved as a draft unless you publish it."
      />

      <AdminProductForm />
    </div>
  );
}
