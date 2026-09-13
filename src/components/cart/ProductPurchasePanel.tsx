"use client";

import { useState } from "react";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { useCart } from "@/components/cart/CartProvider";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import type { Product } from "@/types";

export interface ProductPurchasePanelProps {
  product: Product;
}

/**
 * The interactive block on a product page: quantity, add to cart, favourite.
 *
 * Kept to this island so the rest of the detail page stays server-rendered.
 */
export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const { quantityOf, hydrated } = useCart();
  const inCart = quantityOf(product.id);

  return (
    <div className="flex flex-col gap-4 border-t border-border-subtle pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          label={product.name}
        />
        <FavoriteButton productName={product.name} />
      </div>

      <AddToCartButton product={product} quantity={quantity} />

      {hydrated && inCart > 0 ? (
        <p aria-live="polite" className="type-caption text-center text-foreground-muted">
          {inCart} already in your cart
        </p>
      ) : null}
    </div>
  );
}
