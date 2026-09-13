"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { cn } from "@/lib/utils";

export interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Number shown on the trigger and in the drawer header. */
  activeCount: number;
  /** How many products the current filters match. */
  resultCount: number;
  onClearAll: () => void;
  children: ReactNode;
}

/**
 * Mobile filter sheet.
 *
 * Slides up from the bottom, traps nothing away from the keyboard: focus moves
 * to the panel on open and returns to the trigger on close, Escape and the
 * backdrop both dismiss, and the page behind cannot scroll while it is open.
 */
export function FilterDrawer({
  open,
  onOpenChange,
  activeCount,
  resultCount,
  onClearAll,
  children,
}: FilterDrawerProps) {
  const panelId = useId();
  const titleId = `${panelId}-title`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) {
      return;
    }

    panelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const close = () => {
    onOpenChange(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <Button
        ref={triggerRef}
        variant="outline"
        onClick={() => onOpenChange(true)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        className="lg:hidden"
      >
        <Icon name="layers" className="size-4" />
        Filters
        {activeCount > 0 ? (
          <span className="grid size-5 place-items-center rounded-full bg-brand-fill text-[0.6875rem] font-bold text-white">
            {activeCount}
          </span>
        ) : null}
      </Button>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={close}
        className={cn(
          "fixed inset-0 z-70 bg-navy-1000/55 transition-opacity duration-300 ease-[var(--ease-out-soft)] lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!open}
        tabIndex={-1}
        className={cn(
          "fixed inset-x-0 bottom-0 z-80 flex max-h-[86dvh] flex-col rounded-t-3xl border-t border-border bg-surface shadow-floating transition-transform duration-300 ease-[var(--ease-out-soft)] focus:outline-none lg:hidden",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold">
            Filters
            {activeCount > 0 ? (
              <span className="ml-2 text-sm font-normal text-foreground-subtle">
                {activeCount} active
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close filters"
            className="grid size-9 place-items-center rounded-full border border-border text-foreground transition-colors duration-200 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <Icon name="close" className="size-4" strokeWidth={2} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>

        <div className="flex items-center gap-3 border-t border-border-subtle px-5 py-4">
          <Button
            variant="ghost"
            onClick={onClearAll}
            disabled={activeCount === 0}
            className="flex-1"
          >
            Clear all
          </Button>
          <Button onClick={close} className="flex-1">
            Show {resultCount} {resultCount === 1 ? "product" : "products"}
          </Button>
        </div>
      </div>
    </>
  );
}
