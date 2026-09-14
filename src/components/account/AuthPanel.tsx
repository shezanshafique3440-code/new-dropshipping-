import type { ReactNode } from "react";
import Link from "next/link";

import { Container } from "@/components/ui/Container";

export interface AuthPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  /** The "no account yet?" / "already have one?" line under the form. */
  footer: ReactNode;
}

/**
 * Shared frame for sign-in and registration.
 *
 * One column, centred, no storefront distractions: the only thing to do on
 * these pages is the form. The gradient wash and glass panel are the same
 * ones the rest of ZYVERO uses, so it reads as part of the store rather than
 * a bolted-on auth screen.
 */
export function AuthPanel({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthPanelProps) {
  return (
    <div className="gradient-hero flex-1 py-12 md:py-20">
      <Container size="md">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          <header className="flex flex-col gap-2 text-center">
            <span className="type-eyebrow text-brand-primary">{eyebrow}</span>
            <h1 className="type-h2">{title}</h1>
            <p className="text-sm text-foreground-muted">{description}</p>
          </header>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
            {children}
          </div>

          <p className="type-caption text-center text-foreground-muted">
            {footer}
          </p>
        </div>
      </Container>
    </div>
  );
}

/** Consistent inline link for the panel footer. */
export function AuthPanelLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-semibold text-brand-primary underline decoration-brand-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
    >
      {children}
    </Link>
  );
}
