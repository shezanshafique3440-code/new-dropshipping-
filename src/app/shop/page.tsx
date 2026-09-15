import type { Metadata } from "next";

import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { filterProducts, parseFilters, type RawSearchParams } from "@/lib/catalog";
import { getPriceBounds, listCatalogue } from "@/server/catalog/service";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Explore curated products, trending finds, and everyday essentials at ZYVERO.",
  alternates: { canonical: "/shop" },
};

/**
 * Rendered per request.
 *
 * The catalogue is a database table now, so the page reflects what an
 * operator published a moment ago rather than what was true at build time.
 */
export const dynamic = "force-dynamic";

export interface ShopPageProps {
  searchParams: Promise<RawSearchParams>;
}

/**
 * Catalogue route.
 *
 * Two queries: the published products, and the price range the filter spans.
 * Drafts and archived products are excluded by the query itself, so nothing
 * unpublished can reach the browser even as data.
 *
 * The server parses the query string so the first paint already reflects a
 * shared or refreshed URL; `ShopCatalog` then owns the state client-side.
 */
export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [products, bounds, params] = await Promise.all([
    listCatalogue(),
    getPriceBounds(),
    searchParams,
  ]);

  const filters = parseFilters(params, bounds);
  const matching = filterProducts(filters, products).length;

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

      <ShopCatalog
        products={products}
        initialFilters={filters}
        priceBounds={bounds}
      />
    </>
  );
}
