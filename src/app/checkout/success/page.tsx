import type { Metadata } from "next";

import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { PaymentVerification } from "@/components/checkout/PaymentVerification";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: `Order confirmation — ${siteConfig.name}` },
  description: "Confirmation of your ZYVERO order.",
  // Tied to one shopper's payment session; nothing here belongs in an index.
  robots: { index: false, follow: false },
};

/**
 * Stripe's success URL.
 *
 * Arriving here proves only that a browser followed a link. The page renders
 * a verification state and asks the server to check the payment with Stripe
 * before it confirms anything — see `PaymentVerification`.
 */
export default function CheckoutSuccessPage() {
  return (
    <>
      <CheckoutHeader showCartLink={false} />
      <PaymentVerification />
    </>
  );
}
