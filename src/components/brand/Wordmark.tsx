import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const sizeStyles = {
  sm: { text: "text-base", mark: "size-7 text-[0.8125rem]", gap: "gap-2" },
  md: { text: "text-lg", mark: "size-9 text-[0.9375rem]", gap: "gap-2.5" },
  lg: { text: "text-2xl", mark: "size-11 text-lg", gap: "gap-3" },
} as const;

export type WordmarkSize = keyof typeof sizeStyles;

export interface WordmarkProps {
  size?: WordmarkSize;
  /** Renders the gradient monogram tile beside the wordmark. */
  withMark?: boolean;
  /** Paints the wordmark in the brand gradient instead of the text colour. */
  gradient?: boolean;
  className?: string;
}

/**
 * The ZYVERO wordmark, built from type and tokens only — no image asset.
 * The monogram tile is sized as a square so a custom SVG logo can replace its
 * contents later without changing any layout around it.
 */
export function Wordmark({
  size = "md",
  withMark = true,
  gradient = true,
  className,
}: WordmarkProps) {
  const styles = sizeStyles[size];

  return (
    <span className={cn("inline-flex items-center", styles.gap, className)}>
      {withMark ? (
        <span
          aria-hidden="true"
          className={cn(
            "gradient-brand grid shrink-0 place-items-center rounded-xl font-bold text-white shadow-glow-primary",
            styles.mark,
          )}
        >
          Z
        </span>
      ) : null}
      <span
        className={cn(
          "font-bold tracking-[0.16em] uppercase",
          styles.text,
          gradient ? "text-gradient-brand" : "text-foreground",
        )}
      >
        {siteConfig.name}
      </span>
    </span>
  );
}

export interface WordmarkLinkProps extends WordmarkProps {
  href?: string;
}

/** The wordmark as a link home, with an accessible label. */
export function WordmarkLink({
  href = "/",
  className,
  ...props
}: WordmarkLinkProps) {
  return (
    <Link
      href={href}
      aria-label={`${siteConfig.name} — home`}
      className={cn("inline-flex rounded-xl", className)}
    >
      <Wordmark {...props} />
    </Link>
  );
}
