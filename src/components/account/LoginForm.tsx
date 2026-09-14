"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { PasswordField, TextField } from "@/components/ui/FormField";
import { Icon } from "@/components/ui/Icon";

export interface LoginFormProps {
  /** Already validated server-side; re-checked by the server on submit. */
  next: string;
}

/**
 * Sign-in form.
 *
 * Submits to the server and does nothing clever with the result: the session
 * arrives as an HttpOnly cookie the browser cannot read, so there is no token
 * to store and no "logged in" flag to keep in React. Where to go next is
 * decided by the server, from a value it has validated.
 */
export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, next }),
      });
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setSubmitting(false);
        setError(readMessage(data) ?? "Email or password is incorrect.");
        return;
      }

      // A full navigation, so every server component re-renders as the
      // signed-in customer rather than from a cached guest view.
      const destination = readNext(data) ?? "/account";
      router.replace(destination);
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

      <TextField
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        label="Email address"
        value={email}
        data-field="email"
        onChange={(event) => setEmail(event.target.value)}
      />

      <PasswordField
        name="password"
        autoComplete="current-password"
        label="Password"
        value={password}
        data-field="password"
        onChange={(event) => setPassword(event.target.value)}
      />

      <Button
        type="submit"
        variant="gradient"
        size="lg"
        fullWidth
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
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

function readNext(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "next" in data) {
    const next = (data as { next?: unknown }).next;
    // Only ever a path on this site; the server has already validated it.
    if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//")) {
      return next;
    }
  }
  return null;
}
