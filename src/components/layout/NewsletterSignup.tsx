import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";

/**
 * Newsletter placeholder. Rendered as static markup rather than a form: there
 * is no endpoint yet, so the controls are inert and say so instead of
 * pretending to subscribe anyone.
 */
export function NewsletterSignup() {
  const { title, description, note } = siteConfig.newsletter;

  return (
    /* `min-w-0` keeps the field from forcing its intrinsic width onto the
       footer grid track at very narrow viewports. */
    <section
      aria-labelledby="newsletter-title"
      className="flex min-w-0 flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <h2 id="newsletter-title" className="text-sm font-semibold">
          {title}
        </h2>
        <p className="type-caption text-foreground-muted">{description}</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex min-w-0 items-center gap-2 rounded-full border border-border bg-surface p-1 pl-4">
          <Icon
            name="mail"
            className="size-[1.15rem] shrink-0 text-foreground-subtle"
          />
          <input
            type="email"
            size={1}
            readOnly
            aria-disabled="true"
            aria-describedby="newsletter-note"
            placeholder="you@example.com"
            className="h-9 min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
          />
          <button
            type="button"
            aria-disabled="true"
            aria-describedby="newsletter-note"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-brand-fill px-4 text-[0.8125rem] font-semibold text-white opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Join
            <Icon name="arrowRight" className="size-3.5" strokeWidth={2} />
          </button>
        </div>
        <p id="newsletter-note" className="type-caption text-foreground-subtle">
          {note}
        </p>
      </div>
    </section>
  );
}
