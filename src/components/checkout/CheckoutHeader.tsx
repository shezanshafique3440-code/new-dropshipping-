import Link from "next/link";

import { WordmarkLink } from "@/components/brand/Wordmark";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

/**
 * Focused checkout chrome.
 *
 * The storefront navigation is deliberately absent: once a shopper starts
 * checking out, the only routes that matter are back to the cart and home.
 * After a payment the cart link goes too — there is nothing left in it.
 */
export interface CheckoutHeaderProps {
  showCartLink?: boolean;
}

export function CheckoutHeader({ showCartLink = true }: CheckoutHeaderProps) {
  return (
    <header className="border-b border-border-subtle bg-surface">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-18">
        <WordmarkLink size="md" />

        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 text-sm font-medium text-foreground-muted sm:inline-flex">
            <Icon name="lock" className="size-4" />
            Secure checkout
          </span>
          {showCartLink ? (
            <Link
              href="/cart"
              className="link-underline -mx-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              <Icon name="bag" className="size-4" />
              <span className="hidden xs:inline">Back to cart</span>
              <span className="xs:hidden">Cart</span>
            </Link>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
