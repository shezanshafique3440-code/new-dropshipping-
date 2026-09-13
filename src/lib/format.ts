import { siteConfig } from "@/config/site";

/**
 * Formats an amount using the storefront currency.
 *
 * @param amount - Value in major units (e.g. 12.5 for $12.50).
 */
export function formatPrice(
  amount: number,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(siteConfig.currency.locale, {
    style: "currency",
    currency: siteConfig.currency.code,
    ...options,
  }).format(amount);
}

/** Formats a date using the storefront locale. */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  return new Intl.DateTimeFormat(siteConfig.locale, options).format(
    new Date(date),
  );
}
