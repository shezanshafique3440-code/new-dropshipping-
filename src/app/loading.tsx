import { Container } from "@/components/ui/Container";

/** Route-level loading skeleton shown while a server component streams in. */
export default function Loading() {
  return (
    <div className="section-y" role="status" aria-live="polite">
      <Container className="flex flex-col gap-6">
        <span className="sr-only">Loading</span>
        <div
          aria-hidden="true"
          className="h-4 w-28 animate-pulse rounded-full bg-surface-muted"
        />
        <div
          aria-hidden="true"
          className="h-10 w-3/4 animate-pulse rounded-xl bg-surface-muted sm:w-1/2"
        />
        <div
          aria-hidden="true"
          className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-surface-muted"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              aria-hidden="true"
              className="h-40 animate-pulse rounded-2xl bg-surface-muted"
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
