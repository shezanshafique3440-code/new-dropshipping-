import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductPurchasePanel } from "@/components/cart/ProductPurchasePanel";
import { ProductArtwork } from "@/components/product/ProductArtwork";
import { ProductCard } from "@/components/product/ProductCard";
import { Rating } from "@/components/product/Rating";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getRelatedProducts, productHref } from "@/lib/catalog";
import {
  findPublishedProduct,
  listCatalogue,
} from "@/server/catalog/service";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/config/site";
import type { ProductBadgeTone } from "@/types";

const badgeVariants: Record<ProductBadgeTone, BadgeVariant> = {
  new: "new",
  trending: "trending",
  bestseller: "bestseller",
  popular: "brand",
  sale: "sale",
};

/** Shipping and service notes. Placeholder copy for the preview store. */
const infoCards: ReadonlyArray<{
  icon: IconName;
  title: string;
  detail: string;
}> = [
  {
    icon: "truck",
    title: "Worldwide delivery",
    detail: "Dispatched from the nearest partner hub.",
  },
  {
    icon: "refresh",
    title: "30-day returns",
    detail: "Unused items, in their original packaging.",
  },
  {
    icon: "shield",
    title: "Buyer protection",
    detail: "Every order tracked from dispatch to door.",
  },
];

/**
 * Rendered per request.
 *
 * The catalogue used to be known at build time, so these pages were
 * prerendered with `generateStaticParams` and `dynamicParams = false`, which
 * made an unknown slug a real 404. It is a database table now: an operator
 * can publish a product, change a price or archive something at any moment,
 * and a page built an hour ago would be wrong about all three.
 *
 * The trade-off is the status code. Next begins streaming before this page
 * has finished, so `notFound()` renders the not-found UI inside a response
 * that has already committed a 200 — a soft 404. Next injects
 * `<meta name="robots" content="noindex">` with it, which is what keeps it
 * out of search results, and no product data is rendered either way. See the
 * framework's own note under `notFound()` → Status codes.
 */
export const dynamic = "force-dynamic";

export interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await findPublishedProduct(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  const title = `${product.name} | ${siteConfig.name}`;
  return {
    title: { absolute: title },
    description: product.description,
    alternates: { canonical: productHref(product.slug) },
    openGraph: {
      title,
      description: product.description,
      type: "website",
      url: `${siteConfig.url}${productHref(product.slug)}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  // Published only. A draft, an archived product and a slug that never
  // existed are one answer — a 404 — so the panel's unfinished work is not
  // discoverable by guessing a URL.
  const product = await findPublishedProduct(slug);

  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(product, await listCatalogue());
  const discount =
    product.compareAtPrice === undefined
      ? undefined
      : Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        );

  return (
    <>
      <div className="border-b border-border-subtle bg-surface">
        <Container className="py-4">
          <nav aria-label="Breadcrumb">
            <ol className="type-caption flex flex-wrap items-center gap-x-2 gap-y-1 text-foreground-subtle">
              <li>
                <Link href="/" className="link-underline hover:text-foreground">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href="/shop"
                  className="link-underline hover:text-foreground"
                >
                  Shop
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/shop?category=${encodeURIComponent(product.category)}`}
                  className="link-underline hover:text-foreground"
                >
                  {product.category}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-foreground">
                {product.name}
              </li>
            </ol>
          </nav>
        </Container>
      </div>

      <section className="section-y-sm">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Visual */}
          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-card">
              <ProductArtwork
                art={product.art}
                tone={product.tone}
                ratio="square"
                glyph="large"
                zoom={false}
              />
              <span className="absolute inset-x-4 top-4 flex flex-wrap gap-2">
                {product.badge ? (
                  <Badge variant={badgeVariants[product.badge.tone]}>
                    {product.badge.label}
                  </Badge>
                ) : null}
                {discount === undefined ? null : (
                  <Badge variant="sale">{`-${discount}%`}</Badge>
                )}
              </span>
            </div>

            {/* Alternate tints stand in for a gallery until photography exists. */}
            <ul aria-hidden="true" className="grid grid-cols-3 gap-3">
              {(["violet", "cyan", "neutral"] as const).map((tone) => (
                <li key={tone}>
                  <div className="overflow-hidden rounded-2xl border border-border-subtle">
                    <ProductArtwork
                      art={product.art}
                      tone={tone}
                      ratio="square"
                      zoom={false}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="type-eyebrow text-brand-primary">
                {product.category}
              </p>
              <h1 className="type-h1">{product.name}</h1>
              {product.rating ? (
                <span className="flex flex-wrap items-center gap-2">
                  <Rating
                    value={product.rating.value}
                    count={product.rating.count}
                  />
                  <span className="type-caption text-foreground-subtle">
                    · sample figures for this preview
                  </span>
                </span>
              ) : null}
            </div>

            <p className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice === undefined ? null : (
                <span className="text-base text-foreground-subtle line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </p>

            <p className="type-body-lg text-foreground-muted">
              {product.description}
            </p>

            <ul className="flex flex-col gap-2.5">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-primary-soft text-brand-primary"
                  >
                    <Icon name="check" className="size-3" strokeWidth={3} />
                  </span>
                  <span className="text-foreground-muted">{feature}</span>
                </li>
              ))}
            </ul>

            <ProductPurchasePanel product={product} />

            <ul className="grid gap-3 sm:grid-cols-3">
              {infoCards.map((info) => (
                <li key={info.title} className="flex">
                  <Card variant="muted" className="w-full">
                    <CardContent className="flex flex-col gap-2 p-4">
                      <span className="grid size-8 place-items-center rounded-lg bg-surface text-brand-primary">
                        <Icon name={info.icon} className="size-4" />
                      </span>
                      <span className="text-sm font-semibold">
                        {info.title}
                      </span>
                      <span className="type-caption text-foreground-muted">
                        {info.detail}
                      </span>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="related-heading"
        className="section-y border-t border-border-subtle bg-surface"
      >
        <Container className="flex flex-col gap-8">
          <h2 id="related-heading" className="type-h2">
            You May Also Like
          </h2>
          <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id} className="flex">
                <ProductCard product={item} showRating className="w-full" />
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
