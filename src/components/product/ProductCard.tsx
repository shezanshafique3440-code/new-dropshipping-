import Link from "next/link";

import { FavoriteButton } from "@/components/product/FavoriteButton";
import { ProductArtwork } from "@/components/product/ProductArtwork";
import { Rating } from "@/components/product/Rating";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product, ProductBadgeTone } from "@/types";

/** Maps merchandising tone to the badge styling defined in Step 2. */
const badgeVariants: Record<ProductBadgeTone, BadgeVariant> = {
  new: "new",
  trending: "trending",
  bestseller: "bestseller",
  popular: "brand",
  sale: "sale",
};

export interface ProductCardProps {
  product: Product;
  /** Shows the demo rating row. */
  showRating?: boolean;
  className?: string;
}

/**
 * Product tile used across the homepage.
 *
 * The whole card is a link to the product's destination; the favourite button
 * sits above it as a separate control rather than nested inside the link.
 */
export function ProductCard({
  product,
  showRating = false,
  className,
}: ProductCardProps) {
  const { name, category, href, price, compareAtPrice, badge, rating, art, tone } =
    product;
  const discount =
    compareAtPrice === undefined
      ? undefined
      : Math.round(((compareAtPrice - price) / compareAtPrice) * 100);

  return (
    <Card
      as="article"
      variant="default"
      interactive
      className={cn("group relative flex h-full flex-col overflow-hidden", className)}
    >
      <div className="relative">
        <ProductArtwork art={art} tone={tone} />

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="flex flex-wrap gap-1.5">
            {badge ? (
              <Badge variant={badgeVariants[badge.tone]} size="sm">
                {badge.label}
              </Badge>
            ) : null}
            {discount === undefined ? null : (
              <Badge variant="sale" size="sm">{`-${discount}%`}</Badge>
            )}
          </span>
          {/* `z-10` lifts the control above the stretched link's ::after,
              which otherwise covers the whole card and swallows the click. */}
          <span className="pointer-events-auto relative z-10">
            <FavoriteButton productName={name} />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <p className="type-caption text-foreground-subtle">{category}</p>

        <h3 className="text-sm leading-snug font-semibold sm:text-base">
          {/* Stretched link: the whole card is clickable, the heart is not. */}
          <Link
            href={href}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {name}
          </Link>
        </h3>

        {showRating && rating ? (
          <Rating value={rating.value} count={rating.count} />
        ) : null}

        <p className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-base font-bold sm:text-lg">
            {formatPrice(price)}
          </span>
          {compareAtPrice === undefined ? null : (
            <span className="type-caption text-foreground-subtle line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </p>
      </div>
    </Card>
  );
}
