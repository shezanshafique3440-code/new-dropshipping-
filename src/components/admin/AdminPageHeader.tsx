import type { ReactNode } from "react";

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  /** Controls aligned with the heading — a link back, a primary action. */
  actions?: ReactNode;
}

/**
 * The one `h1` on an admin page, with room for its controls.
 *
 * Plainer than the storefront's `PageHeader`: no gradient, no eyebrow badge.
 * An operations screen is read many times a day, and the heading should get
 * out of the way of the data underneath it.
 */
export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border-subtle pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="type-h3">{title}</h1>
        {description ? (
          <p className="text-sm text-foreground-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
