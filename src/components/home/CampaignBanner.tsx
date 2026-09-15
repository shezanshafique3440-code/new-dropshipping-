import { ProductArtwork } from "@/components/product/ProductArtwork";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/types";



/**
 * Editorial campaign break between the two halves of the page.
 *
 * The panel is pinned to the dark theme with `data-theme="dark"`, so every
 * token inside — surfaces, glass, artwork tints, borders — resolves to its
 * dark value even while the rest of the page is light. That keeps the section
 * consistent without hard-coding a second palette.
 */
export interface CampaignBannerProps {
  /** Published products for the collage; missing tiles simply do not render. */
  products: readonly Product[];
  /** Everything published, counted by the database. */
  productCount: number;
  /** Categories that actually hold a published product. */
  categoryCount: number;
}

export function CampaignBanner({
  products,
  productCount,
  categoryCount,
}: CampaignBannerProps) {
  const [, lamp, backpack, speaker] = products;

  // Counted, not claimed: the figures under the campaign copy are the real
  // size of the published catalogue.
  const stats = [
    { label: "Pieces in the edit", value: String(productCount) },
    { label: "Categories", value: String(categoryCount) },
    { label: "Restocked", value: "Weekly" },
  ] as const;

  return (
    <section aria-labelledby="campaign-heading" className="section-y-sm">
      <Container>
        <div
          data-theme="dark"
          className="reveal relative isolate overflow-hidden rounded-3xl bg-background text-foreground shadow-floating"
        >
          {/* Campaign backdrop: mesh glow over the deep navy ground. */}
          <span
            aria-hidden="true"
            className="gradient-hero pointer-events-none absolute inset-0 opacity-95"
          />
          <span
            aria-hidden="true"
            className="animate-float-soft pointer-events-none absolute -top-16 right-1/3 size-52 rounded-full border border-white/12"
          />
          <span
            aria-hidden="true"
            className="animate-float-soft pointer-events-none absolute -bottom-24 left-8 size-64 rounded-full border border-white/8 [animation-delay:2s]"
          />

          <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center lg:gap-14 lg:p-14">
            <div className="flex flex-col items-start gap-5">
              <Badge variant="glass">The Weekend Edit</Badge>

              <h2 id="campaign-heading" className="type-h1 max-w-lg">
                Small Upgrades.
                <span className="block text-foreground-subtle">
                  Big Difference.
                </span>
              </h2>

              <p className="max-w-md text-base leading-relaxed text-foreground-muted">
                Discover smart, stylish finds designed to make everyday life
                feel a little better.
              </p>

              <ButtonLink href="/shop" size="lg" variant="inverse">
                Explore the Collection
                <Icon name="arrowRight" className="size-4" strokeWidth={2} />
              </ButtonLink>

              <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col-reverse gap-1">
                    <dt className="type-caption text-foreground-subtle">
                      {stat.label}
                    </dt>
                    <dd className="text-xl font-bold tracking-tight">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Layered product tiles. Decorative — the copy carries the story. */}
            <div
              aria-hidden="true"
              className="relative mx-auto w-full max-w-sm"
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="animate-float-soft flex flex-col gap-3 pt-6 sm:gap-4 sm:pt-10">
                  {lamp ? (
                    <Card variant="glass" className="overflow-hidden">
                      <ProductArtwork
                        art={lamp.art}
                        tone={lamp.tone}
                        ratio="square"
                      />
                    </Card>
                  ) : null}
                  {speaker ? (
                    <Card variant="glass" className="overflow-hidden">
                      <ProductArtwork
                        art={speaker.art}
                        tone={speaker.tone}
                        ratio="square"
                      />
                    </Card>
                  ) : null}
                </div>
                <div className="animate-float-soft [animation-delay:2.5s]">
                  {backpack ? (
                    <Card variant="glass" className="overflow-hidden">
                      <ProductArtwork
                        art={backpack.art}
                        tone={backpack.tone}
                        ratio="portrait"
                      />
                    </Card>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
