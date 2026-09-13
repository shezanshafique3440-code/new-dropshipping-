"use client";

import { useEffect, useRef, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface ClearCartButtonProps {
  className?: string;
}

/**
 * Clears the whole cart behind an inline confirmation.
 *
 * Emptying a cart is destructive and easy to hit by accident, so the control
 * asks first — in the page, with real buttons, rather than a `window.confirm`
 * that cannot be styled or reached consistently by assistive technology.
 */
export function ClearCartButton({ className }: ClearCartButtonProps) {
  const { items, clear } = useCart();
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) {
      confirmRef.current?.focus();
    }
  }, [confirming]);

  if (items.length === 0) {
    return null;
  }

  if (!confirming) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setConfirming(true)}
        className={cn(
          "type-caption inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-semibold text-foreground-subtle transition-colors duration-200 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
          className,
        )}
      >
        <Icon name="close" className="size-3" strokeWidth={2.5} />
        Clear cart
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Confirm clearing your cart"
      className={cn(
        "animate-fade flex flex-wrap items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1.5",
        className,
      )}
    >
      <span className="type-caption text-foreground-muted">Clear all items?</span>
      <button
        ref={confirmRef}
        type="button"
        onClick={() => {
          clear();
          setConfirming(false);
        }}
        className="type-caption rounded-full bg-danger px-3 py-1 font-semibold text-white transition-[filter] duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      >
        Yes, clear
      </button>
      <button
        type="button"
        onClick={() => {
          setConfirming(false);
          triggerRef.current?.focus();
        }}
        className="type-caption rounded-full px-2 py-1 font-semibold text-foreground-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      >
        Cancel
      </button>
    </div>
  );
}
