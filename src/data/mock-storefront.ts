import type {
  Category,
  CommunityTile,
  Product,
  Testimonial,
  TrustItem,
  ValueProp,
} from "@/types";

/**
 * Demo storefront content.
 *
 * Everything here is fictional placeholder data used to build and review the
 * homepage. Products, prices, ratings and testimonials are NOT real. The
 * exported shapes match `@/types`, so a database, CMS or supplier feed can
 * replace this module later without touching a single component.
 */

/** Every product links here until product detail pages exist. */
const SHOP_HREF = "/shop";

export const featuredProducts: readonly Product[] = [
  {
    id: "aeropulse-headphones",
    name: "AeroPulse Wireless Headphones",
    category: "Tech",
    href: SHOP_HREF,
    price: 79.99,
    compareAtPrice: 99.99,
    badge: { label: "Popular", tone: "popular" },
    rating: { value: 4.8, count: 214 },
    art: "headphones",
    tone: "violet",
  },
  {
    id: "novaglow-lamp",
    name: "NovaGlow Ambient Lamp",
    category: "Home",
    href: SHOP_HREF,
    price: 44.99,
    badge: { label: "New", tone: "new" },
    rating: { value: 4.6, count: 96 },
    art: "lamp",
    tone: "magenta",
  },
  {
    id: "flexcore-backpack",
    name: "FlexCore Everyday Backpack",
    category: "Lifestyle",
    href: SHOP_HREF,
    price: 59.99,
    compareAtPrice: 74.99,
    badge: { label: "Best Seller", tone: "bestseller" },
    rating: { value: 4.9, count: 331 },
    art: "backpack",
    tone: "blue",
  },
  {
    id: "orbit-mini-speaker",
    name: "Orbit Mini Smart Speaker",
    category: "Tech",
    href: SHOP_HREF,
    price: 49.99,
    compareAtPrice: 64.99,
    badge: { label: "Trending", tone: "trending" },
    rating: { value: 4.7, count: 158 },
    art: "speaker",
    tone: "cyan",
  },
];

export const bestSellers: readonly Product[] = [
  {
    id: "pulse-active-watch",
    name: "Pulse Active Smartwatch",
    category: "Tech",
    href: SHOP_HREF,
    price: 129.0,
    compareAtPrice: 159.0,
    badge: { label: "Best Seller", tone: "bestseller" },
    rating: { value: 4.8, count: 402 },
    art: "watch",
    tone: "violet",
  },
  {
    id: "halo-hydration-bottle",
    name: "Halo Insulated Bottle",
    category: "Everyday Essentials",
    href: SHOP_HREF,
    price: 28.5,
    rating: { value: 4.7, count: 268 },
    art: "bottle",
    tone: "cyan",
  },
  {
    id: "verve-sunglasses",
    name: "Verve Polarised Sunglasses",
    category: "Accessories",
    href: SHOP_HREF,
    price: 64.0,
    compareAtPrice: 82.0,
    badge: { label: "Trending", tone: "trending" },
    rating: { value: 4.5, count: 143 },
    art: "sunglasses",
    tone: "magenta",
  },
  {
    id: "ember-ceramic-mug",
    name: "Ember Stoneware Mug Set",
    category: "Home",
    href: SHOP_HREF,
    price: 34.0,
    rating: { value: 4.6, count: 189 },
    art: "mug",
    tone: "neutral",
  },
  {
    id: "nimbus-skincare-set",
    name: "Nimbus Daily Skincare Set",
    category: "Beauty",
    href: SHOP_HREF,
    price: 52.0,
    compareAtPrice: 68.0,
    badge: { label: "New", tone: "new" },
    rating: { value: 4.4, count: 77 },
    art: "skincare",
    tone: "blue",
  },
  {
    id: "keystone-low-profile-keyboard",
    name: "Keystone Low-Profile Keyboard",
    category: "Tech",
    href: SHOP_HREF,
    price: 89.0,
    rating: { value: 4.9, count: 221 },
    art: "keyboard",
    tone: "violet",
  },
];

/** Products floating in the hero composition. */
export const heroProducts: readonly Product[] = [
  featuredProducts[0]!,
  featuredProducts[1]!,
  featuredProducts[3]!,
];

export const categories: readonly Category[] = [
  {
    id: "tech",
    name: "Tech",
    tagline: "Gear that keeps up with you",
    href: SHOP_HREF,
    art: "orbit",
    tone: "violet",
    itemCount: 48,
  },
  {
    id: "home",
    name: "Home",
    tagline: "Warm, considered living",
    href: SHOP_HREF,
    art: "waves",
    tone: "magenta",
    itemCount: 36,
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    tagline: "Made for the everyday",
    href: SHOP_HREF,
    art: "grid",
    tone: "blue",
    itemCount: 41,
  },
  {
    id: "beauty",
    name: "Beauty",
    tagline: "Simple rituals, real results",
    href: SHOP_HREF,
    art: "bloom",
    tone: "magenta",
    itemCount: 27,
  },
  {
    id: "accessories",
    name: "Accessories",
    tagline: "The finishing detail",
    href: SHOP_HREF,
    art: "prism",
    tone: "cyan",
    itemCount: 33,
  },
  {
    id: "everyday-essentials",
    name: "Everyday Essentials",
    tagline: "The things you reach for daily",
    href: SHOP_HREF,
    art: "stack",
    tone: "blue",
    itemCount: 52,
  },
];

export const trustItems: readonly TrustItem[] = [
  {
    id: "curated",
    label: "Curated products",
    detail: "Selected, not scraped",
    icon: "sparkle",
  },
  {
    id: "checkout",
    label: "Secure checkout",
    detail: "Encrypted end to end",
    icon: "lock",
  },
  {
    id: "shipping",
    label: "Fast global shipping",
    detail: "Partner hubs worldwide",
    icon: "globe",
  },
  {
    id: "support",
    label: "Easy support",
    detail: "Real people, quick replies",
    icon: "chat",
  },
];

export const valueProps: readonly ValueProp[] = [
  {
    id: "curated",
    index: "01",
    title: "Curated, Not Cluttered",
    description: "Less scrolling. Better discoveries.",
    icon: "sparkle",
  },
  {
    id: "impress",
    index: "02",
    title: "Made to Impress",
    description:
      "Products chosen for style, usefulness, and everyday appeal.",
    icon: "layers",
  },
  {
    id: "simple",
    index: "03",
    title: "Simple Experience",
    description:
      "From discovery to checkout, everything should feel effortless.",
    icon: "check",
  },
  {
    id: "fresh",
    index: "04",
    title: "Always Something New",
    description:
      "Fresh finds and new collections keep the experience moving.",
    icon: "refresh",
  },
];

export const communityTiles: readonly CommunityTile[] = [
  {
    id: "desk-setup",
    handle: "@zyvero",
    tag: "#ZYVERODesk",
    caption: "Desk reset, finally finished",
    art: "keyboard",
    tone: "violet",
  },
  {
    id: "morning-light",
    handle: "@zyvero",
    tag: "#ZYVEROHome",
    caption: "Morning light, warmer corners",
    art: "lamp",
    tone: "magenta",
  },
  {
    id: "commute",
    handle: "@zyvero",
    tag: "#ZYVERODaily",
    caption: "Packed for the long commute",
    art: "backpack",
    tone: "blue",
  },
  {
    id: "listening",
    handle: "@zyvero",
    tag: "#ZYVEROSound",
    caption: "Sunday listening session",
    art: "headphones",
    tone: "cyan",
  },
  {
    id: "slow-mornings",
    handle: "@zyvero",
    tag: "#ZYVEROHome",
    caption: "Slow mornings, good ceramics",
    art: "mug",
    tone: "neutral",
  },
  {
    id: "city-days",
    handle: "@zyvero",
    tag: "#ZYVEROStyle",
    caption: "City days in full sun",
    art: "sunglasses",
    tone: "magenta",
  },
];

export const testimonials: readonly Testimonial[] = [
  {
    id: "maya",
    quote: "Beautiful products, incredibly smooth experience.",
    author: "Maya R.",
    location: "Toronto",
    rating: 5,
    initials: "MR",
  },
  {
    id: "daniel",
    quote: "Found something I didn't even know I needed.",
    author: "Daniel K.",
    location: "Berlin",
    rating: 5,
    initials: "DK",
  },
  {
    id: "sofia",
    quote: "The whole store feels different from the usual shopping sites.",
    author: "Sofia M.",
    location: "Lisbon",
    rating: 4,
    initials: "SM",
  },
];
