import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const variantStyles = {
  neutral: "bg-surface-muted text-foreground-muted border border-border",
  brand: "bg-brand-primary-soft text-brand-primary border border-border-highlight",
  /** Solid gradient pill — the loudest badge, one per view at most. */
  gradient: "gradient-brand text-white border border-transparent shadow-soft",
  new: "bg-brand-secondary-soft text-brand-secondary border border-transparent",
  trending: "bg-brand-accent-soft text-brand-accent border border-transparent",
  bestseller: "bg-brand-highlight-soft text-brand-highlight border border-transparent",
  limited: "bg-transparent text-foreground border border-border-highlight",
  sale: "bg-danger text-white border border-transparent",
  success: "bg-transparent text-success border border-current/35",
} as const;

const sizeStyles = {
  sm: "h-5 px-2 text-[0.6875rem]",
  md: "h-6 px-2.5 text-xs",
} as const;

export type BadgeVariant = keyof typeof variantStyles;
export type BadgeSize = keyof typeof sizeStyles;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Small leading dot, useful for status-style badges. */
  dot?: boolean;
  children: ReactNode;
}

/** Compact label for merchandising and status cues. */
export function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full font-semibold tracking-wide whitespace-nowrap uppercase",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-current"
        />
      ) : null}
      {children}
    </span>
  );
}
