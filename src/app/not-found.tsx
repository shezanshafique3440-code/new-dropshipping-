import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="section-y">
      <Container size="sm" className="flex flex-col items-start gap-5">
        <span className="type-display w-fit text-gradient-brand">404</span>
        <h1 className="type-h1">Page not found</h1>
        <p className="type-body-lg text-foreground-muted">
          The page you were looking for has moved or never existed. These links
          will get you back on track.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/shop" variant="outline">
            Browse the shop
          </ButtonLink>
        </div>
        <nav aria-label="Helpful links" className="pt-2">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground-muted">
            {siteConfig.nav.main.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="link-underline hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </div>
  );
}
