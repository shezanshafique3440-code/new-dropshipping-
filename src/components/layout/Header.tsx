import Link from "next/link";

import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavLink } from "@/components/layout/NavLink";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";

/** Sticky storefront header: wordmark, primary navigation and quick actions. */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border glass">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-gradient-brand"
        >
          {siteConfig.name}
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {siteConfig.nav.main.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href} className="px-3 py-2 text-sm">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/shop" size="sm" className="hidden sm:inline-flex">
            Shop now
          </ButtonLink>
          <MobileMenu items={siteConfig.nav.main} />
        </div>
      </Container>
    </header>
  );
}
