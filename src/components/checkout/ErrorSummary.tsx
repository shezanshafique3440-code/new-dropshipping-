"use client";

import { Icon } from "@/components/ui/Icon";

export interface ErrorSummaryProps {
  /** Field errors in display order, each with the input's id to focus. */
  errors: ReadonlyArray<{ field: string; message: string }>;
  onFocusField: (field: string) => void;
}

/**
 * Accessible summary of everything wrong with the current step.
 *
 * Announced on appearance and focusable, so a screen-reader user hears the
 * whole list rather than discovering errors field by field.
 */
export function ErrorSummary({ errors, onFocusField }: ErrorSummaryProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      tabIndex={-1}
      data-error-summary
      className="animate-fade flex flex-col gap-2 rounded-2xl border border-danger/40 bg-danger/5 p-4"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-danger">
        <Icon name="close" className="size-4" strokeWidth={2.5} />
        {errors.length === 1
          ? "There is one thing to fix"
          : `There are ${errors.length} things to fix`}
      </p>
      <ul className="flex flex-col gap-1 pl-6">
        {errors.map((error) => (
          <li key={error.field}>
            <button
              type="button"
              onClick={() => onFocusField(error.field)}
              className="type-caption text-left font-medium text-danger underline decoration-danger/50 underline-offset-4 transition-colors duration-200 hover:decoration-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              {error.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
