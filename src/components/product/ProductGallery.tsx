"use client";

import NextImage from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { ProductArtwork } from "@/components/product/ProductArtwork";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { IMAGE_SIZES } from "@/lib/product-media";
import { cn } from "@/lib/utils";
import type { ArtTone, ProductArtKey, ProductMedia } from "@/types";

/**
 * The product detail page's gallery.
 *
 * A Client Component because it is genuinely interactive: it tracks which
 * image is showing, moves between them from the keyboard, and opens a
 * full-size view. Everything it needs arrives as props, so the page around it
 * stays a Server Component.
 *
 * The frames are a scroll-snap row rather than a JavaScript carousel. That
 * means a touch swipe is the browser's own scrolling — smooth, interruptible,
 * and working before the component hydrates — and the thumbnails simply
 * scroll it. With JavaScript off the gallery is still a scrollable strip of
 * every image, which is a worse experience but not a broken one.
 */

export interface ProductGalleryProps {
  images: readonly ProductMedia[];
  productName: string;
  /** Drawn when the product has no images yet. */
  art: ProductArtKey;
  tone: ArtTone;
}

const toneStyles: Record<ArtTone, string> = {
  violet: "art-violet",
  blue: "art-blue",
  cyan: "art-cyan",
  magenta: "art-magenta",
  neutral: "art-neutral",
};

export function ProductGallery({ images, productName, art, tone }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const frames = useRef<HTMLDivElement>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const groupId = useId();

  const count = images.length;

  /** Scrolls the strip to one frame. Selection follows from the scroll. */
  const show = useCallback((index: number) => {
    const strip = frames.current;
    const frame = strip?.children[index];
    if (!strip || !(frame instanceof HTMLElement)) return;
    strip.scrollTo({ left: frame.offsetLeft - strip.offsetLeft, behavior: "smooth" });
  }, []);

  /**
   * Selection is read from the scroll position, not written by the click.
   *
   * One source of truth: a swipe and a thumbnail click both end as a scroll,
   * so the highlighted thumbnail can never disagree with the visible frame.
   */
  useEffect(() => {
    const strip = frames.current;
    if (!strip) return;

    let queued = 0;
    const measure = () => {
      queued = 0;
      const width = strip.clientWidth;
      if (width === 0) return;
      setActive(Math.max(0, Math.min(count - 1, Math.round(strip.scrollLeft / width))));
    };
    const onScroll = () => {
      // Coalesced to one read per frame: a swipe fires scroll events far
      // faster than there is any point re-rendering.
      queued ||= window.requestAnimationFrame(measure);
    };

    strip.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => {
      strip.removeEventListener("scroll", onScroll);
      if (queued) window.cancelAnimationFrame(queued);
    };
  }, [count]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (zoomed && !element.open) {
      // `showModal` brings the focus trap, the backdrop and Escape with it —
      // all three would otherwise have to be re-implemented, worse.
      element.showModal();
    } else if (!zoomed && element.open) {
      element.close();
    }
  }, [zoomed]);

  if (count === 0) {
    return (
      <div className="flex flex-col gap-3">
        <ProductArtwork art={art} tone={tone} ratio="square" zoom={false} className="rounded-2xl" />
        <p className="type-caption text-foreground-subtle">
          Photography for this product is on its way. The panel above is an illustration.
        </p>
      </div>
    );
  }

  /** Roving arrow keys across the thumbnails, as the tabs pattern expects. */
  const onThumbKeyDown = (event: React.KeyboardEvent, index: number) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) {
      if (event.key !== "Home" && event.key !== "End") return;
    }
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? count - 1
          : (index + step + count) % count;
    thumbs.current[next]?.focus();
    show(next);
  };

  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <div
          ref={frames}
          // `tabIndex` because a scroll container with overflow is only
          // keyboard-scrollable when it can take focus.
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label={`${productName} images`}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              id={`${groupId}-frame-${index}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}: ${image.label}`}
              className={cn(
                "relative aspect-square w-full shrink-0 snap-center overflow-hidden",
                toneStyles[tone],
              )}
            >
              <NextImage
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes={IMAGE_SIZES.detail}
                // Only the first frame is above the fold; the rest are one
                // swipe away and should not compete for bandwidth with it.
                priority={index === 0}
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="absolute right-3 bottom-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-sm backdrop-blur transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          <Icon name="search" className="size-5" />
          <span className="sr-only">View {current?.label ?? "image"} full size</span>
        </button>
      </div>

      {count > 1 ? (
        <ul className="flex flex-wrap gap-2" aria-label={`${productName} image thumbnails`}>
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                ref={(node) => {
                  thumbs.current[index] = node;
                }}
                onClick={() => show(index)}
                onKeyDown={(event) => onThumbKeyDown(event, index)}
                aria-current={index === active}
                aria-controls={`${groupId}-frame-${index}`}
                className={cn(
                  "relative block size-20 overflow-hidden rounded-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:size-24",
                  toneStyles[tone],
                  index === active
                    ? "ring-2 ring-brand-primary ring-offset-2 ring-offset-surface"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                <NextImage
                  src={image.src}
                  // The frame it selects already carries the description, so
                  // repeating it here would make a screen reader read every
                  // image twice. The label is the accessible name instead.
                  alt=""
                  width={image.width}
                  height={image.height}
                  sizes={IMAGE_SIZES.thumbnail}
                  className="size-full object-cover"
                />
                <span className="sr-only">
                  Show {image.label}, image {index + 1} of {count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="type-caption text-foreground-subtle">{siteConfig.media.disclosure}</p>

      <dialog
        ref={dialog}
        onClose={() => setZoomed(false)}
        onClick={(event) => {
          // Clicking the backdrop lands on the dialog itself, not its content.
          if (event.target === dialog.current) setZoomed(false);
        }}
        className="m-auto max-h-[90dvh] max-w-[92vw] rounded-2xl bg-surface p-0 backdrop:bg-black/70"
      >
        {zoomed && current ? (
          <figure className="flex flex-col">
            <NextImage
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="92vw"
              className="h-auto max-h-[78dvh] w-auto object-contain"
            />
            <figcaption className="flex items-center justify-between gap-4 p-4">
              <span className="type-caption text-foreground-subtle">{current.label}</span>
              <button
                type="button"
                onClick={() => setZoomed(false)}
                className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                Close
              </button>
            </figcaption>
          </figure>
        ) : null}
      </dialog>
    </div>
  );
}
