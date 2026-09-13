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
  chargingDock: (
    <>
      <path
        d="M26 96h68a8 8 0 0 0 8-8V84H18v4a8 8 0 0 0 8 8Z"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <rect x="26" y="30" width="30" height="54" rx="8" />
      <rect
        x="66"
        y="46"
        width="26"
        height="38"
        rx="10"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path d="M41 40v10M79 56v8" strokeOpacity="0.55" />
    </>
  ),
  projector: (
    <>
      <rect
        x="18"
        y="46"
        width="64"
        height="34"
        rx="12"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <circle cx="38" cy="63" r="11" />
      <path d="M66 57h6M66 69h6" strokeOpacity="0.55" />
      <path d="M86 48 108 38v50L86 78" fill="currentColor" fillOpacity="0.08" />
    </>
  ),
  earbuds: (
    <>
      {/* Two buds with stems, so the pair does not read as eyewear. */}
      <path
        d="M34 32a14 14 0 0 1 14 14v6a10 10 0 0 1-20 0v-6a14 14 0 0 1 6-14Z"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <path d="M38 62v22a8 8 0 0 0 8 8" />
      <path
        d="M86 32a14 14 0 0 0-14 14v6a10 10 0 0 0 20 0v-6a14 14 0 0 0-6-14Z"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <path d="M82 62v22a8 8 0 0 1-8 8" />
      <path d="M52 96h16" strokeOpacity="0.4" />
    </>
  ),
  powerBank: (
    <>
      <rect
        x="34"
        y="20"
        width="52"
        height="80"
        rx="14"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path d="m62 40-10 22h16l-10 20" />
      <path d="M46 90h28" strokeOpacity="0.5" />
      <path d="M50 30h20" strokeOpacity="0.4" />
    </>
  ),
  diffuser: (
    <>
      <path
        d="M34 76a26 26 0 0 1 18-24.7V46h16v5.3A26 26 0 0 1 86 76v6a20 20 0 0 1-20 20H54a20 20 0 0 1-20-20v-6Z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M52 46h16" />
      <path
        d="M50 30c5 4 5 9 0 13M70 26c5 4 5 9 0 13M60 18c4 3 4 7 0 10"
        strokeOpacity="0.5"
      />
      <path d="M46 88h28" strokeOpacity="0.45" />
    </>
  ),
  deskLight: (
    <>
      <path d="M28 100h34" />
      <path d="M45 100V60l30-22" />
      <path
        d="m66 26 22 14-10 16-22-14 10-16Z"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <path d="M62 56 84 70" strokeOpacity="0.4" />
    </>
  ),
  deskOrganizer: (
    <>
      <path
        d="M22 52h76v40a10 10 0 0 1-10 10H32a10 10 0 0 1-10-10V52Z"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path d="M46 52V32M62 52V26M78 52V36" strokeOpacity="0.6" />
      <path d="M22 72h76" strokeOpacity="0.45" />
    </>
  ),
  humidifier: (
    <>
      <path
        d="M38 54h44v34a14 14 0 0 1-14 14H52a14 14 0 0 1-14-14V54Z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M50 54V44a10 10 0 0 1 20 0v10" />
      <path d="M46 24c4 4 4 8 0 12M74 22c4 4 4 8 0 12" strokeOpacity="0.5" />
      <circle
        cx="60"
        cy="80"
        r="6"
        fill="currentColor"
        fillOpacity="0.3"
        strokeOpacity="0"
      />
    </>
  ),
  slingBag: (
    <>
      <path
        d="M28 62 68 30a14 14 0 0 1 22 11v37a16 16 0 0 1-16 16H44a16 16 0 0 1-16-16V62Z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M28 62 88 88" strokeOpacity="0.55" />
      <rect x="46" y="66" width="22" height="14" rx="5" />
    </>
  ),
  travelOrganizer: (
    <>
      <rect
        x="18"
        y="38"
        width="84"
        height="46"
        rx="12"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path d="M18 58h84" strokeOpacity="0.6" />
      <path d="M52 38V28h16v10" />
      <rect x="34" y="64" width="16" height="10" rx="4" strokeOpacity="0.6" />
      <rect x="70" y="64" width="16" height="10" rx="4" strokeOpacity="0.6" />
    </>
  ),
  crossbody: (
    <>
      <path
        d="M32 54h56v34a14 14 0 0 1-14 14H46a14 14 0 0 1-14-14V54Z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M32 54v-6a10 10 0 0 1 10-10h36a10 10 0 0 1 10 10v6" />
      <path d="M40 38C40 18 62 10 78 20" strokeOpacity="0.5" />
      <rect x="52" y="66" width="16" height="12" rx="4" />
    </>
  ),
  sportBottle: (
    <>
      <path d="M46 22h28v10H46z" fill="currentColor" fillOpacity="0.3" />
      <path
        d="M42 46a16 16 0 0 1 10-14h16a16 16 0 0 1 10 14v44a14 14 0 0 1-14 14H56a14 14 0 0 1-14-14V46Z"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path d="M42 62h36M42 78h36" strokeOpacity="0.45" />
      <path d="M84 50h8v18h-8" strokeOpacity="0.5" />
    </>
  ),
  facialSteamer: (
    <>
      <path
        d="M40 66h40v22a14 14 0 0 1-14 14H54a14 14 0 0 1-14-14V66Z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="m52 66 8-24h6l6 16" />
      <circle cx="76" cy="34" r="9" fill="currentColor" fillOpacity="0.2" />
      <path d="M34 30c4 4 4 8 0 12" strokeOpacity="0.45" />
    </>
  ),
  mirror: (
    <>
      <circle cx="60" cy="52" r="30" fill="currentColor" fillOpacity="0.14" />
      <circle cx="60" cy="52" r="20" strokeOpacity="0.55" />
      <path d="M60 82v14M44 100h32" />
      <path d="M32 32h.01M88 32h.01" strokeOpacity="0.4" />
    </>
  ),
  iceRoller: (
    <>
      <rect
        x="20"
        y="42"
        width="42"
        height="26"
        rx="13"
        fill="currentColor"
        fillOpacity="0.16"
        transform="rotate(-18 41 55)"
      />
      <path d="m64 66 30 26" />
      <path d="M88 86h14v10H92" strokeOpacity="0.5" />
      <path d="M34 40v-8M50 44v-8" strokeOpacity="0.4" />
    </>
  ),
  facialTool: (
    <>
      <path
        d="M30 34c14-6 26 0 30 12s-2 24-16 28"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="m58 62 28 30" />
      <circle cx="90" cy="96" r="6" strokeOpacity="0.6" />
      <path d="M36 46h14" strokeOpacity="0.45" />
    </>
  ),
  wallet: (
    <>
      <rect
        x="20"
        y="36"
        width="80"
        height="50"
        rx="12"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path d="M20 54h56a10 10 0 0 1 0 20H20" strokeOpacity="0.6" />
      <circle
        cx="76"
        cy="64"
        r="4"
        fill="currentColor"
        fillOpacity="0.5"
        strokeOpacity="0"
      />
      <path d="M32 36V26h40v10" strokeOpacity="0.4" />
    </>
  ),
  phoneStand: (
    <>
      <rect
        x="42"
        y="20"
        width="40"
        height="58"
        rx="8"
        transform="rotate(10 62 49)"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M26 96h68" />
      <path d="M40 96 56 66M92 88 74 58" strokeOpacity="0.55" />
      <path d="M56 32h16" strokeOpacity="0.4" />
    </>
  ),
  keyOrganizer: (
    <>
      <rect
        x="44"
        y="20"
        width="32"
        height="60"
        rx="10"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M52 80v16M60 80v22M68 80v14" strokeOpacity="0.6" />
      <circle cx="60" cy="34" r="6" />
      <path d="M52 96h-6M68 94h6" strokeOpacity="0.4" />
    </>
  ),
  cardHolder: (
    <>
      <rect
        x="22"
        y="46"
        width="72"
        height="44"
        rx="10"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <rect x="30" y="34" width="66" height="42" rx="10" strokeOpacity="0.7" />
      <path d="M40 60h22" strokeOpacity="0.55" />
      <path d="M40 70h12" strokeOpacity="0.4" />
    </>
  ),
  storageBox: (
    <>
      <path
        d="M22 44h76v46a10 10 0 0 1-10 10H32a10 10 0 0 1-10-10V44Z"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path d="M16 30h88v14H16z" fill="currentColor" fillOpacity="0.2" />
      <path d="M48 62h24" strokeOpacity="0.6" />
      <path d="M22 78h76" strokeOpacity="0.35" />
    </>
  ),
  multiTool: (
    <>
      <rect
        x="46"
        y="40"
        width="28"
        height="62"
        rx="13"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path d="M54 28h12" />
      <path d="m74 52 26-14M74 68h26M74 84l24 12" strokeOpacity="0.7" />
      <path d="M46 56 22 44M46 72H20" strokeOpacity="0.45" />
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
