import { ProductArtwork } from "@/components/product/ProductArtwork";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

/** Shown when someone reaches checkout with nothing to buy. */
export function CheckoutEmptyState() {
  return (
    <Container size="sm" className="section-y">
      <div className="flex flex-col items-center gap-6 text-center">
        <div aria-hidden="true" className="relative grid w-48 place-items-center">
          <span className="gradient-brand absolute inset-4 rounded-full opacity-20 blur-3xl" />
          <div className="relative w-full overflow-hidden rounded-3xl border border-border-subtle shadow-card">
            <ProductArtwork art="bag" tone="violet" ratio="square" zoom={false} />
          </div>
        </div>

        <div className="flex max-w-sm flex-col gap-2">
          <h1 className="type-h2">There is nothing to check out.</h1>
          <p className="text-sm text-foreground-muted">
            Your cart is empty, so there is no order to review. Add something
            you like and checkout will be waiting.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <ButtonLink href="/shop" size="lg">
            Continue shopping
            <Icon name="arrowRight" className="size-4" strokeWidth={2} />
          </ButtonLink>
          <ButtonLink href="/cart" size="lg" variant="outline">
            Return to cart
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
