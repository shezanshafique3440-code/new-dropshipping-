import { SectionHeading } from "@/components/home/SectionHeading";
import { ProductArtwork } from "@/components/product/ProductArtwork";
import { Container } from "@/components/ui/Container";
import { communityTiles } from "@/data/mock-storefront";
import { cn } from "@/lib/utils";

/** Grid spans per tile, keyed by position in `communityTiles`. */
const mosaicSpans = [
  "lg:col-span-2 lg:row-span-2",
  "",
  "",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
] as const;

/**
 * Community mosaic. The tiles are illustrative artwork for the demo, not real
 * social posts, and are labelled as inspiration rather than user content.
 */
export function CommunityShowcase() {
  return (
    <section aria-labelledby="community-heading" className="section-y">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          id="community-heading"
          eyebrow="ZYVERO community"
          title="See What's Trending"
          description="A look at how the edit comes together — illustrative styling for this preview."
          className="reveal"
        />

        <ul className="reveal grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {communityTiles.map((tile, index) => (
            <li
              key={tile.id}
              className={cn(
                "hover-lift hover-zoom group relative isolate overflow-hidden rounded-2xl border border-border",
                // Mosaic spans, sized so every cell of the 4-column grid fills:
                // one tall hero tile, two small, then three double-width rows.
                mosaicSpans[index],
              )}
            >
              <ProductArtwork
                art={tile.art}
                tone={tile.tone}
                ratio={index === 0 ? "square" : "wide"}
                className="size-full"
              />

              <span
                aria-hidden="true"
                className="scrim-dark absolute inset-0"
              />

              <span className="absolute inset-x-3 bottom-3 flex flex-col gap-1 text-white sm:inset-x-4 sm:bottom-4">
                <span className="type-caption font-semibold">
                  {tile.caption}
                </span>
                <span className="type-caption flex flex-wrap items-center gap-x-2 text-white/70">
                  <span>{tile.handle}</span>
                  <span aria-hidden="true">·</span>
                  <span>{tile.tag}</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
