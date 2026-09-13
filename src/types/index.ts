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

export interface ShippingConfig {
  /** The storefront's stated free-delivery threshold, in major units. */
  freeThreshold: number;
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
  shipping: ShippingConfig;
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
export const PRODUCT_ART_KEYS = [
  "headphones",
  "speaker",
  "keyboard",
  "chargingDock",
  "projector",
  "earbuds",
  "powerBank",
  "lamp",
  "diffuser",
  "deskLight",
  "deskOrganizer",
  "humidifier",
  "mug",
  "backpack",
  "slingBag",
  "travelOrganizer",
  "crossbody",
  "sportBottle",
  "facialSteamer",
  "mirror",
  "iceRoller",
  "facialTool",
  "skincare",
  "watch",
  "sunglasses",
  "wallet",
  "phoneStand",
  "keyOrganizer",
  "cardHolder",
  "bottle",
  "storageBox",
  "multiTool",
  // Not a product: used by the empty-cart illustration.
  "bag",
] as const;

export type ProductArtKey = (typeof PRODUCT_ART_KEYS)[number];

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
export const ART_TONES = [
  "violet",
  "blue",
  "cyan",
  "magenta",
  "neutral",
] as const;

export type ArtTone = (typeof ART_TONES)[number];

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

/* -------------------------------------------------------------------------
 * Cart
 * ---------------------------------------------------------------------- */

/**
 * A line in the cart.
 *
 * Carries a snapshot of the product so the cart renders without re-reading the
 * catalogue, and so a persisted cart survives a catalogue change. Lines are
 * reconciled against the catalogue on load — see `@/lib/cart`.
 */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  category: ProductCategory;
  /** Unit price in major currency units. */
  price: number;
  /** Always a positive integer within the per-line maximum. */
  quantity: number;
  art: ProductArtKey;
  tone: ArtTone;
  badge?: ProductBadge;
}

export interface CartState {
  items: readonly CartItem[];
  /**
   * False until the persisted cart has been read in the browser. Server and
   * first client render share the same empty state, so nothing can mismatch.
   */
  hydrated: boolean;
}

/* -------------------------------------------------------------------------
 * Checkout
 *
 * Payment is taken by Stripe Checkout on Stripe's own hosted page, so no card
 * data ever reaches this application. Customer details live in component state
 * for the length of the session and are never persisted client-side — see
 * `CheckoutShell`. What was actually paid for is modelled by `Order` below,
 * which only ever comes into existence server-side after Stripe confirms.
 * ---------------------------------------------------------------------- */

export const CHECKOUT_STEP_IDS = [
  "information",
  "delivery",
  "payment",
  "review",
] as const;

export type CheckoutStepId = (typeof CHECKOUT_STEP_IDS)[number];

export interface CheckoutStep {
  id: CheckoutStepId;
  /** Shown in the progress indicator. */
  label: string;
  /** Page heading for the step. */
  title: string;
  description: string;
}

export interface CustomerInformation {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ShippingAddress {
  /** ISO 3166-1 alpha-2 code, matching `@/data/countries`. */
  country: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  postalCode: string;
  phone: string;
}

/** A delivery option. Rates arrive with the fulfilment integration. */
export interface DeliveryOption {
  id: string;
  name: string;
  /** What the shopper can expect, without promising a date. */
  description: string;
  /** Why no price is shown yet. */
  note: string;
}

/**
 * Whether payments are live, in Stripe's test mode, or unavailable.
 * Resolved on the server and passed down; no key ever crosses the boundary.
 */
export type PaymentMode = "test" | "live" | "unconfigured";

/** One accepted payment method, listed on the payment step. */
export interface PaymentMethodSummary {
  id: string;
  name: string;
  description: string;
  icon: IconName;
}

/**
 * Where the checkout has got to.
 *
 * `redirecting` covers the window between asking the server for a Stripe
 * Checkout Session and the browser leaving for Stripe; `error` carries a
 * message that is safe to show (never a Stripe or server internal).
 */
export type CheckoutOutcome =
  | { kind: "editing" }
  | { kind: "redirecting" }
  | { kind: "error"; message: string };

export interface CheckoutState {
  step: CheckoutStepId;
  /** Steps the shopper has completed, so they can be revisited. */
  furthest: CheckoutStepId;
  information: CustomerInformation;
  address: ShippingAddress;
  deliveryOptionId: string;
  outcome: CheckoutOutcome;
}

/* -------------------------------------------------------------------------
 * Orders
 *
 * An order exists only once Stripe has confirmed the money moved. Every
 * amount is an integer number of minor currency units (cents for USD) so no
 * float ever touches a total. Nothing here holds card data: Stripe collects
 * and stores the payment credentials, and this app keeps only the identifiers
 * needed to reconcile with it.
 * ---------------------------------------------------------------------- */

export const ORDER_STATUSES = ["pending", "paid", "cancelled", "failed"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_PAYMENT_STATUSES = [
  "unpaid",
  "paid",
  "failed",
  "refunded",
] as const;

export type OrderPaymentStatus = (typeof ORDER_PAYMENT_STATUSES)[number];

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
  /** Unit price in minor units, as charged. */
  unitAmount: number;
  /** `unitAmount * quantity`, never recomputed from a float price. */
  lineAmount: number;
}

export interface OrderCustomer {
  email: string;
  name: string;
}

/** Delivery address as confirmed at payment time. */
export interface OrderShippingAddress {
  name: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  /** ISO 3166-1 alpha-2. */
  country: string;
}

export interface Order {
  /** Internal id. Never shown to the customer. */
  id: string;
  /** Customer-facing reference, e.g. `ZYV-7Q4K2M`. */
  reference: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  /** ISO 4217, lowercase to match Stripe. */
  currency: string;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  customer: OrderCustomer;
  shippingAddress: OrderShippingAddress | null;
  items: readonly OrderItem[];
  deliveryOptionId: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Field-keyed validation messages. Empty means the step is valid. */
export type FieldErrors<TField extends string> = Partial<
  Record<TField, string>
>;

export type InformationField = keyof CustomerInformation;
export type AddressField = keyof ShippingAddress;

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
