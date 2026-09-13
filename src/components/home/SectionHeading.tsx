import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Rendered opposite the heading on wide screens, e.g. a "view all" link. */
  action?: ReactNode;
  /** Centres the block instead of aligning it to the start. */
  align?: "start" | "center";
  /** `id` for the heading, so the section can reference it. */
  id?: string;
  className?: string;
}

/** Shared eyebrow + heading + description block used by every home section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "start",
  id,
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        centered
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3",
          centered ? "max-w-2xl items-center" : "max-w-xl",
        )}
      >
        <span className="type-eyebrow text-brand-primary">{eyebrow}</span>
        <h2 id={id} className="type-h2">
          {title}
        </h2>
        {description ? (
          <p className="text-foreground-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
