import NextImage from "next/image";

import { ProductArtwork } from "@/components/product/ProductArtwork";
import { pickImage, type WithGallery } from "@/lib/product-media";
import { cn } from "@/lib/utils";
import type { ArtTone, ProductArtKey, ProductMedia } from "@/types";

/**
 * One product image, with the artwork panel behind it.
 *
 * A Server Component: it picks an image, renders `next/image` and does
 * nothing a browser is needed for. The optimiser stays on — resizing and
 * format negotiation are the reason to use `next/image` at all, and turning
 * them off to make a URL work would be solving the wrong problem.
 *
 * When the gallery is empty this renders the generated `ProductArtwork`
 * panel, which is visibly an illustration. Nothing here ever describes an
 * illustration as a photograph, and nothing renders an <img> with no source.
 */

export type ProductImageRatio = "square" | "portrait" | "wide";

const ratioStyles: Record<ProductImageRatio, string> = {
  square: "aspect-square",
  portrait: "aspect-4/5",
  wide: "aspect-3/2",
};

/** Panel tints, so an image loading over the panel does not flash white. */
const toneStyles: Record<ArtTone, string> = {
  violet: "art-violet",
  blue: "art-blue",
  cyan: "art-cyan",
  magenta: "art-magenta",
  neutral: "art-neutral",
};

export interface ProductImageProps {
  product: WithGallery & { art: ProductArtKey; tone: ArtTone };
  /** Show this gallery entry instead of the primary one. */
  image?: ProductMedia | null;
  ratio?: ProductImageRatio;
  /** Required: see `IMAGE_SIZES` for the layouts already worked out. */
  sizes: string;
  /** Only for an image above the fold — at most one or two per page. */
  priority?: boolean;
  /** Participates in the `hover-zoom` utility on an ancestor. */
  zoom?: boolean;
  /**
   * Overrides the alt text.
   *
   * Only for a decorative repeat of an image already described nearby — pass
   * `""` there. Left alone, the image's own alt text is used.
   */
  alt?: string;
  className?: string;
  /** Extra classes for the <img> itself. */
  imageClassName?: string;
}

export function ProductImage({
  product,
  image,
  ratio = "portrait",
  sizes,
  priority = false,
  zoom = true,
  alt,
  className,
  imageClassName,
}: ProductImageProps) {
  const chosen = image ?? pickImage(product);

  if (!chosen) {
    return (
      <ProductArtwork
        art={product.art}
        tone={product.tone}
        ratio={ratio}
        zoom={zoom}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        ratioStyles[ratio],
        toneStyles[product.tone],
        className,
      )}
    >
      <NextImage
        src={chosen.src}
        alt={alt ?? chosen.alt}
        width={chosen.width}
        height={chosen.height}
        sizes={sizes}
        priority={priority}
        className={cn("size-full object-cover", imageClassName)}
        {...(zoom ? { "data-zoom": "" } : {})}
      />
    </div>
  );
}
