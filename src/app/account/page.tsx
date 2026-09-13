import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { PlaceholderPanel } from "@/components/layout/PlaceholderPanel";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your orders, addresses and preferences.",
};

export default function AccountPage() {
  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="Your account"
        description="Order history, saved addresses and preferences will be managed from here."
      />
      <PlaceholderPanel
        title="Planned for this route"
        items={[
          "Sign in and account creation",
          "Order history with fulfilment status",
          "Saved addresses and communication preferences",
        ]}
      />
    </>
  );
}
