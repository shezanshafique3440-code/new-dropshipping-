import Link from "next/link";

import { CategoryArtwork } from "@/components/home/CategoryArtwork";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { categories } from "@/data/mock-storefront";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

function CategoryCard({
  category,
  featured = false,
}: {
  category: Category;
  featured?: boolean;
}) {
  return (
    <Link
      href={category.href}
      className={cn(
        "hover-lift hover-zoom group relative isolate flex flex-col justify-end overflow-hidden rounded-2xl border border-border p-5 sm:p-6",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
        featured
          ? "min-h-64 sm:min-h-80 lg:min-h-full"
          : "min-h-40 sm:min-h-48",
      )}
    >
      <CategoryArtwork
        art={category.art}
        tone={category.tone}
        size={featured ? "featured" : "default"}
      />

      {/* Scrim keeps the label readable without hiding the artwork. */}
      <span aria-hidden="true" className="scrim-surface absolute inset-0" />

      <span className="relative flex items-end justify-between gap-4">
        <span className="min-w-0">
          <span
            className={cn(
              "block font-semibold tracking-tight",
              featured ? "type-h3" : "text-base",
            )}
          >
            {category.name}
          </span>
          <span className="type-caption mt-1 block text-foreground-muted">
            {category.tagline}
          </span>
          {featured ? (
            <span className="type-caption mt-3 block text-foreground-subtle">
              {category.itemCount} pieces
            </span>
          ) : null}
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-surface/80 text-foreground transition-[transform,border-color,color] duration-300 ease-[var(--ease-out-soft)] group-hover:-translate-y-0.5 group-hover:border-brand-primary group-hover:text-brand-primary">
          <Icon name="arrowRight" className="size-4" strokeWidth={2} />
        </span>
      </span>
    </Link>
  );
}

/**
 * Category grid with one tall featured tile and five supporting tiles, so the
 * section reads as an editorial layout rather than a uniform six-up grid.
 */
export function CategoryShowcase() {
  const [featured, ...rest] = categories;

  return (
    <section
      aria-labelledby="categories-heading"
      className="section-y border-y border-border-subtle bg-surface-muted/40"
    >
      <Container className="flex flex-col gap-10">
        <SectionHeading
          id="categories-heading"
          eyebrow="Explore"
          title="Shop by Vibe"
          description="Six ways into the catalogue, depending on the kind of day you are having."
          className="reveal"
        />

        <div className="reveal grid gap-4 sm:gap-5 lg:grid-cols-3">
          {featured ? (
            <div className="lg:row-span-2">
              <CategoryCard category={featured} featured />
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:col-span-2 lg:grid-cols-2">
            {rest.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
