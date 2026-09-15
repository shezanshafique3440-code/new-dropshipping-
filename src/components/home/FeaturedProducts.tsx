import { SectionHeading } from "@/components/home/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Product } from "@/types";

export interface FeaturedProductsProps {
  /** Published products flagged `featured`, read from the database. */
  products: readonly Product[];
}

/**
 * First product grid: the products an operator marked as featured.
 *
 * Nothing is rendered when none are — an empty grid under a heading reads as
 * a broken page, and inventing filler would be worse.
 */
export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="featured-heading" className="section-y">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          id="featured-heading"
          eyebrow="Curated for you"
          title="Featured Finds"
          description="Fresh picks selected to make your next discovery a little easier."
          className="reveal"
          action={
            <ButtonLink href="/shop" variant="outline">
              Browse all
            </ButtonLink>
          }
        />

        <ul className="reveal-stagger grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id} className="flex">
              <ProductCard product={product} className="w-full" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
