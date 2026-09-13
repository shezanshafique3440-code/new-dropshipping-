import { ProductArtwork } from "@/components/product/ProductArtwork";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface CartEmptyProps {
  /** `compact` sits inside the drawer, `full` on the cart page. */
  variant?: "compact" | "full";
  /** Runs when the CTA is followed, so the drawer can close behind it. */
  onNavigate?: () => void;
}

/** Empty-cart state, illustrated with the storefront's own artwork. */
export function CartEmpty({ variant = "compact", onNavigate }: CartEmptyProps) {
  const full = variant === "full";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 text-center",
        full ? "py-16 sm:py-24" : "py-10",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "relative grid place-items-center",
          full ? "w-56" : "w-40",
        )}
      >
        <span className="gradient-brand absolute inset-4 rounded-full opacity-20 blur-3xl" />
        <div className="relative w-full overflow-hidden rounded-3xl border border-border-subtle shadow-card">
          <ProductArtwork art="bag" tone="violet" ratio="square" zoom={false} />
        </div>
      </div>

      <div className="flex max-w-sm flex-col gap-2">
        <h3 className={full ? "type-h2" : "type-h3"}>Your cart is waiting.</h3>
        <p className="text-sm text-foreground-muted">
          Looks like you haven&rsquo;t discovered your next favourite yet.
        </p>
      </div>

      <ButtonLink href="/shop" size={full ? "lg" : "md"} onClick={onNavigate}>
        Explore Products
        <Icon name="arrowRight" className="size-4" strokeWidth={2} />
      </ButtonLink>
    </div>
  );
}
