import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { formatDate } from "@/lib/format";
import { toPublicAdmin } from "@/server/admin/dto";
import { requireAdmin } from "@/server/admin/current-admin";

export const metadata: Metadata = {
  title: "Your profile",
  robots: { index: false, follow: false, nocache: true },
};

/** Depends on the admin session cookie. */
export const dynamic = "force-dynamic";

/**
 * The operator's own details.
 *
 * Deliberately read-only. Changing a password or adding a colleague needs
 * flows this step does not build — old-password confirmation, session
 * invalidation, an invitation — and a half-built version of either would be
 * worse than none. Accounts are managed by whoever has database access, with
 * the bootstrap script.
 */
export default async function AdminAccountPage() {
  const { admin } = await requireAdmin();
  const profile = toPublicAdmin(admin);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Your profile"
        description="Who you are signed in as, and how to stop being signed in."
      />

      <section
        aria-labelledby="admin-profile-heading"
        className="flex max-w-xl flex-col gap-5 rounded-2xl border border-border bg-surface p-5"
      >
        <h2 id="admin-profile-heading" className="type-h5">
          Account
        </h2>

        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field label="Name" value={profile.name} />
          <Field label="Email" value={profile.email} />
          <Field label="Role" value={profile.role} />
          <Field
            label="Last signed in"
            value={
              profile.lastLoginAt
                ? formatDate(profile.lastLoginAt, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "This is your first session"
            }
          />
        </dl>

        <div className="border-t border-border-subtle pt-4">
          <AdminSignOutButton className="-ml-3" />
        </div>
      </section>

      <p className="type-caption max-w-xl text-foreground-subtle">
        Passwords and admin accounts are managed outside the panel, by an
        administrator with database access. There is no self-service password
        change here yet.
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="type-caption text-foreground-subtle">{label}</dt>
      <dd className="text-sm font-medium break-words">{value}</dd>
    </div>
  );
}
