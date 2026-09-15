import type { NextConfig } from "next";

/**
 * Which image sources the optimiser will load.
 *
 * `next/image` proxies whatever it is pointed at, so this list is a security
 * boundary, not a convenience: an allow-all here turns the storefront into an
 * open image proxy for the whole internet — anybody can make this origin fetch
 * and cache an arbitrary URL, at this deployment's expense and under this
 * deployment's name. So there is no wildcard hostname, no `**` pathname and no
 * `dangerouslyAllowSVG`.
 *
 * The default deployment needs none of this: images live in `public/products`
 * and are same-origin. `localPatterns` narrows even that, so a bug that put a
 * user-controlled path into an <Image src> could still only reach the media
 * folder.
 *
 * A remote host is allowed only when `MEDIA_PUBLIC_BASE_URL` names one, and
 * then only that exact host, over https, under that exact path prefix — the
 * same value `src/server/media/storage.ts` builds URLs from, read once here so
 * the two cannot drift.
 */
function remotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const base = process.env.MEDIA_PUBLIC_BASE_URL?.trim();
  if (!base) return [];

  let url: URL;
  try {
    url = new URL(base.endsWith("/") ? base : `${base}/`);
  } catch {
    throw new Error("MEDIA_PUBLIC_BASE_URL is not a valid absolute URL.");
  }
  if (url.protocol !== "https:") {
    throw new Error("MEDIA_PUBLIC_BASE_URL must be an https URL.");
  }
  if (url.hostname.includes("*")) {
    throw new Error("MEDIA_PUBLIC_BASE_URL must name one host, not a wildcard.");
  }

  return [
    {
      protocol: "https",
      hostname: url.hostname,
      // Only the prefix the media driver actually writes under.
      pathname: `${url.pathname.replace(/\/$/, "")}/products/**`,
      ...(url.port ? { port: url.port } : {}),
    },
  ];
}

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP second, and the original as the last resort. The source
    // renders are already WebP, so this mostly buys AVIF for browsers that
    // take it.
    formats: ["image/avif", "image/webp"],
    // The widths the storefront's `sizes` values actually ask for. A shorter
    // list means fewer variants to generate and cache.
    deviceSizes: [360, 414, 640, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    // Same-origin images may only come from the media folder.
    localPatterns: [{ pathname: "/products/**", search: "" }],
    remotePatterns: remotePatterns(),
    // An SVG the optimiser serves back is a script the browser will run on
    // this origin. The catalogue's images are raster; this stays off.
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    // Optimised variants are immutable — the key includes the source URL and
    // the transform — so a long TTL costs nothing and saves the work.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
