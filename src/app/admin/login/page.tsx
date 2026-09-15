import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Wordmark } from "@/components/brand/Wordmark";
import { Icon } from "@/components/ui/Icon";
import { safeAdminPath } from "@/lib/redirects";
import { requireSignedOutAdmin } from "@/server/admin/current-admin";

export const metadata: Metadata = {
  title: "Sign in",
  description: "ZYVERO operations sign-in.",
  robots: { index: false, follow: false, nocache: true },
};

/** Rendered per request: what it does depends on the admin session cookie. */
export const dynamic = "force-dynamic";

interface AdminLoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Admin sign-in.
 *
 * Outside the `(panel)` group, so it renders without the shell and without
 * `requireAdmin()` — the one admin route that has to work with no session.
 * An operator who already has one is sent on rather than shown the form
 * again.
 *
 * There is no "create an account", no "forgot password" and no social button,
 * because none of those exist: an administrator is created by somebody with
 * database access running the bootstrap script.
 */
export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const raw = typeof params.next === "string" ? params.next : undefined;
  // Sanitised here and again when it is acted on: a crafted `next` never
  // becomes a redirect off this site, or out of the panel.
  const next = safeAdminPath(raw);

  await requireSignedOutAdmin(next);

  return (
    // Its own landmark, and the id the root layout's skip link points at: the
    // panel's routes opt out of the shared <main>, and this page is not
    // inside the shell that provides one.
    <main
      id="main-content"
      className="flex min-h-dvh flex-1 items-center justify-center bg-background px-4 py-12"
    >
      <div className="flex w-full max-w-md flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <Wordmark size="lg" />
          <h1 className="type-h3">Operations sign-in</h1>
          <p className="type-caption text-foreground-muted">
            This area is for ZYVERO staff. Everything you do here is recorded
            against your account.
          </p>
        </header>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <AdminLoginForm next={next} />
        </div>

        <p className="type-caption flex items-start justify-center gap-2 text-center text-foreground-subtle">
          <Icon name="lock" className="mt-px size-3.5 shrink-0" />
          Accounts are created by an administrator with database access. There
          is no self-service sign-up or password reset.
        </p>
      </div>
    </main>
  );
}
