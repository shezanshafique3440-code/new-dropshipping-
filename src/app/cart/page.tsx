import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { PlaceholderPanel } from "@/components/layout/PlaceholderPanel";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the items in your bag before checking out.",
};

export default function CartPage() {
  return (
    <>
      <PageHeader
        eyebrow="Bag"
        title="Your cart"
        description="Line items, quantity controls and the order summary land here."
        actions={<ButtonLink href="/shop">Continue shopping</ButtonLink>}
      />
      <PlaceholderPanel
        title="Planned for this route"
        items={[
          "Persistent cart state across sessions",
          "Quantity, variant and removal controls",
          "Order summary with shipping estimates",
        ]}
      />
    </>
  );
}
