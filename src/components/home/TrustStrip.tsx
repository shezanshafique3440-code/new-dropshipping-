import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { trustItems } from "@/data/mock-storefront";

/**
 * Compact promise strip between the hero and the first product grid.
 * The claims are placeholder copy for the demo storefront.
 */
export function TrustStrip() {
  return (
    <section
      aria-label="What ZYVERO offers"
      className="border-y border-border-subtle bg-surface"
    >
      <Container className="grid grid-cols-2 gap-x-6 gap-y-5 py-6 lg:grid-cols-4 lg:py-7">
        {trustItems.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-primary-soft text-brand-primary">
              <Icon name={item.icon} className="size-[1.15rem]" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm leading-snug font-semibold">
                {item.label}
              </span>
              <span className="type-caption block text-foreground-subtle">
                {item.detail}
              </span>
            </span>
          </div>
        ))}
      </Container>
    </section>
  );
}
