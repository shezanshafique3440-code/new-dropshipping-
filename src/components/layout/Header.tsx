import Link from "next/link";

import { WordmarkLink } from "@/components/brand/Wordmark";
import { CartTrigger } from "@/components/cart/CartTrigger";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavLink } from "@/components/layout/NavLink";
import { SearchTrigger } from "@/components/layout/SearchTrigger";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";

const iconActionStyles =
  "inline-flex size-10 items-center justify-center rounded-full border border-transparent text-foreground-muted transition-[color,background-color,border-color] duration-200 hover:border-border hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary";

/** Quick links that sit beside the search field on desktop. */
const quickActions: ReadonlyArray<{
  href: string;
  icon: IconName;
  label: string;
}> = [{ href: "/account", icon: "user", label: "Account" }];

/**
 * Storefront header: announcement strip, wordmark, primary navigation and the
 * search / account / cart cluster. Sticky and frosted, so content scrolls
 * beneath it without the bar losing legibility.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />

      {/* `relative` anchors the mobile drawer directly beneath the bar. */}
      <div className="glass relative border-x-0 border-t-0 border-b border-border/80">
        <Container className="flex h-16 items-center gap-3 sm:gap-5 lg:h-18">
          <WordmarkLink size="md" className="shrink-0" />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {siteConfig.nav.main.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Wrappers own the breakpoint switch: toggling `display` on the
                trigger itself would collide with its own `inline-flex`. */}
            <div className="hidden xl:block xl:w-56">
              <SearchTrigger />
            </div>
            <div className="xl:hidden">
              <SearchTrigger compact />
            </div>

            {/* Hidden on the narrowest screens, where the drawer carries these
                shortcuts instead. The wrapper owns the breakpoint switch so it
                cannot collide with the links' own `inline-flex`. */}
            <div className="hidden items-center gap-1 sm:flex sm:gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  aria-label={action.label}
                  title={action.label}
                  className={iconActionStyles}
                >
                  <Icon name={action.icon} className="size-[1.15rem]" />
                </Link>
              ))}
            </div>

            {/* Outside the hidden wrapper: the cart stays reachable on phones. */}
            <CartTrigger />

            <MobileMenu items={siteConfig.nav.main} />
          </div>
        </Container>
      </div>
    </header>
  );
}
