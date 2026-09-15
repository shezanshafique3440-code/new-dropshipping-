import { SectionHeading } from "@/components/home/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/types";

export interface BestSellersProps {
  /** Published best sellers, read from the database. */
  products: readonly Product[];
}

/**
 * Second product grid, with demo rating figures.
 * The ratings are placeholder numbers, not verified customer reviews.
 */
export function BestSellers({ products }: BestSellersProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="best-sellers-heading" className="section-y">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          id="best-sellers-heading"
          eyebrow="Community favourites"
          title="Best Sellers"
          description="The pieces people keep coming back for, across every category."
          className="reveal"
        />

        <ul className="reveal-stagger grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-6">
          {products.map((product) => (
            <li key={product.id} className="flex">
              <ProductCard product={product} showRating className="w-full" />
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-3">
          <ButtonLink href="/shop" size="lg">
            View All Products
            <Icon name="arrowRight" className="size-4" strokeWidth={2} />
          </ButtonLink>
          <p className="type-caption text-foreground-subtle">
            Ratings shown are placeholder figures for this preview.
          </p>
        </div>
      </Container>
    </section>
  );
}
