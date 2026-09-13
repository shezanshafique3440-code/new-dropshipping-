"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface FavoriteButtonProps {
  /** Product name, used to build an accessible label. */
  productName: string;
  className?: string;
}

/**
 * Local favourite toggle.
 *
 * Visual state only — nothing is persisted. A wishlist that survives reloads
 * needs the account work from a later step.
 */
export function FavoriteButton({
  productName,
  className,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={favorited}
      aria-label={
        favorited
          ? `Remove ${productName} from favourites`
          : `Save ${productName} to favourites`
      }
      onClick={() => setFavorited((value) => !value)}
      className={cn(
        "grid size-9 place-items-center rounded-full border transition-[color,background-color,border-color,transform] duration-200 active:scale-90",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
        favorited
          ? "border-transparent bg-brand-highlight-soft text-brand-highlight"
          : "border-border bg-surface/80 text-foreground-subtle hover:border-border-highlight hover:text-brand-highlight",
        className,
      )}
    >
      <Icon name="heart" className="size-4" filled={favorited} strokeWidth={1.5} />
    </button>
  );
}
