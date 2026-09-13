import type { ElementType, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variantStyles = {
  solid: "bg-surface border border-border",
  muted: "bg-surface-muted border border-transparent",
  glass: "glass",
} as const;

export type CardVariant = keyof typeof variantStyles;

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: CardVariant;
  /** Adds a lift-on-hover interaction, used by product cards later on. */
  interactive?: boolean;
}

/** Surface primitive shared by product cards, panels and empty states. */
export function Card({
  as: Component = "div",
  variant = "solid",
  interactive = false,
  className,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-2xl shadow-soft transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-soft)]",
        variantStyles[variant],
        interactive && "hover:-translate-y-1 hover:shadow-lifted",
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
  return <div className={cn("flex flex-col gap-2 p-6 pb-0", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-relaxed text-foreground-muted", className)}
      {...props}
    />
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
