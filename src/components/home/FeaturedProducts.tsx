import { SectionHeading } from "@/components/home/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { featuredProducts } from "@/data/mock-storefront";

/** First product grid: four hand-picked demo products. */
export function FeaturedProducts() {
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
          {featuredProducts.map((product) => (
            <li key={product.id} className="flex">
              <ProductCard product={product} className="w-full" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
