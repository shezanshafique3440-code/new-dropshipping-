"use client";

import { useEffect } from "react";

import { Badge } from "@/components/ui/Badge";
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
        <Badge variant="sale">Something went wrong</Badge>
        <h1 className="type-h1">This page failed to load</h1>
        <p className="type-body-lg text-foreground-muted">
          An unexpected error interrupted the page. Try again — if it keeps
          happening, get in touch and we will look into it.
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-foreground-subtle">
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
