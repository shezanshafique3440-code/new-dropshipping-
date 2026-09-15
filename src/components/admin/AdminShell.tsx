"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { Wordmark } from "@/components/brand/Wordmark";
import { Icon } from "@/components/ui/Icon";
import { adminHref } from "@/lib/routes";
import type { PublicAdmin } from "@/server/admin/dto";

export interface AdminShellProps {
  /** Resolved server-side from the admin session cookie. */
  admin: PublicAdmin;
  children: ReactNode;
}

/**
 * The operations panel's frame.
 *
 * A fixed sidebar from `lg` up, and a top bar with a disclosure drawer below
 * it — a table of orders needs the width, and a phone has none to give. It is
 * deliberately not the storefront header: an operator is not shopping, and a
 * cart, a search box and a link to the sale would be noise at best and a
 * misclick at worst. The tokens are ZYVERO's, so it still looks like the same
 * company's software.
 *
 * The drawer is a client concern only because a disclosure needs state. Every
 * page inside it stays a server component, and the administrator's details
 * arrive as a prop from a page that has already proved who they are.
 */
export function AdminShell({ admin, children }: AdminShellProps) {
  const pathname = usePathname();
  // The drawer remembers which page it was opened on, so navigating closes it
  // by derivation rather than by an effect that fires after the new page has
  // already rendered behind it.
  const [drawer, setDrawer] = useState({ open: false, at: pathname });
  const open = drawer.open && drawer.at === pathname;
  const setOpen = (next: boolean) => setDrawer({ open: next, at: pathname });
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawer((current) => ({ ...current, open: false }));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-background lg:flex-row">
      {/* Desktop sidebar */}
      <aside
        aria-label="Operations"
        className="hidden shrink-0 border-r border-border-subtle bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:flex-col lg:gap-6 lg:p-5"
      >
        <AdminBrand />
        <nav aria-label="Operations sections" className="flex-1">
          <AdminNav />
        </nav>
        <AdminIdentity admin={admin} />
      </aside>

      {/* Mobile bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border-subtle bg-surface px-4 py-3 lg:hidden">
        <AdminBrand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="inline-flex size-11 items-center justify-center rounded-xl border border-border text-foreground-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          <Icon name="menu" className="size-5" />
          <span className="sr-only">Open operations menu</span>
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close operations menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy-950/50 motion-safe:animate-fade"
          />
          <div
            id="admin-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Operations menu"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col gap-6 overflow-y-auto border-r border-border bg-surface p-5 shadow-floating motion-safe:animate-slide-in"
          >
            <div className="flex items-center justify-between gap-3">
              <AdminBrand />
              <button
                type="button"
                ref={closeButton}
                onClick={() => setOpen(false)}
                className="inline-flex size-11 items-center justify-center rounded-xl border border-border text-foreground-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                <Icon name="close" className="size-5" />
                <span className="sr-only">Close operations menu</span>
              </button>
            </div>
            <nav aria-label="Operations sections" className="flex-1">
              <AdminNav onNavigate={() => setOpen(false)} />
            </nav>
            <AdminIdentity admin={admin} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* The same id the root layout's skip link points at, so the link
            still lands on the content rather than the sidebar. */}
        <main id="main-content" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminBrand() {
  return (
    <Link
      href={adminHref()}
      // A full-height target: this is the way back to the dashboard from every
      // page, and on a phone it sits in the top bar beside the menu button.
      className="inline-flex min-h-11 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
    >
      <Wordmark size="sm" />
      <span className="type-caption rounded-full border border-border-highlight bg-brand-primary-soft px-2 py-0.5 font-semibold tracking-wide text-brand-primary uppercase">
        Ops
      </span>
    </Link>
  );
}

function AdminIdentity({ admin }: { admin: PublicAdmin }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border-subtle pt-4">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold">{admin.name}</span>
        <span className="type-caption truncate text-foreground-subtle">
          {admin.email}
        </span>
        <span className="type-caption mt-1 w-fit rounded-full bg-surface-muted px-2 py-0.5 font-semibold tracking-wide text-foreground-muted uppercase">
          {admin.role}
        </span>
      </div>
      <AdminSignOutButton />
    </div>
  );
}
