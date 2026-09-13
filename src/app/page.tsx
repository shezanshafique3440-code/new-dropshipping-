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
 * Homepage.
 *
 * Every section is a server component; only the favourite toggle, the mobile
 * drawer and the newsletter form ship JavaScript. Content comes from
 * `@/data/mock-storefront`, which is demo data — see that file.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <FeaturedProducts />
      <CategoryShowcase />
      <BestSellers />
      <CampaignBanner />
      <WhyZyvero />
      <CommunityShowcase />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
