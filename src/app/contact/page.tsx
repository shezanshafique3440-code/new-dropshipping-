import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { PlaceholderPanel } from "@/components/layout/PlaceholderPanel";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the support team for order, shipping and returns help.",
};

const details = [
  { label: "Email", value: siteConfig.contact.email },
  { label: "Phone", value: siteConfig.contact.phone },
  { label: "Where we are", value: siteConfig.contact.address },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="Contact us"
        description="Questions about an order, shipping or a return? Here is how to reach us."
      />

      <section className="pt-14 md:pt-20">
        <Container size="md">
          <dl className="grid gap-6 sm:grid-cols-3">
            {details.map((detail) => (
              <div key={detail.label} className="flex flex-col gap-1">
                <dt className="type-eyebrow text-brand-primary">
                  {detail.label}
                </dt>
                <dd className="text-sm break-words">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <PlaceholderPanel
        title="Planned for this route"
        items={[
          "Validated contact form with server-side handling",
          "Frequently asked shipping and returns questions",
          "Support hours and expected response times",
        ]}
      />
    </>
  );
}
