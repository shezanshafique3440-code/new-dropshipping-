"use client";

import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { formatCartCount } from "@/lib/cart";
import { cn } from "@/lib/utils";

export interface CartTriggerProps {
  className?: string;
}

/**
 * Header cart button.
 *
 * The badge only renders once the persisted cart has been read, so the server
 * and first client render agree and no count flickers from 0 to its real
 * value.
 */
export function CartTrigger({ className }: CartTriggerProps) {
  const { itemCount, hydrated, openDrawer } = useCart();
  const showBadge = hydrated && itemCount > 0;

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-haspopup="dialog"
      aria-label={
        showBadge
          ? `Open cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`
          : "Open cart"
      }
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-full border border-transparent text-foreground-muted transition-[color,background-color,border-color] duration-200 hover:border-border hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
        className,
      )}
    >
      <Icon name="bag" className="size-[1.15rem]" />
      {showBadge ? (
        <span
          // Re-keyed on the count so the scale-in replays on every change:
          // with grid quick-adds the badge is the main feedback.
          key={itemCount}
          aria-hidden="true"
          className="animate-scale-in absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-brand-fill px-1 text-[0.625rem] leading-5 font-bold text-white shadow-soft"
        >
          {formatCartCount(itemCount)}
        </span>
      ) : null}
    </button>
  );
}
