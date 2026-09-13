import type { ReactElement } from "react";

import type { SocialIconName } from "@/types";

/** Simplified social marks on the same 24×24 grid as {@link Icon}. */
const glyphs: Record<SocialIconName, ReactElement> = {
  instagram: (
    <>
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.75" />
      <circle cx="12" cy="12" r="3.9" />
      <path d="M17.15 6.9h.01" />
    </>
  ),
  tiktok: (
    <>
      <path d="M13.6 3.5v10.75a3.35 3.35 0 1 1-2.9-3.32" />
      <path d="M13.6 6.1a4.6 4.6 0 0 0 4.4 3.3" />
    </>
  ),
  x: <path d="M4.5 4.5l15 15m0-15-15 15" />,
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3.5" />
      <path d="m10.6 9.6 4.4 2.4-4.4 2.4V9.6Z" />
    </>
  ),
};

export interface SocialIconProps {
  name: SocialIconName;
  className?: string;
}

export function SocialIcon({ name, className = "size-4" }: SocialIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {glyphs[name]}
    </svg>
  );
}
