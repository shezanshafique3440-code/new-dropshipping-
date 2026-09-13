import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface RatingProps {
  /** Score out of 5. */
  value: number;
  /** Number of ratings behind the score. */
  count?: number;
  className?: string;
}

const STARS = [0, 1, 2, 3, 4];

/**
 * Star display for demo rating figures.
 *
 * Two stacked rows — outlines beneath, filled stars clipped to the score —
 * so fractional values render exactly without a glyph per fraction.
 */
export function Rating({ value, count, className }: RatingProps) {
  const clamped = Math.min(5, Math.max(0, value));
  const percent = (clamped / 5) * 100;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        role="img"
        aria-label={`${clamped.toFixed(1)} out of 5`}
        className="relative inline-flex"
      >
        <span className="flex text-border-strong">
          {STARS.map((index) => (
            <Icon key={index} name="star" className="size-3.5" strokeWidth={1.4} />
          ))}
        </span>
        <span
          aria-hidden="true"
          style={{ width: `${percent}%` }}
          className="absolute inset-y-0 left-0 flex overflow-hidden text-warning"
        >
          {STARS.map((index) => (
            <Icon key={index} name="star" className="size-3.5 shrink-0" filled />
          ))}
        </span>
      </span>
      <span className="type-caption text-foreground-subtle">
        {clamped.toFixed(1)}
        {count === undefined ? null : ` (${count})`}
      </span>
    </span>
  );
}
