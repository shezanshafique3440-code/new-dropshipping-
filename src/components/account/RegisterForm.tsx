"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { FieldRow, PasswordField, TextField } from "@/components/ui/FormField";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import {
  MIN_PASSWORD_LENGTH,
  assessPassword,
  type PasswordStrength,
} from "@/server/auth/validation";

export interface RegisterFormProps {
  next: string;
}

type FieldName =
  | "firstName"
  | "lastName"
  | "email"
  | "password"
  | "confirmPassword";

/**
 * Registration form.
 *
 * The strength meter is guidance, not a gate: the server decides what is
 * acceptable, and it asks for length rather than a zoo of character classes.
 * Validation messages come back per field so the customer is told which one
 * to fix.
 *
 * `@/server/auth/validation` is imported for `assessPassword` — the module is
 * pure rules with no database or secret in it, which is why it is safe on
 * both sides of the boundary and why both sides cannot disagree.
 */
export function RegisterForm({ next }: RegisterFormProps) {
  const router = useRouter();
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field: FieldName, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const strength = useMemo(
    () => (values.password ? assessPassword(values.password) : null),
    [values.password],
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, next }),
      });
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setSubmitting(false);
        setFieldErrors(readFields(data));
        setError(readMessage(data) ?? "We could not create your account.");
        return;
      }

      router.replace(readNext(data) ?? "/account");
      router.refresh();
    } catch {
      setSubmitting(false);
      setError("We could not reach the server. Please try again.");
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {error ? (
        <p
          role="alert"
          data-auth-error
          className="type-caption flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/5 p-3.5 font-medium text-danger"
        >
          <Icon name="close" className="mt-px size-4 shrink-0" strokeWidth={2.5} />
          {error}
        </p>
      ) : null}

      <FieldRow className="sm:grid-cols-2">
        <TextField
          name="given-name"
          autoComplete="given-name"
          label="First name"
          value={values.firstName}
          error={fieldErrors.firstName}
          data-field="firstName"
          onChange={(event) => set("firstName", event.target.value)}
        />
        <TextField
          name="family-name"
          autoComplete="family-name"
          label="Last name"
          value={values.lastName}
          error={fieldErrors.lastName}
          data-field="lastName"
          onChange={(event) => set("lastName", event.target.value)}
        />
      </FieldRow>

      <TextField
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        label="Email address"
        hint="Used to sign in and to send order updates."
        value={values.email}
        error={fieldErrors.email}
        data-field="email"
        onChange={(event) => set("email", event.target.value)}
      />

      <div className="flex flex-col gap-2">
        <PasswordField
          name="new-password"
          autoComplete="new-password"
          label="Password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters. A short phrase beats a short password.`}
          value={values.password}
          error={fieldErrors.password}
          data-field="password"
          onChange={(event) => set("password", event.target.value)}
        />
        {strength ? <StrengthMeter {...strength} /> : null}
      </div>

      <PasswordField
        name="confirm-password"
        autoComplete="new-password"
        label="Confirm password"
        value={values.confirmPassword}
        error={fieldErrors.confirmPassword}
        data-field="confirmPassword"
        onChange={(event) => set("confirmPassword", event.target.value)}
      />

      <Button
        type="submit"
        variant="gradient"
        size="lg"
        fullWidth
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? "Creating your account…" : "Create account"}
      </Button>
    </form>
  );
}

const STRENGTH_STYLES: Record<PasswordStrength, { bar: string; width: string }> = {
  weak: { bar: "bg-danger", width: "w-1/3" },
  fair: { bar: "bg-warning", width: "w-2/3" },
  strong: { bar: "bg-success", width: "w-full" },
};

function StrengthMeter({
  strength,
  hint,
}: {
  strength: PasswordStrength;
  hint: string;
}) {
  const style = STRENGTH_STYLES[strength];
  return (
    <div className="flex flex-col gap-1.5" data-password-strength={strength}>
      <div
        aria-hidden="true"
        className="h-1 overflow-hidden rounded-full bg-surface-muted"
      >
        <div className={cn("h-full rounded-full transition-all duration-300", style.bar, style.width)} />
      </div>
      {/* Polite, so typing does not interrupt a screen reader mid-word. */}
      <p aria-live="polite" className="type-caption text-foreground-muted">
        {hint}
      </p>
    </div>
  );
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

function readFields(data: unknown): Partial<Record<FieldName, string>> {
  if (typeof data !== "object" || data === null || !("fields" in data)) {
    return {};
  }
  const fields = (data as { fields?: unknown }).fields;
  if (typeof fields !== "object" || fields === null) {
    return {};
  }
  const result: Partial<Record<FieldName, string>> = {};
  for (const key of [
    "firstName",
    "lastName",
    "email",
    "password",
    "confirmPassword",
  ] as const) {
    const value = (fields as Record<string, unknown>)[key];
    if (typeof value === "string" && value.length <= 200) {
      result[key] = value;
    }
  }
  return result;
}

function readNext(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "next" in data) {
    const next = (data as { next?: unknown }).next;
    if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//")) {
      return next;
    }
  }
  return null;
}
