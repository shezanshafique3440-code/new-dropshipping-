import NextImage from "next/image";

import { ProductArtwork } from "@/components/product/ProductArtwork";
import { Icon } from "@/components/ui/Icon";
import { IMAGE_SIZES } from "@/lib/product-media";
import { cn } from "@/lib/utils";
import type { ArtTone, ProductArtKey } from "@/types";

/**
 * The small square thumbnail used by the cart, the checkout summary and the
 * order history.
 *
 * These are the places where the product may no longer exist — a receipt
 * outlives the catalogue — so the fallback chain runs all the way down:
 *
 *   a stored image → the generated artwork panel → a neutral bag icon
 *
 * The last step is for an order line whose product was deleted years ago.
 * It is a placeholder and looks like one; nothing here ever renders an
 * <img> whose source might not resolve.
 */

export interface ThumbnailImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductThumbnailProps {
  image?: ThumbnailImage | null;
  art?: ProductArtKey | null;
  tone?: ArtTone | null;
  /** Decorative when the product's name is already read out beside it. */
  decorative?: boolean;
  zoom?: boolean;
  className?: string;
}

export function ProductThumbnail({
  image,
  art,
  tone,
  decorative = false,
  zoom = false,
  className,
}: ProductThumbnailProps) {
  if (image) {
    return (
      <NextImage
        src={image.src}
        alt={decorative ? "" : image.alt}
        width={image.width}
        height={image.height}
        sizes={IMAGE_SIZES.line}
        className={cn("aspect-square size-full object-cover", className)}
        {...(zoom ? { "data-zoom": "" } : {})}
      />
    );
  }

  if (art && tone) {
    return <ProductArtwork art={art} tone={tone} ratio="square" zoom={zoom} className={className} />;
  }

  return (
    <span
      className={cn(
        "grid aspect-square place-items-center bg-surface-muted text-foreground-subtle",
        className,
      )}
    >
      <Icon name="bag" className="size-4" />
      {decorative ? null : <span className="sr-only">No image available</span>}
    </span>
  );
}
