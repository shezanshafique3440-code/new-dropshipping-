"use client";

import { useCart } from "@/components/cart/CartProvider";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { checkoutHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface CartSummaryProps {
  /** `panel` for the cart page card, `inline` for the drawer footer. */
  variant?: "panel" | "inline";
  /** Shown in the drawer, which also links through to the full cart page. */
  showViewCart?: boolean;
  className?: string;
}

/**
 * Totals and the checkout call to action.
 *
 * Shipping is not calculated here and does not pretend to be: the row states
 * that it is worked out at checkout, and the total equals the subtotal. The
 * free-delivery threshold is the storefront's own stated offer, read from
 * `siteConfig` so the header strip and this progress bar cannot disagree.
 */
export function CartSummary({
  variant = "panel",
  showViewCart = false,
  className,
}: CartSummaryProps) {
  const { subtotal, itemCount, closeDrawer } = useCart();

  const threshold = siteConfig.shipping.freeThreshold;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);
  const money = (value: number) => formatPrice(value);

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        variant === "panel" &&
          "rounded-2xl border border-border bg-surface p-6 shadow-soft",
        className,
      )}
    >
      {variant === "panel" ? (
        <h2 className="type-h3">Order summary</h2>
      ) : null}

      {itemCount > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="type-caption text-foreground-muted">
            {remaining > 0 ? (
              <>
                Add <span className="font-semibold text-foreground">{money(remaining)}</span>{" "}
                more for free delivery
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                <Icon name="check" className="size-3.5" strokeWidth={3} />
                Free delivery applies to this order
              </span>
            )}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={threshold}
            aria-valuenow={Math.min(subtotal, threshold)}
            aria-label={`Progress towards free delivery over ${money(threshold)}`}
            className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
          >
            <span
              style={{ width: `${progress}%` }}
              className="gradient-brand block h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-soft)]"
            />
          </div>
        </div>
      ) : null}

      <dl className="flex flex-col gap-3 border-t border-border-subtle pt-5 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-foreground-muted">
            Subtotal
            <span className="type-caption ml-1.5 text-foreground-subtle">
              ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
          </dt>
          <dd className="font-semibold tabular-nums">{money(subtotal)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-foreground-muted">Shipping</dt>
          <dd className="type-caption text-right text-foreground-subtle">
            Calculated at checkout
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle pt-3">
          <dt className="text-base font-semibold">Total</dt>
          <dd className="text-xl font-bold tabular-nums">{money(subtotal)}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <ButtonLink
          href={checkoutHref()}
          variant="gradient"
          size="lg"
          fullWidth
          onClick={closeDrawer}
        >
          <Icon name="lock" className="size-4" />
          Proceed to Checkout
        </ButtonLink>

        <p className="type-caption text-center text-foreground-subtle">
          Preview store — no payment is taken.
        </p>

        {showViewCart ? (
          <ButtonLink href="/cart" variant="outline" fullWidth onClick={closeDrawer}>
            View full cart
          </ButtonLink>
        ) : (
          <ButtonLink href="/shop" variant="ghost" fullWidth>
            Continue shopping
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
