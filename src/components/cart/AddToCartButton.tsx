"use client";

import { useEffect, useRef, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/types";

export interface AddToCartButtonProps {
  product: Product;
  /** Quantity to add in one press. */
  quantity?: number;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/**
 * Adds a product to the cart.
 *
 * The confirmation is real state, not a simulated request: the item is in the
 * cart the moment the label changes, and the label settles back on its own.
 */
export function AddToCartButton({
  product,
  quantity = 1,
  variant = "gradient",
  size = "lg",
  fullWidth = true,
  className,
}: AddToCartButtonProps) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const handleClick = () => {
    add(product, quantity, { openDrawer: true });
    setJustAdded(true);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setJustAdded(false), 2200);
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={handleClick}
      className={className}
    >
      <Icon
        name={justAdded ? "check" : "bag"}
        className="size-[1.15rem]"
        strokeWidth={justAdded ? 2.5 : 1.6}
      />
      {justAdded ? "Added to cart" : "Add to Cart"}
    </Button>
  );
}
