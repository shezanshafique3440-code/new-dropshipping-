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

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  locale: string;
  currency: CurrencyConfig;
  contact: ContactConfig;
  nav: {
    main: readonly NavItem[];
    footer: readonly NavGroup[];
    legal: readonly NavItem[];
  };
  social: readonly SocialLink[];
}
