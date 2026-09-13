import type { ReactElement } from "react";

/**
 * Inline UI glyphs on a 24×24 grid, stroked with `currentColor`.
 * Kept in-repo so the interface needs no icon dependency.
 */
const glyphs = {
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
} satisfies Record<string, ReactElement>;

export type IconName = keyof typeof glyphs;

export interface IconProps {
  name: IconName;
  className?: string;
  /** Stroke width on the 24×24 grid. */
  strokeWidth?: number;
}

export function Icon({ name, className = "size-5", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {glyphs[name]}
    </svg>
  );
}
