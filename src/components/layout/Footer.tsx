import Link from "next/link";

import { Wordmark } from "@/components/brand/Wordmark";
import { NewsletterSignup } from "@/components/layout/NewsletterSignup";
import { Container } from "@/components/ui/Container";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { siteConfig } from "@/config/site";

/** Site-wide footer: brand, navigation columns, newsletter and legal links. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid gap-12 py-14 md:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
        <div className="flex min-w-0 flex-col gap-5">
          <Link href="/" aria-label={`${siteConfig.name} — home`} className="w-fit rounded-xl">
            <Wordmark size="md" />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-foreground-muted">
            {siteConfig.shortDescription}
          </p>
          <ul className="flex flex-wrap items-center gap-2">
            {siteConfig.social.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-border text-foreground-muted transition-[color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-border-highlight hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <SocialIcon name={social.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-8 sm:grid-cols-3">
          {siteConfig.nav.footer.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-semibold">{group.title}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {group.items.map((item) => (
                  <li key={`${group.title}-${item.label}`}>
                    <Link
                      href={item.href}
                      className="link-underline text-sm text-foreground-muted hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <NewsletterSignup />
      </Container>

      <div className="border-t border-border-subtle">
        <Container className="flex flex-col-reverse items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="type-caption text-foreground-subtle">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {siteConfig.nav.legal.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="type-caption text-foreground-subtle transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="type-caption text-foreground-subtle">
              Prices in {siteConfig.currency.code}
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
