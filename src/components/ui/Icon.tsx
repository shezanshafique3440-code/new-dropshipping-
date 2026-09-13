import type { ReactElement } from "react";

import type { IconName } from "@/types";

/**
 * Inline UI glyphs on a 24×24 grid, stroked with `currentColor`.
 * Kept in-repo so the interface needs no icon dependency. The `IconName`
 * union lives in `@/types`, so data files can name an icon without importing
 * a component — and the compiler flags any name without a glyph here.
 */
const glyphs: Record<IconName, ReactElement> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M4.75 19.5a7.25 7.25 0 0 1 14.5 0" />
    </>
  ),
  bag: (
    <>
      <path d="M4.5 8.5h15l-1 10.25a1.5 1.5 0 0 1-1.5 1.35H7a1.5 1.5 0 0 1-1.5-1.35L4.5 8.5Z" />
      <path d="M9 10V7a3 3 0 1 1 6 0v3" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrowRight: <path d="M4.5 12h14m-5.5-5.5L18.5 12 13 17.5" />,
  sparkle: (
    <>
      <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5 10.1 12.8 4.5 10.9 10.1 9 12 3.5Z" />
      <path d="M18.5 4v2.5M17.25 5.25h2.5" />
    </>
  ),
  truck: (
    <>
      <path d="M3.5 7.5h9.5v8.25H3.5z" />
      <path d="M13 10.5h3.6l2.9 3v2.25H13z" />
      <circle cx="7.25" cy="17.5" r="1.75" />
      <circle cx="16.5" cy="17.5" r="1.75" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.75 19 6.5v5c0 4-2.9 7.2-7 8.75-4.1-1.55-7-4.75-7-8.75v-5l7-2.75Z" />
      <path d="m9.25 11.75 2 2 3.5-3.75" />
    </>
  ),
  mail: (
    <>
      <path d="M3.75 6.25h16.5v11.5H3.75z" />
      <path d="m4.25 7 7.75 6 7.75-6" />
    </>
  ),
  heart: (
    <path d="M12 19.5c-4.6-2.9-7.5-5.85-7.5-9.2A3.95 3.95 0 0 1 12 8.1a3.95 3.95 0 0 1 7.5 2.2c0 3.35-2.9 6.3-7.5 9.2Z" />
  ),
  star: (
    <path d="m12 4 2.45 4.96 5.05.73-3.65 3.56.86 5.03L12 15.9l-4.71 2.38.86-5.03L4.5 9.69l5.05-.73L12 4Z" />
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  lock: (
    <>
      <rect x="4.75" y="10.5" width="14.5" height="9.25" rx="2.25" />
      <path d="M8.25 10.5v-2.5a3.75 3.75 0 0 1 7.5 0v2.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M3.9 12h16.2M12 3.75c2.1 2.3 3.2 5.2 3.2 8.25S14.1 18 12 20.25c-2.1-2.25-3.2-5.2-3.2-8.25S9.9 6.05 12 3.75Z" />
    </>
  ),
  chat: (
    <>
      <path d="M4.75 6.5h14.5v9.25H10L5.75 19v-3.25H4.75z" />
      <path d="M9 11h6" />
    </>
  ),
  layers: (
    <>
      <path d="m12 4 7.5 4-7.5 4-7.5-4L12 4Z" />
      <path d="m5.25 12.5 6.75 3.6 6.75-3.6M5.25 16.25 12 19.85l6.75-3.6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  refresh: (
    <>
      <path d="M19 12a7 7 0 1 1-2.4-5.3" />
      <path d="M19.5 5v4h-4" />
    </>
  ),
};

export type { IconName };

export interface IconProps {
  name: IconName;
  className?: string;
  /** Stroke width on the 24×24 grid. */
  strokeWidth?: number;
  /** Fills the glyph with `currentColor` instead of stroking it. */
  filled?: boolean;
}

export function Icon({
  name,
  className = "size-5",
  strokeWidth = 1.6,
  filled = false,
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {glyphs[name]}
    </svg>
  );
}
