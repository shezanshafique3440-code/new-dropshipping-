"use client";

import { useEffect, useId, useRef } from "react";

import { CartEmpty } from "@/components/cart/CartEmpty";
import { CartLine } from "@/components/cart/CartLine";
import { CartSummary } from "@/components/cart/CartSummary";
import { ClearCartButton } from "@/components/cart/ClearCartButton";
import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { cn } from "@/lib/utils";

/**
 * Slide-in cart.
 *
 * Enters from the right on every size, narrowing to a near-full-width sheet on
 * phones. The panel stays mounted so it can transition, and is `inert` while
 * closed so it leaves the tab order and the accessibility tree entirely.
 */
export function CartDrawer() {
  const { items, itemCount, isDrawerOpen, closeDrawer } = useCart();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useLockBodyScroll(isDrawerOpen);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Return focus to whatever opened the drawer.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !isDrawerOpen) {
      previouslyFocused.current?.focus?.();
    }
    wasOpen.current = isDrawerOpen;
  }, [isDrawerOpen]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={cn(
          "fixed inset-0 z-90 bg-navy-1000/55 transition-opacity duration-300 ease-[var(--ease-out-soft)]",
          isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!isDrawerOpen}
        tabIndex={-1}
        className={cn(
          "fixed inset-y-0 right-0 z-100 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-floating",
          "transition-transform duration-350 ease-[var(--ease-out-soft)] focus:outline-none",
          isDrawerOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <h2 id={titleId} className="type-h3">
            Your Cart
            <span className="ml-2 text-sm font-normal text-foreground-subtle">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-foreground transition-colors duration-200 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <Icon name="close" className="size-4" strokeWidth={2} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center overflow-y-auto px-5">
            <CartEmpty onNavigate={closeDrawer} />
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <CartLine key={item.productId} item={item} />
                ))}
              </ul>
              <div className="flex justify-end pt-4">
                <ClearCartButton />
              </div>
            </div>

            <div className="border-t border-border-subtle bg-surface px-5 py-5">
              <CartSummary variant="inline" showViewCart />
            </div>
          </>
        )}
      </div>
    </>
  );
}
