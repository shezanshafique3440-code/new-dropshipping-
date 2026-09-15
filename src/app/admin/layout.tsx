import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Everything under /admin.
 *
 * This layout exists for one reason: to put `noindex, nofollow` on the whole
 * panel, sign-in page included, in one place rather than on each page and
 * hoping none is forgotten. The frame itself lives one level down, in the
 * `(panel)` group, so the sign-in page can render without it.
 */
export const metadata: Metadata = {
  title: {
    default: "Operations",
    template: "%s — ZYVERO Operations",
  },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
