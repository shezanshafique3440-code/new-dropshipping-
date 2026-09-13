import { NewsletterSignup } from "@/components/layout/NewsletterSignup";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Wordmark } from "@/components/brand/Wordmark";

const perks = [
  "New drops before they hit the grid",
  "Restock alerts on community favourites",
  "The occasional members-only price",
] as const;

/** Final conversion moment before the footer. */
export function NewsletterSection() {
  return (
    <section aria-labelledby="newsletter-heading" className="section-y">
      <Container>
        <div className="gradient-border reveal relative overflow-hidden rounded-3xl bg-surface shadow-card">
          <span
            aria-hidden="true"
            className="gradient-brand pointer-events-none absolute -top-24 -right-16 size-72 rounded-full opacity-20 blur-3xl"
          />

          <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:p-14">
            <div className="flex flex-col gap-6">
              <Wordmark size="sm" />
              <NewsletterSignup size="feature" headingId="newsletter-heading" />
            </div>

            <ul className="flex flex-col gap-3 border-t border-border-subtle pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-14">
              {perks.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-primary-soft text-brand-primary">
                    <Icon name="check" className="size-3" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm text-foreground-muted">{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
