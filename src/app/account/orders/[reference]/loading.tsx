import { Container } from "@/components/ui/Container";

/** Skeleton shaped like the order detail, so nothing shifts on arrival. */
export default function AccountOrderLoading() {
  return (
    <Container className="section-y-sm">
      <div role="status" className="flex flex-col gap-8">
        <span className="sr-only">Loading your order</span>
        <div className="flex flex-col gap-3">
          <div aria-hidden="true" className="h-5 w-36 animate-pulse rounded-full bg-surface-muted" />
          <div aria-hidden="true" className="h-9 w-64 animate-pulse rounded-2xl bg-surface-muted" />
          <div aria-hidden="true" className="h-6 w-40 animate-pulse rounded-full bg-surface-muted" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <div aria-hidden="true" className="h-56 animate-pulse rounded-3xl bg-surface-muted" />
            <div aria-hidden="true" className="h-64 animate-pulse rounded-3xl bg-surface-muted" />
          </div>
          <div className="flex flex-col gap-6">
            <div aria-hidden="true" className="h-52 animate-pulse rounded-3xl bg-surface-muted" />
            <div aria-hidden="true" className="h-56 animate-pulse rounded-3xl bg-surface-muted" />
          </div>
        </div>
      </div>
    </Container>
  );
}
