"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export interface AddToCartButtonProps {
  productName: string;
}

/**
 * Preview-only add-to-cart.
 *
 * There is no cart yet, so the button says what actually happened rather than
 * faking a confirmation. The real basket arrives with the cart step.
 */
export function AddToCartButton({ productName }: AddToCartButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        variant="gradient"
        size="lg"
        fullWidth
        onClick={() => setPressed(true)}
      >
        <Icon name="bag" className="size-[1.15rem]" />
        Add to Cart
      </Button>
      <p
        aria-live="polite"
        className="type-caption min-h-5 text-center text-foreground-subtle"
      >
        {pressed
          ? `The cart is not built yet — ${productName} was not added.`
          : "Preview store: checkout opens in a later release."}
      </p>
    </div>
  );
}
