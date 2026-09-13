import { SectionHeading } from "@/components/home/SectionHeading";
import { Card, CardContent } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { valueProps } from "@/data/mock-storefront";

/** Numbered value propositions explaining the ZYVERO approach. */
export function WhyZyvero() {
  return (
    <section
      aria-labelledby="why-heading"
      className="section-y border-y border-border-subtle bg-surface"
    >
      <Container className="flex flex-col gap-10">
        <SectionHeading
          id="why-heading"
          eyebrow="Why ZYVERO"
          title="Shopping, Reimagined."
          description="Four principles behind how the store is put together."
          align="center"
          className="reveal"
        />

        <ol className="reveal-stagger grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {valueProps.map((value) => (
            <li key={value.id} className="flex">
              <Card variant="muted" interactive className="w-full">
                <CardContent className="flex h-full flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-surface text-brand-primary shadow-soft">
                      <Icon name={value.icon} />
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-2xl font-bold text-border-strong"
                    >
                      {value.index}
                    </span>
                  </div>
                  <h3 className="type-h3">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-foreground-muted">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
