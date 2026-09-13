"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Route-level error boundary for the storefront. */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Reporting to an observability provider is wired up in a later step.
    console.error(error);
  }, [error]);

  return (
    <div className="section-y">
      <Container size="sm" className="flex flex-col items-start gap-5">
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium tracking-wide text-foreground-muted uppercase">
          Something went wrong
        </span>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          This page failed to load
        </h1>
        <p className="text-base leading-relaxed text-foreground-muted">
          An unexpected error interrupted the page. Try again — if it keeps
          happening, get in touch and we will look into it.
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-foreground-muted">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/" variant="outline">
            Back to home
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
