"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { OrderStatus } from "@/types";

export interface OrderStatusControlProps {
  reference: string;
  status: OrderStatus;
  /** Derived on the server from the order state machine, never from the UI. */
  availableStatuses: readonly OrderStatus[];
}

/**
 * Changing an order's operational status.
 *
 * Cancelling is the only change an operator can make, and the panel says so
 * rather than offering a status menu with everything greyed out. What the
 * button offers is whatever the server said was available — this component
 * has no opinion about the state machine and cannot widen it, because the
 * endpoint checks again anyway.
 *
 * It is a two-step action: a button, then a confirmation naming the order.
 * Not `window.confirm`, which cannot be styled, cannot be read properly by
 * some screen readers and looks like a browser malfunction. The control is
 * disabled while the request is in flight, so a double click cannot send two.
 */

const COPY: Record<
  string,
  { action: string; question: string; confirm: string; dismiss: string; note: string }
> = {
  cancelled: {
    action: "Cancel order",
    question: "Cancel this order?",
    confirm: "Cancel order",
    dismiss: "Keep order",
    note: "Cancelling is final: a cancelled order cannot be reopened. It does not refund anything — refunds are issued in Stripe.",
  },
};

type Feedback =
  | { kind: "idle" }
  | { kind: "saved"; message: string }
  | { kind: "error"; message: string };

export function OrderStatusControl({
  reference,
  status,
  availableStatuses,
}: OrderStatusControlProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<OrderStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ kind: "idle" });
  const dismissButton = useRef<HTMLButtonElement>(null);

  // Focus lands on "keep", not on the destructive button: confirming should
  // take a deliberate move, and Escape backs out.
  useEffect(() => {
    if (!confirming) {
      return;
    }
    dismissButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        setConfirming(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirming, submitting]);

  const apply = async (target: OrderStatus) => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setFeedback({ kind: "idle" });

    try {
      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(reference)}/status`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: target }),
        },
      );
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setSubmitting(false);
        setFeedback({
          kind: "error",
          message: readMessage(data) ?? "That change could not be applied.",
        });
        return;
      }

      setConfirming(null);
      setSubmitting(false);
      setFeedback({ kind: "saved", message: `Order ${reference} is now ${target}.` });
      // The page re-reads the order from the server, so the badges, the
      // available actions and the history all come back as stored rather
      // than being patched locally.
      router.refresh();
    } catch {
      setSubmitting(false);
      setFeedback({
        kind: "error",
        message: "We could not reach the server. Nothing has been changed.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Announced when it appears, so the outcome is not visual only. */}
      <div aria-live="polite" className="empty:hidden">
        {feedback.kind === "saved" ? (
          <p className="type-caption flex items-start gap-2 rounded-xl border border-success/40 bg-success/5 p-3 font-medium text-success">
            <Icon name="check" className="mt-px size-4 shrink-0" strokeWidth={2.5} />
            {feedback.message}
          </p>
        ) : null}
        {feedback.kind === "error" ? (
          <p
            role="alert"
            data-status-error
            className="type-caption flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/5 p-3 font-medium text-danger"
          >
            <Icon name="close" className="mt-px size-4 shrink-0" strokeWidth={2.5} />
            {feedback.message}
          </p>
        ) : null}
      </div>

      {availableStatuses.length === 0 ? (
        <p className="type-caption text-foreground-muted">
          {status === "cancelled"
            ? "This order is cancelled. Cancellation is final, so there is nothing further to change here."
            : "There is no status change available for this order in its current state."}
        </p>
      ) : (
        availableStatuses.map((target) => {
          const copy = COPY[target];
          if (!copy) {
            // A status the panel has no copy for is not offered rather than
            // rendered as a mystery button.
            return null;
          }

          if (confirming === target) {
            return (
              <div
                key={target}
                aria-labelledby={`confirm-${target}-heading`}
                className="flex flex-col gap-3 rounded-xl border border-danger/40 bg-danger/5 p-4"
              >
                <p id={`confirm-${target}-heading`} className="text-sm font-semibold">
                  {copy.question}
                </p>
                <p className="type-caption text-foreground-muted">
                  Order <span className="font-semibold">{reference}</span>. {copy.note}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={submitting}
                    aria-busy={submitting}
                    onClick={() => void apply(target)}
                    data-confirm-status={target}
                  >
                    {submitting ? "Working…" : copy.confirm}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    ref={dismissButton}
                    disabled={submitting}
                    onClick={() => setConfirming(null)}
                  >
                    {copy.dismiss}
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <Button
              key={target}
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => {
                setFeedback({ kind: "idle" });
                setConfirming(target);
              }}
              data-request-status={target}
            >
              {copy.action}
            </Button>
          );
        })
      )}
    </div>
  );
}

function readMessage(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "error" in data) {
    const message = (data as { error?: unknown }).error;
    if (typeof message === "string" && message.length > 0 && message.length <= 200) {
      return message;
    }
  }
  return null;
}
