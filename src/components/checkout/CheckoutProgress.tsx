"use client";

import { checkoutSteps, canVisitStep, stepIndex } from "@/lib/checkout";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import type { CheckoutStepId } from "@/types";

export interface CheckoutProgressProps {
  current: CheckoutStepId;
  /** Furthest step reached, which is as far back as the shopper may jump. */
  furthest: CheckoutStepId;
  onNavigate: (step: CheckoutStepId) => void;
}

/**
 * Step indicator.
 *
 * An ordered list on desktop and a compact "Step n of 4" on phones. Completed
 * steps are buttons; steps that are not yet reachable are inert text, so the
 * shopper cannot skip validation by clicking ahead.
 */
export function CheckoutProgress({
  current,
  furthest,
  onNavigate,
}: CheckoutProgressProps) {
  const currentIndex = stepIndex(current);
  const total = checkoutSteps.length;
  const currentStep = checkoutSteps[currentIndex]!;

  return (
    <nav aria-label="Checkout progress">
      {/* Compact form for phones. */}
      <div className="flex flex-col gap-2 sm:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold">{currentStep.label}</p>
          <p className="type-caption text-foreground-subtle">
            Step {currentIndex + 1} of {total}
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={currentIndex + 1}
          aria-valuetext={`Step ${currentIndex + 1} of ${total}: ${currentStep.label}`}
          className="flex gap-1.5"
        >
          {checkoutSteps.map((step, index) => (
            <span
              key={step.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                index < currentIndex && "bg-brand-fill",
                index === currentIndex && "gradient-brand",
                index > currentIndex && "bg-surface-muted",
              )}
            />
          ))}
        </div>
      </div>

      {/* Full indicator from small tablets up. */}
      <ol className="hidden sm:flex sm:items-center sm:gap-2">
        {checkoutSteps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const reachable = canVisitStep(step.id, furthest) && !active;

          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors duration-300",
                    done && "bg-brand-fill text-white",
                    active && "gradient-brand text-white shadow-glow-primary",
                    !done && !active && "bg-surface-muted text-foreground-subtle",
                  )}
                >
                  {done ? (
                    <Icon name="check" className="size-3.5" strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </span>

                {reachable ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(step.id)}
                    className="link-underline -my-2 truncate py-2 text-sm font-semibold text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    {step.label}
                  </button>
                ) : (
                  <span
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "truncate text-sm font-semibold",
                      active ? "text-foreground" : "text-foreground-subtle",
                    )}
                  >
                    {step.label}
                  </span>
                )}
              </div>

              {index < total - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px min-w-4 flex-1 transition-colors duration-300",
                    done ? "bg-brand-fill" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
