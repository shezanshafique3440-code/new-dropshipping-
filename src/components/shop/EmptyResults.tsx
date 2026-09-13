import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export interface EmptyResultsProps {
  /** The search term, echoed back so the message is specific. */
  query: string;
  onClearFilters: () => void;
}

/** Shown when no product matches the current search and filters. */
export function EmptyResults({ query, onClearFilters }: EmptyResultsProps) {
  const trimmed = query.trim();

  return (
    <Card variant="muted" className="w-full">
      <CardContent className="flex flex-col items-center gap-5 py-14 text-center sm:py-20">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface text-brand-primary shadow-soft">
          <Icon name="search" className="size-6" />
        </span>

        <div className="flex max-w-md flex-col gap-2">
          <h3 className="type-h3">
            {trimmed
              ? `Nothing matched “${trimmed}”.`
              : "Nothing matched your filters."}
          </h3>
          <p className="text-sm text-foreground-muted">
            Try a different search or clear some filters — the full catalogue is
            only a click away.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={onClearFilters}>Clear filters</Button>
          <ButtonLink href="/shop" variant="outline">
            Browse all
          </ButtonLink>
        </div>
      </CardContent>
    </Card>
  );
}
