import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { toPublicAdmin } from "@/server/admin/dto";
import { requireAdmin } from "@/server/admin/current-admin";

/**
 * The protected part of the panel.
 *
 * `requireAdmin()` runs here, on the server, before any page inside this
 * group renders — so the dashboard, the order list and the order detail are
 * never assembled for a request that has not proved who it is. The layout is
 * the floor: a page inside it cannot forget to check, and the middleware in
 * front is only an early redirect, not the decision.
 *
 * The sign-in page deliberately sits outside this group.
 */
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { admin } = await requireAdmin();

  return <AdminShell admin={toPublicAdmin(admin)}>{children}</AdminShell>;
}
