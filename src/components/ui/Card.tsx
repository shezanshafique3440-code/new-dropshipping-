import type { ElementType, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variantStyles = {
  /** Flat surface with a hairline border. */
  default: "bg-surface border border-border shadow-soft",
  /** Lifted panel for content that should read as a layer above the page. */
  elevated: "bg-surface-elevated border border-border-subtle shadow-card",
  /** Frosted panel for overlays and promotional moments. */
  glass: "glass shadow-card",
  /** Hairline gradient outline — reserve for one or two highlights per view. */
  gradient: "gradient-border bg-surface shadow-card",
  /** Borderless tinted block, used for quiet informational panels. */
  muted: "bg-surface-muted border border-transparent",
} as const;

export type CardVariant = keyof typeof variantStyles;

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: CardVariant;
  /** Adds the shared hover lift and shadow response. */
  interactive?: boolean;
  /** Adds a brand glow on hover — pair with `interactive`, use sparingly. */
  glow?: boolean;
}

/** Surface primitive shared by panels, empty states and future product cards. */
export function Card({
  as: Component = "div",
  variant = "default",
  interactive = false,
  glow = false,
  className,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-2xl",
        variantStyles[variant],
        interactive && "hover-lift hover-zoom",
        interactive && glow && "hover:shadow-glow-primary",
        interactive && "hover:border-border-highlight",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-2 p-6 pb-0", className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("type-h3", className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-foreground-muted", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-3 p-6 pt-0", className)}
      {...props}
    />
  );
}
