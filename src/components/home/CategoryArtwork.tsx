import type { ReactElement } from "react";

import { cn } from "@/lib/utils";
import type { ArtTone, CategoryArtKey } from "@/types";

/**
 * Abstract artwork behind each category card.
 *
 * Six distinct compositions on a 160×160 grid, so the category grid reads as
 * six different places rather than six identical boxes.
 */
const compositions: Record<CategoryArtKey, ReactElement> = {
  orbit: (
    <>
      <circle cx="80" cy="80" r="26" fill="currentColor" fillOpacity="0.18" />
      <ellipse cx="80" cy="80" rx="62" ry="26" transform="rotate(-24 80 80)" />
      <ellipse
        cx="80"
        cy="80"
        rx="44"
        ry="62"
        transform="rotate(18 80 80)"
        strokeOpacity="0.5"
      />
      <circle cx="128" cy="46" r="7" fill="currentColor" fillOpacity="0.5" />
    </>
  ),
  waves: (
    <>
      <path d="M-4 108c26-30 50-30 76 0s50 30 76 0" />
      <path d="M-4 84c26-30 50-30 76 0s50 30 76 0" strokeOpacity="0.6" />
      <path d="M-4 132c26-30 50-30 76 0s50 30 76 0" strokeOpacity="0.35" />
      <circle cx="112" cy="42" r="20" fill="currentColor" fillOpacity="0.16" />
    </>
  ),
  grid: (
    <>
      <rect
        x="20"
        y="20"
        width="46"
        height="46"
        rx="12"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <rect x="82" y="20" width="46" height="46" rx="12" strokeOpacity="0.7" />
      <rect x="20" y="82" width="46" height="46" rx="12" strokeOpacity="0.7" />
      <rect
        x="82"
        y="82"
        width="46"
        height="46"
        rx="23"
        fill="currentColor"
        fillOpacity="0.22"
      />
    </>
  ),
  bloom: (
    <>
      <circle cx="80" cy="80" r="16" fill="currentColor" fillOpacity="0.25" />
      <path
        d="M80 80c0-30 14-46 32-46 0 26-14 46-32 46Z"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path
        d="M80 80c-30 0-46-14-46-32 26 0 46 14 46 32Z"
        fill="currentColor"
        fillOpacity="0.13"
      />
      <path
        d="M80 80c0 30-14 46-32 46 0-26 14-46 32-46Z"
        strokeOpacity="0.65"
      />
      <path
        d="M80 80c30 0 46 14 46 32-26 0-46-14-46-32Z"
        strokeOpacity="0.65"
      />
    </>
  ),
  prism: (
    <>
      <path
        d="M80 18 138 118H22L80 18Z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M80 52 110 118H50L80 52Z" strokeOpacity="0.7" />
      <path d="M18 138h124" strokeOpacity="0.45" />
      <circle cx="80" cy="86" r="9" fill="currentColor" fillOpacity="0.45" />
    </>
  ),
  stack: (
    <>
      <rect
        x="26"
        y="94"
        width="108"
        height="24"
        rx="12"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <rect
        x="36"
        y="62"
        width="88"
        height="24"
        rx="12"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <rect x="48" y="30" width="64" height="24" rx="12" strokeOpacity="0.75" />
      <path d="M20 130h120" strokeOpacity="0.4" />
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

export interface CategoryArtworkProps {
  art: CategoryArtKey;
  tone: ArtTone;
  /** `featured` fills the taller hero tile, which would otherwise read empty. */
  size?: "default" | "featured";
  className?: string;
}

export function CategoryArtwork({
  art,
  tone,
  size = "default",
  className,
}: CategoryArtworkProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 overflow-hidden",
        toneStyles[tone],
        className,
      )}
    >
      <svg
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        preserveAspectRatio="xMidYMid slice"
        data-zoom
        className={cn(
          "absolute opacity-80 transition-transform duration-500 ease-[var(--ease-out-soft)]",
          size === "featured"
            ? "-top-8 -right-10 size-80 sm:size-96"
            : "-right-6 -bottom-8 size-56 sm:size-64",
        )}
      >
        {compositions[art]}
      </svg>
    </div>
  );
}
