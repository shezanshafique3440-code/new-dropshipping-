import type { Metadata } from "next";

import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { products } from "@/data/mock-storefront";
import { filterProducts, parseFilters, type RawSearchParams } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Explore curated products, trending finds, and everyday essentials at ZYVERO.",
  alternates: { canonical: "/shop" },
};

export interface ShopPageProps {
  searchParams: Promise<RawSearchParams>;
}

/**
 * Catalogue route.
 *
 * The server parses the query string so the first paint already reflects a
 * shared or refreshed URL; `ShopCatalog` then owns the state client-side.
 */
export default async function ShopPage({ searchParams }: ShopPageProps) {
  const filters = parseFilters(await searchParams);
  const matching = filterProducts(filters).length;

  return (
    <>
      <div className="gradient-hero border-b border-border-subtle">
        <Container className="flex flex-col items-start gap-5 py-14 md:py-16">
          <Badge variant="brand">The ZYVERO Edit</Badge>
          <h1 className="type-h1 max-w-2xl">Discover Your Next Favorite.</h1>
          <p className="type-body-lg max-w-2xl text-foreground-muted">
            Explore curated tech, lifestyle, home, beauty, and everyday
            essentials.
          </p>
          <p className="type-caption text-foreground-subtle">
            {matching} of {products.length} products
            {matching === products.length ? "" : " match your filters"} · demo
            catalogue, nothing is stocked yet
          </p>
        </Container>
      </div>

      <ShopCatalog products={products} initialFilters={filters} />
    </>
  );
}
