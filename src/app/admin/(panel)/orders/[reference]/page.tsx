import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminOrderDetail } from "@/components/admin/AdminOrderDetail";
import { requireAdmin } from "@/server/admin/current-admin";
import { getAdminOrder } from "@/server/admin/orders/service";
import { isOrderReference } from "@/server/orders/reference";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false, nocache: true },
};

/** Depends on the admin session and on live order data. */
export const dynamic = "force-dynamic";

interface AdminOrderPageProps {
  params: Promise<{ reference: string }>;
}

/**
 * One order, in full.
 *
 * `requireAdmin()` runs here rather than relying on the layout, which Next
 * renders in parallel with this page and therefore cannot stop it. Once an
 * administrator is resolved there is no further ownership condition — an
 * operator is meant to see every order, including the guest orders no
 * account can open. That is the deliberate difference between this page and
 * the customer's own order page, and the reason this one is not reachable
 * without proving who is asking.
 *
 * The reference is checked for shape before it is used, so a crafted value
 * becomes a 404 rather than a query.
 */
export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { admin } = await requireAdmin();
  const { reference } = await params;
  if (!isOrderReference(reference)) {
    notFound();
  }

  const order = await getAdminOrder(admin, reference);
  if (!order) {
    notFound();
  }

  return <AdminOrderDetail order={order} />;
}
