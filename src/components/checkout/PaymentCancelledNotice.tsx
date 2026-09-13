"use client";

import { Icon } from "@/components/ui/Icon";

/**
 * Shown when a shopper comes back from Stripe without paying.
 *
 * Stripe's cancel URL is the only thing that puts this on screen, and it says
 * exactly what happened: nothing was charged, and the basket is untouched.
 */
export function PaymentCancelledNotice() {
  return (
    <div
      role="status"
      className="animate-fade flex items-start gap-3 rounded-2xl border border-border bg-surface-muted p-4"
    >
      <Icon
        name="bag"
        className="mt-0.5 size-[1.15rem] shrink-0 text-foreground-subtle"
      />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">Payment was cancelled</p>
        <p className="type-caption text-foreground-muted">
          No charge was made and your cart is exactly as you left it. Your
          contact and delivery details are never kept in this browser, so
          please enter them again to try the payment once more.
        </p>
      </div>
    </div>
  );
}
