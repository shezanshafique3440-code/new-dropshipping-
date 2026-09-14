import { Container } from "@/components/ui/Container";

/**
 * Order-history skeleton.
 *
 * Sized to the real rows so the page does not jump when they arrive. The
 * pulse is a shared utility that reduced-motion already disables globally.
 */
export default function AccountOrdersLoading() {
  return (
    <>
      <div className="gradient-hero border-b border-border-subtle py-14 md:py-20">
        <Container className="flex max-w-3xl flex-col gap-5">
          <div aria-hidden="true" className="h-6 w-28 animate-pulse rounded-full bg-surface-muted" />
          <div aria-hidden="true" className="h-10 w-52 animate-pulse rounded-2xl bg-surface-muted" />
        </Container>
      </div>

      <Container className="section-y-sm">
        <div role="status" className="flex flex-col gap-4">
          <span className="sr-only">Loading your orders</span>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              aria-hidden="true"
              className="h-32 animate-pulse rounded-2xl bg-surface-muted sm:h-24"
            />
          ))}
        </div>
      </Container>
    </>
  );
}
