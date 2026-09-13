import type { ReactElement } from "react";

import { cn } from "@/lib/utils";
import type { ArtTone, ProductArtKey } from "@/types";

/**
 * Generated product illustrations.
 *
 * Real photography arrives with the catalogue; until then each product is
 * drawn as a geometric SVG on a tinted panel. Nothing is fetched, so there are
 * no external requests, no layout shift and no missing-asset states.
 *
 * Every glyph is drawn on a 120×120 grid and inherits `currentColor`.
 */
const glyphs: Record<ProductArtKey, ReactElement> = {
  headphones: (
    <>
      <path d="M26 70V58a34 34 0 0 1 68 0v12" />
      <rect
        x="16"
        y="66"
        width="20"
        height="30"
        rx="9"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <rect
        x="84"
        y="66"
        width="20"
        height="30"
        rx="9"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <path d="M36 74h6M78 74h6" strokeOpacity="0.5" />
    </>
  ),
  lamp: (
    <>
      <path
        d="M32 56 46 22h28l14 34H32Z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M60 54v34" />
      <path d="M40 100h40" />
      <path d="M52 88h16v12H52z" fill="currentColor" fillOpacity="0.1" />
      <path d="M44 68h-9M76 68h9M42 78l-7 5M78 78l7 5" strokeOpacity="0.45" />
    </>
  ),
  backpack: (
    <>
      <path
        d="M24 96V62a26 26 0 0 1 12-22M96 96V62a26 26 0 0 0-12-22"
        strokeOpacity="0.5"
      />
      <rect
        x="30"
        y="40"
        width="60"
        height="64"
        rx="20"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path d="M52 40V34a8 8 0 0 1 16 0v6" />
      <path d="M30 62h60" strokeOpacity="0.7" />
      <rect x="44" y="72" width="32" height="22" rx="8" />
      <path d="M50 83h20" strokeOpacity="0.6" />
    </>
  ),
  speaker: (
    <>
      <rect
        x="34"
        y="22"
        width="52"
        height="76"
        rx="22"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path d="M46 40h28M44 50h32M44 60h32M46 70h28" strokeOpacity="0.65" />
      <circle
        cx="60"
        cy="86"
        r="5"
        fill="currentColor"
        fillOpacity="0.4"
        strokeOpacity="0"
      />
      <path d="M34 30h52" strokeOpacity="0.35" />
    </>
  ),
  watch: (
    <>
      <rect
        x="42"
        y="14"
        width="36"
        height="26"
        rx="10"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <rect
        x="42"
        y="80"
        width="36"
        height="26"
        rx="10"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <rect
        x="34"
        y="34"
        width="52"
        height="52"
        rx="16"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <path d="M60 48v13l9 6" />
      <path d="M86 52h6v12h-6" strokeOpacity="0.5" />
    </>
  ),
  bottle: (
    <>
      <path d="M50 16h20v12H50z" fill="currentColor" fillOpacity="0.3" />
      <path
        d="M46 40a14 14 0 0 1 8-12.6h12A14 14 0 0 1 74 40v54a10 10 0 0 1-10 10H56a10 10 0 0 1-10-10V40Z"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path d="M46 58h28" strokeOpacity="0.5" />
      <path d="M56 70v18" strokeOpacity="0.4" />
    </>
  ),
  sunglasses: (
    <>
      <path d="M14 48h92" />
      <path
        d="M18 48h34v10a17 17 0 0 1-34 0V48Z"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <path
        d="M68 48h34v10a17 17 0 0 1-34 0V48Z"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <path d="M52 54c3-3 13-3 16 0" />
      <path d="M14 48 6 40M106 48l8-8" strokeOpacity="0.5" />
    </>
  ),
  mug: (
    <>
      <path
        d="M28 40h52v40a20 20 0 0 1-20 20H48a20 20 0 0 1-20-20V40Z"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path d="M80 52h9a13 13 0 0 1 0 26h-9" />
      <path d="M40 24c0 5 6 5 6 10M58 22c0 5 6 5 6 10" strokeOpacity="0.45" />
    </>
  ),
  skincare: (
    <>
      <rect
        x="20"
        y="52"
        width="30"
        height="50"
        rx="10"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path d="M28 52V42h14v10" />
      <rect
        x="60"
        y="34"
        width="38"
        height="30"
        rx="12"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <rect x="62" y="72" width="34" height="30" rx="12" />
      <path d="M28 70h14" strokeOpacity="0.5" />
    </>
  ),
  keyboard: (
    <>
      <rect
        x="10"
        y="40"
        width="100"
        height="46"
        rx="12"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M24 54h8M40 54h8M56 54h8M72 54h8M88 54h8" strokeOpacity="0.6" />
      <path d="M24 66h8M40 66h8M56 66h8M72 66h8M88 66h8" strokeOpacity="0.6" />
      <path d="M40 78h40" />
    </>
  ),
};

const toneStyles: Record<ArtTone, string> = {
  violet: "art-violet text-brand-primary",
  blue: "art-blue text-brand-secondary",
  cyan: "art-cyan text-brand-accent",
  magenta: "art-magenta text-brand-highlight",
  neutral: "art-neutral text-foreground-muted",
};

export interface ProductArtworkProps {
  art: ProductArtKey;
  tone: ArtTone;
  /** Aspect ratio of the panel. */
  ratio?: "square" | "portrait" | "wide";
  /** Marks the glyph as zoom target for `hover-zoom` on an ancestor. */
  zoom?: boolean;
  /** `large` keeps the glyph in proportion inside oversized panels. */
  glyph?: "default" | "large";
  className?: string;
}

const ratioStyles = {
  square: "aspect-square",
  portrait: "aspect-4/5",
  wide: "aspect-3/2",
} as const;

export function ProductArtwork({
  art,
  tone,
  ratio = "portrait",
  zoom = true,
  glyph = "default",
  className,
}: ProductArtworkProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative grid place-items-center overflow-hidden",
        ratioStyles[ratio],
        toneStyles[tone],
        className,
      )}
    >
      {/* Soft highlight so the panel reads as lit rather than flat. */}
      <span className="pointer-events-none absolute -top-1/4 left-1/2 size-[85%] -translate-x-1/2 rounded-full bg-current opacity-[0.07] blur-2xl" />
      <svg
        viewBox="0 0 120 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "relative",
          glyph === "large" ? "w-[54%] max-w-64" : "w-[62%] max-w-40",
        )}
        {...(zoom ? { "data-zoom": "" } : {})}
      >
        {glyphs[art]}
      </svg>
    </div>
  );
}
