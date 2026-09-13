import { ButtonLink } from "@/components/ui/Button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";

/** Placeholder pillars — replaced by real merchandising in a later step. */
const pillars = [
  {
    title: "Curated catalogue",
    description:
      "A tight, design-led selection instead of an endless feed of listings.",
  },
  {
    title: "Worldwide delivery",
    description:
      "Partner warehouses on three continents keep transit times short.",
  },
  {
    title: "Frictionless checkout",
    description:
      "A single, fast flow with the payment methods shoppers already use.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="section-y">
        <Container className="flex flex-col items-start gap-6">
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium tracking-wide text-foreground-muted uppercase">
            Foundation — step 1
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold sm:text-5xl lg:text-6xl">
            <span className="block text-gradient-brand">{siteConfig.name}</span>
            <span className="block">{siteConfig.tagline}</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-foreground-muted">
            {siteConfig.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/shop" size="lg">
              Browse the shop
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="outline">
              Talk to us
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section aria-labelledby="pillars-heading" className="pb-14 md:pb-20">
        <Container>
          <h2 id="pillars-heading" className="sr-only">
            What we are building
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <li key={pillar.title}>
                <Card as="article" interactive className="h-full pb-6">
                  <CardHeader>
                    <CardTitle>{pillar.title}</CardTitle>
                    <CardDescription>{pillar.description}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
