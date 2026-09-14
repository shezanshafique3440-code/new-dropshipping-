"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/FormField";
import { Icon } from "@/components/ui/Icon";
import type { PublicCustomer } from "@/server/auth/dto";

export interface AccountDashboardProps {
  /** Resolved server-side from the session cookie, never from the browser. */
  customer: PublicCustomer;
}

/**
 * The account area.
 *
 * Everything shown here is real: a name, an email address, when the account
 * was created and when it was last used. No invented order counts, loyalty
 * tiers or saved cards — order history arrives with the step that actually
 * builds it.
 *
 * The customer arrives as a prop from a server component that resolved the
 * session; this component never decides who is signed in, and the update it
 * sends carries no identifier at all.
 */
export function AccountDashboard({ customer }: AccountDashboardProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(customer.firstName);
  const [lastName, setLastName] = useState(customer.lastName);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});
  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "saved" } | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const dirty =
    firstName !== customer.firstName || lastName !== customer.lastName;

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) {
      return;
    }
    setSaving(true);
    setStatus({ kind: "idle" });
    setFieldErrors({});

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setFieldErrors(readFields(data));
        setStatus({
          kind: "error",
          message: readMessage(data) ?? "We could not save those changes.",
        });
        return;
      }

      setStatus({ kind: "saved" });
      // Re-render the server components so the greeting matches the new name.
      router.refresh();
    } catch {
      setStatus({
        kind: "error",
        message: "We could not reach the server. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    if (signingOut) {
      return;
    }
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // The session is revoked server-side or it is not; either way the next
      // navigation asks the server, which is the only authority.
    }
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-8">
      <section
        aria-labelledby="profile-heading"
        className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8"
      >
        <div className="flex flex-col gap-1">
          <h2 id="profile-heading" className="type-h3">
            Profile
          </h2>
          <p className="type-caption text-foreground-muted">
            The name we use on your orders and in messages.
          </p>
        </div>

        <form onSubmit={save} noValidate className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="given-name"
              autoComplete="given-name"
              label="First name"
              value={firstName}
              error={fieldErrors.firstName}
              data-field="firstName"
              onChange={(event) => setFirstName(event.target.value)}
            />
            <TextField
              name="family-name"
              autoComplete="family-name"
              label="Last name"
              value={lastName}
              error={fieldErrors.lastName}
              data-field="lastName"
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>

          {/* Shown as text rather than a disabled input: it is not editable
              here, and a greyed-out box in the tab order only suggests
              otherwise. Changing the sign-in address needs verification of
              the new one, which is not built yet. */}
          <div className="flex flex-col gap-1.5" data-field="email">
            <p className="text-sm font-medium">Email address</p>
            <p className="rounded-xl border border-border-subtle bg-surface-muted px-4 py-3 text-sm break-words">
              {customer.email}
            </p>
            <p className="type-caption text-foreground-subtle">
              Your sign-in address. Contact support if you need it changed.
            </p>
          </div>

          {status.kind === "error" ? (
            <p
              role="alert"
              data-profile-error
              className="type-caption flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/5 p-3.5 font-medium text-danger"
            >
              <Icon name="close" className="mt-px size-4 shrink-0" strokeWidth={2.5} />
              {status.message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              variant="primary"
              disabled={saving || !dirty}
              aria-busy={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
            {/* Polite and always present, so the confirmation is announced
                without the region appearing and disappearing. */}
            <p
              aria-live="polite"
              data-profile-status
              className="type-caption text-foreground-muted"
            >
              {status.kind === "saved" ? "Profile updated." : ""}
            </p>
          </div>
        </form>
      </section>

      <section
        aria-labelledby="security-heading"
        className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8"
      >
        <div className="flex flex-col gap-1">
          <h2 id="security-heading" className="type-h3">
            Security
          </h2>
          <p className="type-caption text-foreground-muted">
            Your password is stored as a salted Argon2id hash — nobody at
            ZYVERO can read it.
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="type-caption text-foreground-subtle">Member since</dt>
            <dd className="text-sm font-medium">{formatDate(customer.createdAt)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="type-caption text-foreground-subtle">Last sign-in</dt>
            <dd className="text-sm font-medium">
              {customer.lastLoginAt ? formatDate(customer.lastLoginAt) : "This session"}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-3 border-t border-border-subtle pt-5">
          <Button
            variant="outline"
            onClick={signOut}
            disabled={signingOut}
            aria-busy={signingOut}
            data-sign-out
          >
            <Icon name="arrowRight" className="size-4 rotate-180" strokeWidth={2} />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
          <p className="type-caption text-foreground-muted">
            Ends this session on this device.
          </p>
        </div>
      </section>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function readMessage(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "error" in data) {
    const message = (data as { error?: unknown }).error;
    if (typeof message === "string" && message.length > 0 && message.length <= 200) {
      return message;
    }
  }
  return null;
}

function readFields(data: unknown): { firstName?: string; lastName?: string } {
  if (typeof data !== "object" || data === null || !("fields" in data)) {
    return {};
  }
  const fields = (data as { fields?: unknown }).fields;
  if (typeof fields !== "object" || fields === null) {
    return {};
  }
  const result: { firstName?: string; lastName?: string } = {};
  for (const key of ["firstName", "lastName"] as const) {
    const value = (fields as Record<string, unknown>)[key];
    if (typeof value === "string" && value.length <= 200) {
      result[key] = value;
    }
  }
  return result;
}
