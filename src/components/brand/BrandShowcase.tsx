import { Wordmark } from "@/components/brand/Wordmark";
import { Badge } from "@/components/ui/Badge";
import { siteConfig } from "@/config/site";

/**
 * Decorative brand composition for the hero: an opaque card on a gradient
 * hairline, with soft orbs glowing past its edges. Purely visual — hidden from
 * assistive technology because everything it says is already in the hero copy.
 */
export function BrandShowcase() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-square w-full max-w-md select-none"
    >
      {/* Ambient glow, kept outside the card so the surface stays legible. */}
      <span className="animate-float-soft gradient-brand absolute -top-10 -left-8 size-44 rounded-full opacity-35 blur-3xl" />
      <span className="animate-float-soft gradient-accent absolute right-0 -bottom-12 size-52 rounded-full opacity-30 blur-3xl [animation-delay:2.5s]" />

      <div className="gradient-border absolute inset-4 flex flex-col justify-between rounded-3xl bg-surface p-7 shadow-floating">
        <div className="flex items-start justify-between gap-4">
          <Wordmark size="md" withMark={false} />
          <Badge variant="brand">Est. 2026</Badge>
        </div>

        <div className="flex flex-col gap-4">
          <span className="gradient-brand grid size-14 place-items-center rounded-2xl text-xl font-bold text-white shadow-glow-primary">
            Z
          </span>
          <p className="type-h3">{siteConfig.tagline}</p>
          <p className="type-caption text-foreground-muted">
            {siteConfig.shortDescription}
          </p>
        </div>

        {/* One glass strip, so the effect appears without flooding the page. */}
        <div className="glass flex flex-wrap gap-2 rounded-2xl p-3">
          <Badge variant="new">New</Badge>
          <Badge variant="trending">Trending</Badge>
          <Badge variant="bestseller">Best seller</Badge>
        </div>
      </div>
    </div>
  );
}
