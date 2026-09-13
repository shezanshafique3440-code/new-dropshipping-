/**
 * Typed access to public environment variables.
 *
 * Client-visible variables must be referenced as full `process.env.NEXT_PUBLIC_*`
 * literals so the Next.js compiler can inline them at build time.
 * Secrets are never read here — they belong in server-only modules added in
 * later steps, and never in the committed source.
 */

const DEFAULT_SITE_URL = "http://localhost:3000";

function readSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!raw) {
    return DEFAULT_SITE_URL;
  }

  try {
    // Normalises the value and fails fast on a malformed URL.
    return new URL(raw).origin;
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[env] NEXT_PUBLIC_SITE_URL is not a valid URL ("${raw}"), falling back to ${DEFAULT_SITE_URL}`,
      );
    }
    return DEFAULT_SITE_URL;
  }
}

export const env = {
  siteUrl: readSiteUrl(),
  storeName: process.env.NEXT_PUBLIC_STORE_NAME?.trim() || undefined,
  currencyCode: process.env.NEXT_PUBLIC_CURRENCY_CODE?.trim() || undefined,
  isProduction: process.env.NODE_ENV === "production",
} as const;
