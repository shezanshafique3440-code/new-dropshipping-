"use client";

import { CartEmpty } from "@/components/cart/CartEmpty";
import { CartLine } from "@/components/cart/CartLine";
import { CartSummary } from "@/components/cart/CartSummary";
import { ClearCartButton } from "@/components/cart/ClearCartButton";
import { useCart } from "@/components/cart/CartProvider";
import { Container } from "@/components/ui/Container";

/**
 * Cart page body.
 *
 * Renders a neutral placeholder until the persisted cart has been read, so the
 * server markup and the first client render match exactly.
 */
export function CartPageContent() {
  const { items, itemCount, hydrated } = useCart();

  if (!hydrated) {
    return (
      <Container className="section-y-sm">
        <div
          role="status"
          aria-label="Loading your cart"
          className="flex flex-col gap-4"
        >
          <span className="sr-only">Loading your cart</span>
          {[0, 1].map((index) => (
            <div
              key={index}
              aria-hidden="true"
              className="h-32 animate-pulse rounded-2xl bg-surface-muted"
            />
          ))}
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container size="md" className="section-y-sm">
        <CartEmpty variant="full" />
      </Container>
    );
  }

  return (
    <Container className="section-y-sm grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
      <section aria-labelledby="cart-items-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="cart-items-heading" className="type-h3">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </h2>
          <ClearCartButton />
        </div>

        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <CartLine key={item.productId} item={item} variant="full" />
          ))}
        </ul>
      </section>

      {/* Sticky on its own, not on a child: the grid row is taller than the
          summary, which is exactly the travel a sticky element needs. */}
      <aside
        aria-label="Order summary"
        className="lg:sticky lg:top-32 lg:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto"
      >
        <CartSummary />
      </aside>
    </Container>
  );
}
