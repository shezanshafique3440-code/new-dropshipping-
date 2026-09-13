"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export interface AddToCartIconButtonProps {
  product: Product;
  className?: string;
}

/**
 * Compact add control for a product card.
 *
 * Always visible rather than hover-revealed, so it works on touch and for
 * keyboard users. The card is a stretched link, so this stops the click from
 * bubbling into it — see the wrapper's `z-10` in `ProductCard`.
 */
export function AddToCartIconButton({
  product,
  className,
}: AddToCartIconButtonProps) {
  const { add, quantityOf } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inCart = quantityOf(product.id);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // The whole card is a link; adding must not navigate.
    event.preventDefault();
    event.stopPropagation();

    add(product, 1);
    setJustAdded(true);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        inCart > 0
          ? `Add another ${product.name} to your cart (${inCart} in cart)`
          : `Add ${product.name} to your cart`
      }
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-semibold transition-[background-color,color,transform] duration-200 active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
        justAdded
          ? "bg-success text-white"
          : "bg-brand-primary-soft text-brand-primary hover:bg-brand-fill hover:text-white",
        className,
      )}
    >
      <Icon
        name={justAdded ? "check" : "plus"}
        className="size-4"
        strokeWidth={2.5}
      />
      <span className="sr-only sm:not-sr-only">
        {justAdded ? "Added" : "Add"}
      </span>
    </button>
  );
}
