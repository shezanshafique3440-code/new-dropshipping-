/** While a panel page is being assembled. */
export default function AdminPanelLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2 border-b border-border-subtle pb-6">
        <span className="h-7 w-48 rounded-lg bg-surface-muted" />
        <span className="h-4 w-64 rounded bg-surface-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <span key={index} className="h-32 rounded-2xl border border-border bg-surface" />
        ))}
      </div>
      <p role="status" className="type-caption text-foreground-muted">
        Loading…
      </p>
    </div>
  );
}
