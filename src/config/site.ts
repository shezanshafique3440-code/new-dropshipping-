import { env } from "@/lib/env";
import type { SiteConfig } from "@/types";

/**
 * Single source of truth for storefront identity, navigation and contact
 * details. Nothing in the UI should hard-code these values.
 */
export const siteConfig: SiteConfig = {
  name: env.storeName ?? "Aurelia",
  tagline: "Curated goods, delivered worldwide",
  description:
    "Aurelia is a modern dropshipping storefront for design-led essentials — curated collections, fast worldwide delivery and a checkout that stays out of your way.",
  url: env.siteUrl,
  locale: "en-US",
  currency: {
    code: env.currencyCode ?? "USD",
    locale: "en-US",
  },
  contact: {
    email: "support@example.com",
    phone: "+1 (000) 000-0000",
    address: "Remote-first — we ship from partner warehouses worldwide.",
  },
  nav: {
    main: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Cart", href: "/cart" },
      { label: "Account", href: "/account" },
      { label: "Contact", href: "/contact" },
    ],
    footer: [
      {
        title: "Shop",
        items: [
          { label: "All products", href: "/shop" },
          { label: "Cart", href: "/cart" },
        ],
      },
      {
        title: "Account",
        items: [
          { label: "Your account", href: "/account" },
          { label: "Orders", href: "/account" },
        ],
      },
      {
        title: "Support",
        items: [
          { label: "Contact us", href: "/contact" },
          { label: "Shipping & returns", href: "/contact" },
        ],
      },
    ],
    legal: [
      { label: "Privacy", href: "/contact" },
      { label: "Terms", href: "/contact" },
    ],
  },
  social: [
    { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
    { label: "TikTok", href: "https://tiktok.com", icon: "tiktok" },
    { label: "X", href: "https://x.com", icon: "x" },
    { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
  ],
};
