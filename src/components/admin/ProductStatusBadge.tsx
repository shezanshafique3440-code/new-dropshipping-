import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import type { ProductStatus } from "@/server/catalog/repository";

/**
 * Where a product is in its lifecycle, as a word.
 *
 * Colour reinforces the label; it never carries it alone. "Draft" and
 * "Archived" both mean invisible to shoppers, and the badge says which.
 */
const STATUS: Record<ProductStatus, { label: string; variant: BadgeVariant }> = {
  draft: { label: "Draft", variant: "limited" },
  published: { label: "Published", variant: "success" },
  archived: { label: "Archived", variant: "neutral" },
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const { label, variant } = STATUS[status];
  return (
    <Badge variant={variant}>
      <span className="sr-only">Status: </span>
      {label}
    </Badge>
  );
}
