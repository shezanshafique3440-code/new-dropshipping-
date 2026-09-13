/**
 * Shared application types.
 *
 * Kept intentionally small: domain types (products, orders, customers) are
 * introduced in later steps alongside the features that need them.
 */

/** A single navigation entry used by the header, footer and mobile menu. */
export interface NavItem {
  label: string;
  href: string;
  /** Marks links that leave the storefront (rendered with rel/target). */
  external?: boolean;
}

/** A grouped set of navigation entries, e.g. one footer column. */
export interface NavGroup {
  title: string;
  items: readonly NavItem[];
}

/** Social profile placeholder — real URLs are filled in per deployment. */
export interface SocialLink {
  label: string;
  href: string;
  /** Key of the inline icon rendered for this profile. */
  icon: SocialIconName;
}

export type SocialIconName = "instagram" | "tiktok" | "x" | "youtube";

/** Currency formatting settings for the whole storefront. */
export interface CurrencyConfig {
  /** ISO 4217 code, e.g. "USD". */
  code: string;
  /** BCP 47 locale used by `Intl.NumberFormat`. */
  locale: string;
}

export interface ContactConfig {
  email: string;
  phone: string;
  address: string;
}

/** Promo strip above the header. */
export interface AnnouncementConfig {
  /** Copy for the strip. `{amount}` is replaced with the formatted threshold. */
  message: string;
  /** Value substituted into `{amount}`, in major currency units. */
  amount?: number;
  /** Optional call to action rendered at the end of the strip. */
  cta?: NavItem;
}

export interface NewsletterConfig {
  title: string;
  description: string;
  /** Shown under the field while sign-up is not yet wired up. */
  note: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  /** One-line brand summary used in the footer and compact contexts. */
  shortDescription: string;
  url: string;
  locale: string;
  currency: CurrencyConfig;
  contact: ContactConfig;
  announcement: AnnouncementConfig;
  newsletter: NewsletterConfig;
  nav: {
    main: readonly NavItem[];
    footer: readonly NavGroup[];
    legal: readonly NavItem[];
  };
  social: readonly SocialLink[];
}

/* -------------------------------------------------------------------------
 * Storefront content
 *
 * These describe the shapes the homepage renders. They are deliberately
 * transport-agnostic: today `src/data/mock-storefront.ts` supplies them, and a
 * database, CMS or supplier API can supply the same shapes later without any
 * component changing.
 * ---------------------------------------------------------------------- */

/** Key selecting one of the built-in SVG product illustrations. */
export type ProductArtKey =
  // Tech
  | "headphones"
  | "speaker"
  | "keyboard"
  | "chargingDock"
  | "projector"
  | "earbuds"
  | "powerBank"
  // Home
  | "lamp"
  | "diffuser"
  | "deskLight"
  | "deskOrganizer"
  | "humidifier"
  | "mug"
  // Lifestyle
  | "backpack"
  | "slingBag"
  | "travelOrganizer"
  | "crossbody"
  | "sportBottle"
  // Beauty
  | "facialSteamer"
  | "mirror"
  | "iceRoller"
  | "facialTool"
  | "skincare"
  // Accessories
  | "watch"
  | "sunglasses"
  | "wallet"
  | "phoneStand"
  | "keyOrganizer"
  | "cardHolder"
  // Everyday essentials
  | "bottle"
  | "storageBox"
  | "multiTool";

/** The catalogue's top-level categories. */
export const PRODUCT_CATEGORIES = [
  "Tech",
  "Home",
  "Lifestyle",
  "Beauty",
  "Accessories",
  "Everyday Essentials",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** Merchandising flags a shopper can filter by. */
export const PRODUCT_TAGS = ["bestSeller", "newArrival", "trending"] as const;

export type ProductTag = (typeof PRODUCT_TAGS)[number];

/** Colour family applied to generated artwork panels. */
export type ArtTone = "violet" | "blue" | "cyan" | "magenta" | "neutral";

/** Merchandising label shown on a product card. */
export type ProductBadgeTone =
  | "new"
  | "trending"
  | "bestseller"
  | "popular"
  | "sale";

export interface ProductBadge {
  label: string;
  tone: ProductBadgeTone;
}

/** Demo rating figures. Not verified customer data. */
export interface ProductRating {
  /** Average score out of 5. */
  value: number;
  /** Number of ratings behind the average. */
  count: number;
}

export interface Product {
  id: string;
  /** URL segment: `/shop/<slug>`. Unique across the catalogue. */
  slug: string;
  name: string;
  category: ProductCategory;
  /** One or two sentences, used on the detail page and by search. */
  description: string;
  /** Short selling points listed on the detail page. */
  features: readonly string[];
  price: number;
  /** Original price, shown struck through when present. */
  compareAtPrice?: number;
  badge?: ProductBadge;
  rating?: ProductRating;
  /** Merchandising flags, also used by the "Featured" sort. */
  tags: readonly ProductTag[];
  /** Hand-picked for the homepage and the default catalogue order. */
  featured?: boolean;
  /**
   * Catalogue position, newest first. A stand-in for `createdAt` until real
   * timestamps exist — lower numbers are more recently added.
   */
  addedRank: number;
  art: ProductArtKey;
  tone: ArtTone;
}

/** Sort orders offered by the catalogue toolbar. */
export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
  { value: "popular", label: "Most Popular" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

/** The complete catalogue query, mirrored in the URL. */
export interface CatalogFilters {
  query: string;
  category: ProductCategory | "all";
  tags: readonly ProductTag[];
  minPrice: number;
  maxPrice: number;
  sort: SortValue;
}

/** Key selecting one of the abstract category artworks. */
export type CategoryArtKey =
  | "orbit"
  | "waves"
  | "grid"
  | "bloom"
  | "prism"
  | "stack";

export interface Category {
  id: string;
  name: string;
  tagline: string;
  href: string;
  art: CategoryArtKey;
  tone: ArtTone;
  /** Demo count shown as a hint of catalogue depth. */
  itemCount: number;
}

/** A tile in the community mosaic. Illustrative, not a real social post. */
export interface CommunityTile {
  id: string;
  handle: string;
  tag: string;
  caption: string;
  art: ProductArtKey;
  tone: ArtTone;
}

/** Demo testimonial. Replaced by real reviews in a later step. */
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  location: string;
  rating: number;
  /** Initials shown in the avatar placeholder. */
  initials: string;
}

/** A numbered value proposition in the "Shopping, Reimagined" section. */
export interface ValueProp {
  id: string;
  index: string;
  title: string;
  description: string;
  icon: IconName;
}

/** A compact promise in the trust strip below the hero. */
export interface TrustItem {
  id: string;
  label: string;
  detail: string;
  icon: IconName;
}

/** Re-exported so data files describe icons without importing components. */
export type IconName =
  | "search"
  | "user"
  | "bag"
  | "menu"
  | "close"
  | "arrowRight"
  | "sparkle"
  | "truck"
  | "shield"
  | "mail"
  | "heart"
  | "star"
  | "check"
  | "lock"
  | "globe"
  | "chat"
  | "layers"
  | "refresh"
  | "plus"
  | "minus";
