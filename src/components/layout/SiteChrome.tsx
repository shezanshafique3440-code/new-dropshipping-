"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Hides the storefront header and footer on focused routes.
 *
 * Checkout renders its own minimal chrome: once someone is checking out, the
 * shop navigation is a distraction and an exit. Children stay server-rendered
 * — this only decides whether to show them.
 */
const FOCUSED_ROUTES = ["/checkout"];

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const focused = FOCUSED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return focused ? null : <>{children}</>;
}
