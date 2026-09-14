"use client";

import { useId, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Form primitives.
 *
 * Every control gets a real `<label>`, an optional hint and an error slot, all
 * wired with `aria-describedby` and `aria-invalid`. Placeholders are never
 * used in place of labels.
 */

const controlStyles =
  "w-full min-w-0 rounded-xl border bg-surface px-4 text-base text-foreground transition-[border-color,box-shadow] duration-200 " +
  "placeholder:text-foreground-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary " +
  "disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: (aria: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => ReactNode;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  optional = false,
  className,
  children,
}: FieldShellProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("grid min-w-0 grid-rows-subgrid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional ? (
          <span className="ml-1.5 text-xs font-normal text-foreground-subtle">
            (optional)
          </span>
        ) : (
          <span aria-hidden="true" className="ml-1 text-danger">
            *
          </span>
        )}
      </label>

      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
      })}

      {hint || error ? (
        <div className="flex flex-col gap-1.5">
          {hint ? (
            <p id={hintId} className="type-caption text-foreground-subtle">
              {hint}
            </p>
          ) : null}

          {error ? (
            <p
              id={errorId}
              className="type-caption flex items-start gap-1.5 font-medium text-danger"
            >
              <span aria-hidden="true">•</span>
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export interface FieldRowProps {
  className?: string;
  children: ReactNode;
}

/**
 * Lays fields out side by side with their labels, controls and messages on
 * shared rows, so a label that wraps onto a second line (a long
 * country-specific region label, say) does not push its own input out of line
 * with its neighbours. `grid-rows-subgrid` inside {@link FieldShell} does the
 * alignment; where it is unsupported each field simply stacks as usual.
 */
export function FieldRow({ className, children }: FieldRowProps) {
  return (
    <div
      className={cn(
        "grid grid-rows-[auto_auto_auto] gap-5 *:row-span-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
}

export function TextField({
  label,
  hint,
  error,
  optional,
  className,
  ...props
}: TextFieldProps) {
  const id = useId();

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={className}
    >
      {(aria) => (
        <input
          {...aria}
          {...props}
          size={1}
          className={cn(
            controlStyles,
            "h-12 sm:h-11",
            error
              ? "border-danger focus-visible:border-danger"
              : "border-border hover:border-border-strong focus-visible:border-brand-primary",
          )}
        />
      )}
    </FieldShell>
  );
}

export interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className" | "type"> {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
}

/**
 * Password input with an accessible show/hide control.
 *
 * The toggle is a real button with its own label, so a screen reader
 * announces what it does and its state; focus stays where it was, so
 * revealing the password mid-typing does not lose the caret. The value is
 * only ever in the input — nothing here logs or copies it.
 */
export function PasswordField({
  label,
  hint,
  error,
  className,
  ...props
}: PasswordFieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={className}>
      {(aria) => (
        <div className="relative">
          <input
            {...aria}
            {...props}
            type={revealed ? "text" : "password"}
            className={cn(
              controlStyles,
              "h-12 pr-24 sm:h-11",
              error
                ? "border-danger focus-visible:border-danger"
                : "border-border hover:border-border-strong focus-visible:border-brand-primary",
            )}
          />
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            aria-pressed={revealed}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute inset-y-1.5 right-1.5 inline-flex items-center rounded-full px-3.5 text-xs font-semibold text-foreground-muted transition-colors duration-200 hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            {revealed ? "Hide" : "Show"}
          </button>
        </div>
      )}
    </FieldShell>
  );
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "className"> {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

/** Native select: correct keyboard behaviour and the platform picker on touch. */
export function SelectField({
  label,
  hint,
  error,
  optional,
  className,
  children,
  ...props
}: SelectFieldProps) {
  const id = useId();

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={className}
    >
      {(aria) => (
        <div className="relative">
          <select
            {...aria}
            {...props}
            className={cn(
              controlStyles,
              "h-12 appearance-none pr-10 sm:h-11",
              error
                ? "border-danger focus-visible:border-danger"
                : "border-border hover:border-border-strong focus-visible:border-brand-primary",
            )}
          >
            {children}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-foreground-subtle"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      )}
    </FieldShell>
  );
}
