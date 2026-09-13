import type { ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";
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
        "gradient-hero border-b border-border-subtle py-14 md:py-20",
        className,
      )}
    >
      <Container className="flex max-w-3xl flex-col items-start gap-5">
        {eyebrow ? <Badge variant="brand">{eyebrow}</Badge> : null}
        <h1 className="type-h1">{title}</h1>
        {description ? (
          <p className="type-body-lg text-foreground-muted">{description}</p>
        ) : null}
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </Container>
    </div>
  );
}
