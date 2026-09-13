import type { SocialIconName } from "@/types";

const paths: Record<SocialIconName, string> = {
  instagram:
    "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM17.8 6.2h.01",
  tiktok:
    "M14 3v10.6a3.4 3.4 0 1 1-2.7-3.33M14 3c.3 2.4 1.9 4 4.3 4.2M14 3h.1",
  x: "M4 4l16 16M20 4L4 20",
  youtube:
    "M2.5 8.2A3.2 3.2 0 0 1 5.7 5h12.6a3.2 3.2 0 0 1 3.2 3.2v7.6a3.2 3.2 0 0 1-3.2 3.2H5.7a3.2 3.2 0 0 1-3.2-3.2V8.2ZM10.2 9.3l4.6 2.7-4.6 2.7V9.3Z",
};

export interface SocialIconProps {
  name: SocialIconName;
  className?: string;
}

/** Inline social glyph — keeps the footer icon set dependency-free. */
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
      <path d={paths[name]} />
    </svg>
  );
}
