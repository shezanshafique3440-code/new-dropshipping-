"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * When the catalogue cannot be read.
 *
 * Usually the database being unreachable. The operator gets a plain
 * explanation and a retry; the real error stays in the server log, where the
 * connection details it may carry cannot reach a browser.
 */
export default function AdminProductsError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-danger/40 bg-danger/5 p-6">
      <span className="grid size-11 place-items-center rounded-xl bg-danger/10 text-danger">
        <Icon name="close" className="size-5" strokeWidth={2} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="type-h4">Products could not be loaded</h1>
        <p className="text-sm text-foreground-muted">
          The catalogue could not be read just now. Nothing has been changed.
        </p>
      </div>
      <Button type="button" variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
