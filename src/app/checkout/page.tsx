import type { Metadata } from "next";

import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { CheckoutShell } from "@/components/checkout/CheckoutShell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: `Checkout — ${siteConfig.name}` },
  description: "Complete your ZYVERO order.",
  // A private, session-specific flow: useful to a shopper, not to a crawler.
  robots: { index: false, follow: false },
};

/**
 * Checkout route.
 *
 * The storefront header and footer are hidden here by `SiteChrome`; this page
 * renders its own focused chrome. Only the flow itself needs client state.
 */
export default function CheckoutPage() {
  return (
    <>
      <CheckoutHeader />
      <CheckoutShell />
    </>
  );
}
