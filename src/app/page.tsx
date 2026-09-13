import { BrandShowcase } from "@/components/brand/BrandShowcase";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";

/** Placeholder pillars — replaced by real merchandising in a later step. */
const pillars: ReadonlyArray<{
  icon: IconName;
  title: string;
  description: string;
}> = [
  {
    icon: "sparkle",
    title: "A curated edit",
    description:
      "A tight, design-led selection instead of an endless feed of listings.",
  },
  {
    icon: "truck",
    title: "Worldwide delivery",
    description:
      "Partner warehouses on three continents keep transit times short.",
  },
  {
    icon: "shield",
    title: "Buyer protection",
    description:
      "Every order is tracked end to end and covered by a 30-day return window.",
  },
];

/** Placeholder proof points until real numbers exist. */
const stats = [
  { label: "Countries served", value: "48" },
  { label: "Partner warehouses", value: "12" },
  { label: "Average dispatch", value: "24h" },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="gradient-hero relative overflow-hidden">
        <div
          aria-hidden="true"
          className="animate-float-soft pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand-highlight-soft blur-3xl"
        />
        <Container className="relative grid items-center gap-16 py-20 md:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          <div className="flex flex-col items-start gap-7">
            <Badge variant="gradient" className="animate-fade-down">
              Foundation · Step 2
            </Badge>

            <h1 className="type-display max-w-4xl animate-fade-up">
              <span className="block text-foreground">Discover. Choose.</span>
              {/* `w-fit` keeps the gradient box on the word, so the full
                blue -> violet -> magenta travel is visible. */}
            <span className="block w-fit text-gradient-brand">Enjoy.</span>
            </h1>

            <p className="type-body-lg max-w-2xl animate-fade-up text-foreground-muted [animation-delay:80ms]">
              {siteConfig.description}
            </p>

            <div className="flex animate-fade-up flex-col gap-3 xs:flex-row [animation-delay:140ms]">
              <ButtonLink href="/shop" size="lg" variant="gradient">
                Explore the edit
                <Icon name="arrowRight" className="size-4" strokeWidth={2} />
              </ButtonLink>
              <ButtonLink href="/contact" size="lg" variant="outline">
                Talk to us
              </ButtonLink>
            </div>

            <dl className="mt-4 grid w-full max-w-2xl grid-cols-3 gap-4 border-t border-border-subtle pt-8 sm:gap-8">
              {stats.map((stat) => (
                /* Reversed so the figures share a baseline when labels wrap. */
                <div
                key={stat.label}
                className="flex flex-col-reverse justify-end gap-1"
              >
                  <dt className="type-caption text-foreground-subtle">
                    {stat.label}
                  </dt>
                  <dd className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="hidden w-full animate-scale-in lg:block [animation-delay:200ms]">
            <BrandShowcase />
          </div>
        </Container>
      </section>

      <section aria-labelledby="pillars-heading" className="section-y">
        <Container className="flex flex-col gap-10">
          <div className="flex max-w-2xl flex-col gap-3">
            <span className="type-eyebrow text-brand-primary">
              Why {siteConfig.name}
            </span>
            <h2 id="pillars-heading" className="type-h2">
              Built for shoppers who expect more
            </h2>
          </div>

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <li key={pillar.title}>
                <Card as="article" interactive glow className="h-full">
                  <CardContent className="flex h-full flex-col gap-4">
                    <span className="grid size-11 place-items-center rounded-xl bg-brand-primary-soft text-brand-primary">
                      <Icon name={pillar.icon} />
                    </span>
                    <CardTitle>{pillar.title}</CardTitle>
                    <CardDescription>{pillar.description}</CardDescription>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <Card
            variant="gradient"
            className="gradient-surface overflow-hidden p-8 md:p-12"
          >
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex max-w-xl flex-col gap-3">
                <Badge variant="limited" dot>
                  Launching soon
                </Badge>
                <h2 className="type-h2">The storefront opens shortly</h2>
                <p className="text-foreground-muted">
                  The catalogue, cart and checkout arrive in the next steps.
                  Until then, this is the design foundation everything is built
                  on.
                </p>
              </div>
              <ButtonLink href="/shop" size="lg" className="shrink-0">
                Preview the shop
                <Icon name="arrowRight" className="size-4" strokeWidth={2} />
              </ButtonLink>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
