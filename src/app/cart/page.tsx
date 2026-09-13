import type { Metadata } from "next";

import { CartPageContent } from "@/components/cart/CartPageContent";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: `Your Cart — ${siteConfig.name}` },
  description: "Review the items in your ZYVERO cart before you continue.",
  // A personal, session-specific page: useful to a shopper, not to a crawler.
  robots: { index: false, follow: true },
};

/**
 * Cart route.
 *
 * The shell is server-rendered; only the cart body needs client state.
 */
export default function CartPage() {
  return (
    <>
      <div className="gradient-hero border-b border-border-subtle">
        <Container className="flex flex-col items-start gap-3 py-12 md:py-14">
          <h1 className="type-h1">Your Cart</h1>
          <p className="type-body-lg max-w-xl text-foreground-muted">
            Review your selections before you continue.
          </p>
        </Container>
      </div>

      <CartPageContent />
    </>
  );
}
