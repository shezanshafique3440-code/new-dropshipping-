import type { Metadata } from "next";

import { BestSellers } from "@/components/home/BestSellers";
import { CampaignBanner } from "@/components/home/CampaignBanner";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { CommunityShowcase } from "@/components/home/CommunityShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Hero } from "@/components/home/Hero";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { Testimonials } from "@/components/home/Testimonials";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WhyZyvero } from "@/components/home/WhyZyvero";
import { siteConfig } from "@/config/site";
import {
  countProductsByCategory,
  listBestsellingProducts,
  listCatalogue,
  listFeaturedProducts,
} from "@/server/catalog/service";

const title = `${siteConfig.name} — Discover What's Next`;
const description =
  "Discover trending products, everyday essentials, and unique finds at ZYVERO.";

export const metadata: Metadata = {
  // `absolute` opts out of the "%s — ZYVERO" template from the root layout.
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: siteConfig.url, type: "website" },
  twitter: { title, description },
};

/**
 * Rendered per request, because the catalogue is live data now: a product
 * published in the operations panel should appear here, not after the next
 * build.
 */
export const dynamic = "force-dynamic";

/** How many products each grid shows. */
const FEATURED_LIMIT = 4;
const BESTSELLER_LIMIT = 6;
const HERO_LIMIT = 3;

/**
 * Homepage.
 *
 * Every section is a server component; only the favourite toggle, the mobile
 * drawer and the newsletter form ship JavaScript.
 *
 * The products come from PostgreSQL — published only, and only the rows each
 * section renders. Four queries run in parallel rather than one read of the
 * whole catalogue, so a shop with a thousand products costs the homepage the
 * same as one with thirty. Testimonials, trust items and category taglines
 * are still presentation content from `@/data/mock-storefront`.
 */
export default async function HomePage() {
  const [featured, bestsellers, categoryCounts, catalogue] = await Promise.all([
    listFeaturedProducts(FEATURED_LIMIT),
    listBestsellingProducts(BESTSELLER_LIMIT),
    countProductsByCategory(),
    listCatalogue(),
  ]);

  // The hero shows whichever published products lead the catalogue, so it can
  // never point at something that has been unpublished.
  const heroProducts = catalogue.slice(0, HERO_LIMIT);
  const productCount = catalogue.length;
  const categoryCount = [...categoryCounts.values()].filter(
    (count) => count > 0,
  ).length;

  return (
    <>
      <Hero products={heroProducts} />
      <TrustStrip />
      <FeaturedProducts products={featured} />
      <CategoryShowcase counts={categoryCounts} />
      <BestSellers products={bestsellers} />
      <CampaignBanner
        products={featured.length > 0 ? featured : catalogue}
        productCount={productCount}
        categoryCount={categoryCount}
      />
      <WhyZyvero />
      <CommunityShowcase />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
