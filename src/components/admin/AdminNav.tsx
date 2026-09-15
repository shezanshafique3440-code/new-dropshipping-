"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { adminHref, adminAccountHref, adminOrdersHref } from "@/lib/routes";

/**
 * The panel's navigation.
 *
 * Three destinations, which is all there is. The current one is marked with
 * `aria-current="page"` as well as a colour change, so it is announced rather
 * than only seen, and the whole thing is a plain list of links — no menu
 * widget, no keyboard trap.
 */

interface AdminNavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Exact match only, or the section and everything under it. */
  exact?: boolean;
}

const ITEMS: readonly AdminNavItem[] = [
  { href: adminHref(), label: "Dashboard", icon: "layers", exact: true },
  { href: adminOrdersHref(), label: "Orders", icon: "bag" },
  { href: adminAccountHref(), label: "Your profile", icon: "user" },
];

export interface AdminNavProps {
  /** Closes the mobile drawer after a link is followed. */
  onNavigate?: () => void;
}

export function AdminNav({ onNavigate }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
                active
                  ? "bg-brand-primary-soft text-brand-primary"
                  : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
              )}
            >
              <Icon name={item.icon} className="size-4.5 shrink-0" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
