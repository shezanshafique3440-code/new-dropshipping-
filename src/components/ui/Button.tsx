import Link, { type LinkProps } from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Shared behaviour for every variant: fast, restrained transitions, a visible
 * focus ring, a small press-down on active and an unmistakable disabled state.
 */
const base = [
  "relative inline-flex items-center justify-center gap-2 rounded-full",
  "font-semibold whitespace-nowrap select-none",
  "transition-[background-color,border-color,color,box-shadow,transform,filter]",
  "duration-200 ease-[var(--ease-out-soft)]",
  "active:scale-[0.98]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
  "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
  "aria-disabled:pointer-events-none aria-disabled:opacity-45 aria-disabled:shadow-none",
].join(" ");

const variantStyles = {
  /** Solid brand fill — the default call to action. */
  primary:
    "bg-brand-fill text-white shadow-soft hover:bg-brand-fill-hover hover:-translate-y-0.5 hover:shadow-glow-primary",
  /** The signature blue → violet → pink gradient, for hero moments. */
  gradient:
    "gradient-brand bg-[length:180%_100%] bg-[position:0%_50%] text-white shadow-soft hover:bg-[position:100%_50%] hover:-translate-y-0.5 hover:shadow-glow-primary",
  /** Quiet filled button for secondary actions on any surface. */
  secondary:
    "bg-surface-muted text-foreground shadow-none hover:bg-brand-primary-soft hover:text-brand-primary",
  outline:
    "border border-border-strong bg-transparent text-foreground hover:border-brand-primary hover:text-brand-primary hover:shadow-soft",
  ghost:
    "bg-transparent text-foreground-muted hover:bg-surface-muted hover:text-foreground",
  destructive:
    "bg-danger text-white shadow-soft hover:brightness-110 hover:-translate-y-0.5",
} as const;

const sizeStyles = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
  /** Square target for icon-only actions — always pair with an aria-label. */
  icon: "size-11 p-0",
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/** Shared class recipe, so buttons and button-styled links stay identical. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonStyleProps = {}): string {
  return cn(
    base,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    className,
  );
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonStyleProps {
  children: ReactNode;
}

export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}

export interface ButtonLinkProps
  extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    ButtonStyleProps {
  children: ReactNode;
}

/** A `next/link` that looks and behaves like a {@link Button}. */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
