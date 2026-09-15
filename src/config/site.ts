import { env } from "@/lib/env";
import type { SiteConfig } from "@/types";

/**
 * Single source of truth for storefront identity, navigation and contact
 * details. Nothing in the UI should hard-code these values.
 */
export const siteConfig: SiteConfig = {
  name: env.storeName ?? "ZYVERO",
  tagline: "Discover. Choose. Enjoy.",
  description:
    "ZYVERO is a modern international storefront for design-led essentials — a curated edit, fast worldwide delivery and a checkout that stays out of your way.",
  shortDescription:
    "A curated edit of design-led essentials, shipped worldwide.",
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
  shipping: {
    freeThreshold: 75,
  },
  media: {
    // The catalogue's imagery is drawn by this repository and rendered by
    // `scripts/generate-product-media.mjs`. It is not photography, and the
    // storefront says so rather than letting a shopper assume otherwise.
    disclosure:
      "Product visuals are ZYVERO studio renders, not photographs of the finished item.",
  },
  announcement: {
    message: "Free worldwide delivery on orders over {amount}",
    amount: 75,
    cta: { label: "See details", href: "/contact" },
  },
  newsletter: {
    title: "Join the ZYVERO list",
    description:
      "Early access to new drops, restocks and members-only pricing.",
    note: "Sign-ups open when the store launches.",
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
          { label: "New arrivals", href: "/shop" },
          { label: "Your cart", href: "/cart" },
        ],
      },
      {
        title: "Account",
        items: [
          { label: "Sign in", href: "/account" },
          { label: "Orders", href: "/account" },
          { label: "Preferences", href: "/account" },
        ],
      },
      {
        title: "Support",
        items: [
          { label: "Contact us", href: "/contact" },
          { label: "Shipping", href: "/contact" },
          { label: "Returns", href: "/contact" },
        ],
      },
    ],
    legal: [
      { label: "Privacy", href: "/contact" },
      { label: "Terms", href: "/contact" },
      { label: "Cookies", href: "/contact" },
    ],
  },
  social: [
    { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
    { label: "TikTok", href: "https://tiktok.com", icon: "tiktok" },
    { label: "X", href: "https://x.com", icon: "x" },
    { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
  ],
};
