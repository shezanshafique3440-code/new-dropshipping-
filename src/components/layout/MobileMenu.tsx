"use client";

import { useEffect, useId, useState } from "react";

import { NavLink } from "@/components/layout/NavLink";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import type { NavItem } from "@/types";

export interface MobileMenuProps {
  items: readonly NavItem[];
}

/** Small-screen navigation drawer for the site header. */
export function MobileMenu({ items }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-muted"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="size-5"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open ? (
        <div
          id={panelId}
          className="fixed inset-x-0 top-16 z-40 border-b border-border bg-background px-4 pb-6 shadow-lifted"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {items.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                onNavigate={() => setOpen(false)}
                className="border-b border-border px-2 py-4 text-base last:border-b-0"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
