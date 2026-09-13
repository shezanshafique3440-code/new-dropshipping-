import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  /** Small label above the title, e.g. a section or breadcrumb hint. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional call-to-action slot rendered below the description. */
  actions?: ReactNode;
  className?: string;
}

/** Consistent page intro block shared by every route. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-border bg-background-subtle py-14 md:py-20",
        className,
      )}
    >
      <Container className="flex max-w-3xl flex-col items-start gap-4">
        {eyebrow ? (
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium tracking-wide text-foreground-muted uppercase">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        {description ? (
          <p className="text-base leading-relaxed text-foreground-muted">
            {description}
          </p>
        ) : null}
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </Container>
    </div>
  );
}
