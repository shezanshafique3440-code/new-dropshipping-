import type { ElementType, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const sizeStyles = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  /** Default: the page width defined by `--container-page`. */
  lg: "",
  full: "max-w-none",
} as const;

export type ContainerSize = keyof typeof sizeStyles;

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Semantic element to render — defaults to a plain `div`. */
  as?: ElementType;
  size?: ContainerSize;
}

/**
 * Global width constraint and horizontal gutters.
 * Every page section should sit inside a `Container`.
 */
export function Container({
  as: Component = "div",
  size = "lg",
  className,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn("container-page", sizeStyles[size], className)}
      {...props}
    />
  );
}
