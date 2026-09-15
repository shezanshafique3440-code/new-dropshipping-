import { ProductThumbnail } from "@/components/product/ProductThumbnail";
import { getCartLineTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/types";

export interface CheckoutItemProps {
  item: CartItem;
}

/**
 * One order line.
 *
 * Read-only, and deliberately not a link: checkout state is held in memory and
 * never persisted, so navigating to a product page mid-checkout would throw
 * away everything the shopper has typed. Quantities are changed in the cart,
 * which stays the single source of truth.
 */
export function CheckoutItem({ item }: CheckoutItemProps) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="relative shrink-0 self-start">
        <span className="block w-16 overflow-hidden rounded-xl border border-border-subtle">
          <ProductThumbnail
            image={item.image}
            art={item.art}
            tone={item.tone}
            decorative
          />
        </span>
        <span
          aria-hidden="true"
          className="absolute -top-2 -right-2 grid min-w-5 place-items-center rounded-full bg-foreground px-1 text-[0.625rem] leading-5 font-bold text-background"
        >
          {item.quantity}
        </span>
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-caption text-foreground-subtle">
          {item.category}
        </span>
        <span className="text-sm font-semibold break-words">{item.name}</span>
        <span className="type-caption text-foreground-subtle">
          {formatPrice(item.price)} each ·{" "}
          <span className="sr-only">quantity </span>
          {item.quantity}
        </span>
      </span>

      <span className="shrink-0 text-sm font-semibold tabular-nums">
        {formatPrice(getCartLineTotal(item))}
      </span>
    </li>
  );
}
