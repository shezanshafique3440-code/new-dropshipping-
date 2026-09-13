import { ButtonLink } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

/**
 * Shown after "Place order".
 *
 * Not a confirmation. There is no order number, no receipt and no email,
 * because nothing was submitted and nothing was charged — saying otherwise
 * would be a lie the shopper acts on. The cart is left untouched.
 */
export function CheckoutPreviewNotice() {
  return (
    <Card variant="elevated" className="animate-fade-up">
      <CardContent className="flex flex-col items-start gap-5 p-6 sm:p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-surface-muted text-brand-primary">
          <Icon name="lock" className="size-5" />
        </span>

        <div className="flex flex-col gap-2">
          <h2 className="type-h2">Checkout preview</h2>
          <p className="type-body-lg text-foreground-muted">
            Payment processing is not connected yet, so{" "}
            <strong className="font-semibold text-foreground">
              no order was placed and no payment was taken
            </strong>
            .
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {[
            "Nothing was charged and no card details were collected.",
            "No order was created and no confirmation email was sent.",
            "Your cart is untouched — everything is still there.",
          ].map((line) => (
            <li
              key={line}
              className="flex items-start gap-2.5 text-sm text-foreground-muted"
            >
              <Icon
                name="check"
                className="mt-0.5 size-4 shrink-0 text-foreground-subtle"
                strokeWidth={2.5}
              />
              {line}
            </li>
          ))}
        </ul>

        <div className="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row">
          <ButtonLink href="/cart" size="lg">
            Return to cart
          </ButtonLink>
          <ButtonLink href="/shop" size="lg" variant="outline">
            Continue shopping
          </ButtonLink>
        </div>
      </CardContent>
    </Card>
  );
}
