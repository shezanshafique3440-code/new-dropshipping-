"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { NavLink } from "@/components/layout/NavLink";
import { SearchTrigger } from "@/components/layout/SearchTrigger";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

const shortcuts: ReadonlyArray<{
  href: string;
  icon: IconName;
  label: string;
}> = [
  { href: "/account", icon: "user", label: "Account" },
  { href: "/cart", icon: "bag", label: "Cart" },
];

export interface MobileMenuProps {
  items: readonly NavItem[];
}

/**
 * Small-screen navigation drawer. The panel stays mounted so it can transition
 * smoothly, and is made `inert` while closed so it leaves the tab order and
 * the accessibility tree.
 */
export function MobileMenu({ items }: MobileMenuProps) {
  const panelId = useId();
  const pathname = usePathname();
  /**
   * The route the drawer was opened on. Deriving `open` from it means a
   * navigation — including browser back/forward — closes the drawer without
   * an effect that re-renders on every route change.
   */
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenedOn(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const close = () => setOpenedOn(null);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpenedOn(open ? null : pathname)}
        className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary lg:hidden"
      >
        <Icon name={open ? "close" : "menu"} className="size-5" />
      </button>

      <div
        id={panelId}
        inert={!open}
        className={cn(
          "absolute inset-x-0 top-full z-50 origin-top border-b border-border bg-surface shadow-floating transition-[opacity,transform] duration-300 ease-[var(--ease-out-soft)] lg:hidden",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="container-page flex max-h-[calc(100dvh-8rem)] flex-col gap-5 overflow-y-auto py-5">
          <SearchTrigger />

          <nav aria-label="Mobile">
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    onNavigate={close}
                    className="flex items-center justify-between border-b border-border-subtle px-1 py-3.5 text-base font-medium"
                    activeClassName="text-brand-primary"
                  >
                    {item.label}
                    <Icon
                      name="arrowRight"
                      className="size-4 text-foreground-subtle"
                    />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid grid-cols-2 gap-3">
            {shortcuts.map((shortcut) => (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                onClick={close}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-border-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                <Icon name={shortcut.icon} className="size-[1.15rem]" />
                {shortcut.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
