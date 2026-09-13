import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface SearchTriggerProps {
  /** Compact icon-only form for narrow layouts. */
  compact?: boolean;
  className?: string;
}

/**
 * Search entry point. Presentation only — the search experience arrives with
 * the catalogue, so the control announces itself as not yet available.
 */
export function SearchTrigger({ compact = false, className }: SearchTriggerProps) {
  const shared =
    "inline-flex items-center gap-2 rounded-full border border-border text-foreground-subtle transition-colors duration-200 hover:border-border-strong hover:text-foreground-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary aria-disabled:cursor-not-allowed";

  if (compact) {
    return (
      <button
        type="button"
        aria-disabled="true"
        aria-label="Search — available soon"
        title="Search — available soon"
        className={cn(shared, "size-10 justify-center", className)}
      >
        <Icon name="search" className="size-[1.15rem]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-disabled="true"
      title="Search — available soon"
      className={cn(
        shared,
        "h-10 w-full bg-surface-muted/60 px-4 text-left text-sm",
        className,
      )}
    >
      <Icon name="search" className="size-[1.15rem] shrink-0" />
      <span className="truncate">Search products</span>
    </button>
  );
}
