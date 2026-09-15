/** While the catalogue is being read. No placeholder rows: nothing is known. */
export default function AdminProductsLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2 border-b border-border-subtle pb-6">
        <span className="h-7 w-40 rounded-lg bg-surface-muted" />
        <span className="h-4 w-64 rounded bg-surface-muted" />
      </div>
      <span className="h-28 rounded-2xl border border-border bg-surface" />
      <span className="h-64 rounded-2xl border border-border bg-surface" />
      <p role="status" className="type-caption text-foreground-muted">
        Loading products…
      </p>
    </div>
  );
}
