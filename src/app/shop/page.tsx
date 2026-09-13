import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { PlaceholderPanel } from "@/components/layout/PlaceholderPanel";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the full catalogue — collections, filters and product detail pages.",
};

export default function ShopPage() {
  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Shop"
        description="The product grid, collection filters and detail pages live here."
      />
      <PlaceholderPanel
        title="Planned for this route"
        items={[
          "Responsive product grid with hover previews",
          "Collection and attribute filtering",
          "Product detail pages with variants and galleries",
        ]}
      />
    </>
  );
}
