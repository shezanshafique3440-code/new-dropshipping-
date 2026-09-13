"use client";

import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Deliberately permissive: enough to catch typos, not to police addresses. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status = "idle" | "error" | "success";

export interface NewsletterSignupProps {
  /** `compact` for the footer column, `feature` for the homepage CTA. */
  size?: "compact" | "feature";
  /** Renders the heading and description above the field. */
  showHeading?: boolean;
  /** Stable id for the heading, so a parent section can reference it. */
  headingId?: string;
  className?: string;
}

/**
 * Newsletter sign-up.
 *
 * The interaction is real — validation, success and reset all work — but there
 * is no mailing list behind it yet, and the copy says so rather than implying
 * an address was captured. Wiring a provider is a later step.
 */
export function NewsletterSignup({
  size = "compact",
  showHeading = true,
  headingId,
  className,
}: NewsletterSignupProps) {
  const { title, description } = siteConfig.newsletter;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const fieldId = useId();
  const messageId = `${fieldId}-message`;
  const titleId = headingId ?? `${fieldId}-title`;
  const feature = size === "feature";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(EMAIL_PATTERN.test(email.trim()) ? "success" : "error");
  };

  const reset = () => {
    setEmail("");
    setStatus("idle");
  };

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col",
        feature ? "gap-6" : "gap-4",
        className,
      )}
    >
      {showHeading ? (
        <div className={cn("flex flex-col gap-1.5", feature && "gap-3")}>
          <h2
            id={titleId}
            className={cn(feature ? "type-h2" : "text-sm font-semibold")}
          >
            {feature ? "Stay in the Loop." : title}
          </h2>
          <p
            className={cn(
              "text-foreground-muted",
              feature ? "type-body-lg" : "type-caption",
            )}
          >
            {feature
              ? "Get new drops, trending finds, and occasional ZYVERO surprises."
              : description}
          </p>
        </div>
      ) : null}

      {status === "success" ? (
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl border border-border bg-surface p-4",
            feature && "p-5",
          )}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-primary-soft text-brand-primary">
            <Icon name="check" className="size-4" strokeWidth={2} />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-sm font-semibold">That address looks good.</p>
            <p className="type-caption text-foreground-muted">
              Sign-ups open at launch, so nothing has been sent or stored yet.
            </p>
            <button
              type="button"
              onClick={reset}
              className="link-underline mt-1 w-fit text-sm font-semibold text-brand-primary"
            >
              Use a different address
            </button>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div
            className={cn(
              "flex min-w-0 items-center gap-2 rounded-full border bg-surface p-1 pl-4 transition-colors duration-200",
              status === "error" ? "border-danger" : "border-border",
              feature && "sm:p-1.5 sm:pl-5",
            )}
          >
            <label htmlFor={fieldId} className="sr-only">
              Your email address
            </label>
            <Icon
              name="mail"
              className="size-[1.15rem] shrink-0 text-foreground-subtle"
            />
            <input
              id={fieldId}
              type="email"
              size={1}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status === "error") {
                  setStatus("idle");
                }
              }}
              autoComplete="email"
              placeholder="Your email address"
              aria-invalid={status === "error"}
              aria-describedby={messageId}
              className={cn(
                "min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none",
                feature ? "h-10 sm:h-11 sm:text-base" : "h-9",
              )}
            />
            <Button
              type="submit"
              size={feature ? "md" : "sm"}
              variant={feature ? "gradient" : "primary"}
              className="shrink-0"
            >
              Join{feature ? " ZYVERO" : ""}
              <Icon name="arrowRight" className="size-3.5" strokeWidth={2} />
            </Button>
          </div>

          <p
            id={messageId}
            aria-live="polite"
            className={cn(
              "type-caption pl-1",
              status === "error" ? "text-danger" : "text-foreground-subtle",
            )}
          >
            {status === "error"
              ? "Enter a valid email address, e.g. you@example.com."
              : "Preview form — no mailing list is connected yet."}
          </p>
        </form>
      )}
    </div>
  );
}
