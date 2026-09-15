"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * When a panel page fails.
 *
 * Nothing about the failure reaches the browser: the message is fixed, and
 * the real error — which may carry a query, a connection string or a stack —
 * stays in the server log.
 */
export default function AdminPanelError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-danger/40 bg-danger/5 p-6">
      <span className="grid size-11 place-items-center rounded-xl bg-danger/10 text-danger">
        <Icon name="close" className="size-5" strokeWidth={2} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="type-h4">Something went wrong</h1>
        <p className="text-sm text-foreground-muted">
          This page could not be loaded. Nothing has been changed.
        </p>
      </div>
      <Button type="button" variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
