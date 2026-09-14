"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

/**
 * Something went wrong reading the order history.
 *
 * The customer is told that and nothing else: the underlying error — a
 * database outage, a query failure — has already been logged server-side, and
 * its message never reaches this component.
 */
export default function AccountOrdersError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container size="md" className="section-y-sm">
      <div className="mx-auto flex max-w-lg flex-col items-start gap-4 rounded-3xl border border-border bg-surface p-8">
        <span className="grid size-11 place-items-center rounded-2xl bg-surface-muted text-foreground-subtle">
          <Icon name="refresh" className="size-5" />
        </span>
        <h1 className="type-h2">We could not load your orders</h1>
        <p className="text-sm text-foreground-muted">
          Something went wrong on our side. Your orders are safe — please try
          again in a moment.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/account" variant="outline">
            Back to account
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
