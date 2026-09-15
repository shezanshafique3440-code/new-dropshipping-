"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/CartProvider";
import { ProductThumbnail } from "@/components/product/ProductThumbnail";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { Icon } from "@/components/ui/Icon";
import { getCartLineTotal } from "@/lib/cart";
import { productHref } from "@/lib/routes";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types";

export interface CartLineProps {
  item: CartItem;
  /** `compact` for the drawer, `full` for the cart page. */
  variant?: "compact" | "full";
  /** Called after the line is removed, e.g. to announce it. */
  onRemoved?: (item: CartItem) => void;
}

/** One cart line: artwork, details, quantity and removal. */
export function CartLine({ item, variant = "compact", onRemoved }: CartLineProps) {
  const { setQuantity, remove, lastAddedId } = useCart();
  const full = variant === "full";
  const justAdded = lastAddedId === item.productId;
  const href = productHref(item.slug);

  return (
    <li
      className={cn(
        "animate-fade relative flex gap-4 rounded-2xl border p-3 transition-colors duration-500",
        full ? "sm:gap-5 sm:p-4" : "",
        justAdded
          ? "border-border-highlight bg-brand-primary-soft/40"
          : "border-border-subtle bg-surface",
      )}
    >
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className={cn(
          // `self-start` keeps the tile square: as a stretched flex child it
          // would grow with the row and leave a blank band under the artwork.
          "hover-zoom shrink-0 self-start overflow-hidden rounded-xl border border-border-subtle",
          full ? "w-24 sm:w-28" : "w-20",
        )}
      >
        {/* Decorative: the line's heading names the product just beside it. */}
        <ProductThumbnail
          image={item.image}
          art={item.art}
          tone={item.tone}
          decorative
          zoom
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="type-caption text-foreground-subtle">
              {item.category}
            </p>
            <h3 className={cn("font-semibold", full ? "text-base" : "text-sm")}>
              <Link href={href} className="link-underline">
                {item.name}
              </Link>
            </h3>
            <p className="type-caption mt-0.5 text-foreground-subtle">
              {formatPrice(item.price)} each
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              remove(item.productId);
              onRemoved?.(item);
            }}
            aria-label={`Remove ${item.name} from your cart`}
            className="grid size-8 shrink-0 place-items-center rounded-full text-foreground-subtle transition-colors duration-200 hover:bg-surface-muted hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <Icon name="close" className="size-4" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <QuantityStepper
            value={item.quantity}
            onChange={(quantity) => setQuantity(item.productId, quantity)}
            label={item.name}
            size="sm"
            hideLabel
          />
          <p className={cn("font-bold", full ? "text-base" : "text-sm")}>
            {formatPrice(getCartLineTotal(item))}
          </p>
        </div>
      </div>

      {justAdded ? (
        <span className="type-caption absolute -top-2 left-3 rounded-full bg-brand-fill px-2 py-0.5 text-[0.6875rem] font-semibold text-white shadow-soft">
          Added
        </span>
      ) : null}
    </li>
  );
}
