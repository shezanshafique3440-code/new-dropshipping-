import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

export interface OrderTimelineProps {
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
  placedAt: string;
}

type StepState = "done" | "current" | "failed" | "upcoming";

interface Step {
  label: string;
  detail: string;
  state: StepState;
}

/**
 * What has actually happened to this order.
 *
 * Only two things are genuinely known: the order was placed, and the payment
 * either settled, is still settling, or failed. There is no fulfilment
 * integration, so there is no "shipped" and no "delivered" — inventing them
 * would be telling the customer something nobody knows. The third row says
 * plainly that dispatch updates are not available yet.
 */
function buildSteps(props: OrderTimelineProps): Step[] {
  const { status, paymentStatus } = props;

  const paymentStep: Step =
    paymentStatus === "paid"
      ? { label: "Payment confirmed", detail: "We received your payment.", state: "done" }
      : paymentStatus === "refunded"
        ? { label: "Payment refunded", detail: "The payment was returned to you.", state: "done" }
        : paymentStatus === "failed"
          ? {
              label: "Payment failed",
              detail: "The payment did not go through, so nothing was charged.",
              state: "failed",
            }
          : {
              label: "Payment pending",
              detail: "Your payment method is still settling.",
              state: "current",
            };

  const closed = status === "cancelled" || status === "failed";

  return [
    { label: "Order placed", detail: "We received your order.", state: "done" },
    paymentStep,
    closed
      ? {
          label: status === "cancelled" ? "Order cancelled" : "Order closed",
          detail:
            status === "cancelled"
              ? "This order was cancelled and will not be dispatched."
              : "This order was not completed.",
          state: "failed",
        }
      : {
          label: "Dispatch",
          detail:
            "Fulfilment is not connected yet, so there is no dispatch date to show. We will add tracking here when it is.",
          // Never "in progress": nothing is happening, and saying otherwise
          // would be inventing fulfilment the store does not have.
          state: "upcoming",
        },
  ];
}

const STATE_STYLES: Record<StepState, { dot: string; icon: "check" | "close" | "refresh" | null }> = {
  done: { dot: "bg-brand-fill text-white border-transparent", icon: "check" },
  current: { dot: "bg-surface text-brand-primary border-brand-primary", icon: "refresh" },
  failed: { dot: "bg-danger text-white border-transparent", icon: "close" },
  upcoming: { dot: "bg-surface-muted text-foreground-subtle border-border", icon: null },
};

export function OrderTimeline(props: OrderTimelineProps) {
  const steps = buildSteps(props);

  return (
    <ol className="flex flex-col gap-0">
      {steps.map((step, index) => {
        const style = STATE_STYLES[step.state];
        const last = index === steps.length - 1;

        return (
          <li key={step.label} className="flex gap-4">
            <span className="flex flex-col items-center" aria-hidden="true">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border-2",
                  style.dot,
                )}
              >
                {style.icon ? (
                  <Icon name={style.icon} className="size-3.5" strokeWidth={2.5} />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              {last ? null : (
                <span
                  className={cn(
                    "w-0.5 flex-1",
                    step.state === "done" ? "bg-brand-fill/40" : "bg-border",
                  )}
                />
              )}
            </span>

            <span className={cn("flex flex-col gap-1", last ? "pb-0" : "pb-6")}>
              <span className="text-sm font-semibold">
                {step.label}
                {/* The state is in the text, not only in the colour. */}
                {step.state === "current" ? (
                  <span className="type-caption ml-2 font-medium text-foreground-muted">
                    In progress
                  </span>
                ) : null}
              </span>
              <span className="type-caption text-foreground-muted">{step.detail}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
