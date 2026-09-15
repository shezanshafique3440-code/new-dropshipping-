"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Hides storefront chrome on routes that render their own.
 *
 * Checkout shows a minimal header of its own: once someone is checking out,
 * the shop navigation is a distraction and an exit. The operations panel has
 * its own shell entirely — a sidebar, not a storefront header — so the same
 * mechanism keeps the two apart rather than the admin pages inheriting a
 * header with a cart in it.
 *
 * Children stay server-rendered; this only decides whether to show them.
 */

/** The panel, which brings its own frame. */
export const ADMIN_ROUTES = ["/admin"] as const;

/** Everything that replaces the storefront header and footer. */
export const FOCUSED_ROUTES = ["/checkout", ...ADMIN_ROUTES] as const;

export interface SiteChromeProps {
  children: ReactNode;
  /** Route prefixes on which the children are not rendered. */
  hiddenOn?: readonly string[];
}

export function SiteChrome({ children, hiddenOn = FOCUSED_ROUTES }: SiteChromeProps) {
  const pathname = usePathname();
  const hidden = hiddenOn.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return hidden ? null : <>{children}</>;
}
