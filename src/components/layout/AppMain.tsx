"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ADMIN_ROUTES } from "@/components/layout/SiteChrome";

/**
 * The page's main landmark.
 *
 * Every storefront page is wrapped in one here. The operations panel is the
 * exception: its shell renders a sidebar beside the content, and the sidebar
 * must not be inside `main`, so the panel provides its own `<main>` (with the
 * same id, so the skip link still lands on the content) and this steps out of
 * the way rather than nesting a second landmark inside the first.
 */
export function AppMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ownsItsLayout = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (ownsItsLayout) {
    return <>{children}</>;
  }

  return (
    <main id="main-content" className="flex-1">
      {children}
    </main>
  );
}
