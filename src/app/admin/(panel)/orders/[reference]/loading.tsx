/** While one order is being read. No placeholder rows: nothing is known yet. */
export default function AdminOrderLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="h-5 w-32 rounded bg-surface-muted" />
      <div className="flex flex-col gap-2 border-b border-border-subtle pb-6">
        <span className="h-7 w-56 rounded-lg bg-surface-muted" />
        <span className="h-4 w-72 rounded bg-surface-muted" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <span className="h-72 rounded-2xl border border-border bg-surface" />
        <span className="h-72 rounded-2xl border border-border bg-surface" />
      </div>
      <p role="status" className="type-caption text-foreground-muted">
        Loading order…
      </p>
    </div>
  );
}
