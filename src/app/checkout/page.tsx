import type { Metadata } from "next";

import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { CheckoutShell } from "@/components/checkout/CheckoutShell";
import { siteConfig } from "@/config/site";
import { getStripeMode, isPaymentConfigured } from "@/server/payments/config";
import type { PaymentMode } from "@/types";

export const metadata: Metadata = {
  title: { absolute: `Checkout — ${siteConfig.name}` },
  description: "Complete your ZYVERO order.",
  // A private, session-specific flow: useful to a shopper, not to a crawler.
  robots: { index: false, follow: false },
};

/**
 * Checkout route.
 *
 * Rendered per request so the payment mode reflects the running server rather
 * than whatever was configured at build time. Only the mode crosses to the
 * client — never a key.
 */
export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const paymentMode: PaymentMode = isPaymentConfigured()
    ? getStripeMode()
    : "unconfigured";

  return (
    <>
      <CheckoutHeader />
      <CheckoutShell
        paymentMode={paymentMode}
        cancelled={params.payment === "cancelled"}
      />
    </>
  );
}
