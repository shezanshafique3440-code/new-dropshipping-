"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";

/**
 * Body of the 404 page.
 *
 * A client component so the copy can match the section the visitor was in —
 * an unknown `/shop/<slug>` reads as a missing product rather than a generic
 * missing page. The status code is still set by the framework.
 */
export function NotFoundContent() {
  const pathname = usePathname();
  const isProduct = pathname.startsWith("/shop/");

  return (
    <div className="section-y">
      <Container size="sm" className="flex flex-col items-start gap-5">
        <span className="type-display w-fit text-gradient-brand">404</span>

        <h1 className="type-h1">
          {isProduct ? "Product not found." : "Page not found"}
        </h1>

        <p className="type-body-lg text-foreground-muted">
          {isProduct
            ? "That product either moved or never existed. The rest of the catalogue is still waiting."
            : "The page you were looking for has moved or never existed. These links will get you back on track."}
        </p>

        <div className="flex flex-wrap gap-3">
          {isProduct ? (
            <>
              <ButtonLink href="/shop">
                Back to Shop
                <Icon name="arrowRight" className="size-4" strokeWidth={2} />
              </ButtonLink>
              <ButtonLink href="/" variant="outline">
                Go home
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/">Back to home</ButtonLink>
              <ButtonLink href="/shop" variant="outline">
                Browse the shop
              </ButtonLink>
            </>
          )}
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
