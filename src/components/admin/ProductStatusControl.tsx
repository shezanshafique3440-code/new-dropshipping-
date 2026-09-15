"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ProductStatus } from "@/server/catalog/repository";

export interface ProductStatusControlProps {
  slug: string;
  status: ProductStatus;
  /** The version this page loaded, so a stale save is refused. */
  updatedAt: string;
}

/**
 * Publishing, unpublishing and archiving a product.
 *
 * Each move says what it does to shoppers, because that is the part that
 * matters: publishing puts a product on sale, unpublishing takes it off the
 * shop without losing it, archiving withdraws it for good.
 *
 * Archiving asks first. Not `window.confirm` — which cannot be styled, reads
 * poorly to some screen readers and looks like a browser fault — but a named
 * region with the safe choice focused and Escape to back out. Every control
 * is disabled while a request is in flight, so a double click cannot send two.
 */

interface Move {
  to: ProductStatus;
  action: string;
  effect: string;
  confirm?: { question: string; note: string; confirm: string; dismiss: string };
}

const MOVES: Record<ProductStatus, readonly Move[]> = {
  draft: [
    {
      to: "published",
      action: "Publish",
      effect: "Puts this product in the shop, where it can be bought.",
    },
    {
      to: "archived",
      action: "Archive",
      effect: "Withdraws the product without deleting it.",
      confirm: {
        question: "Archive this product?",
        note: "It disappears from the shop and cannot be bought. Existing orders are unaffected — they keep their own record of what was bought and charged. You can publish it again later.",
        confirm: "Archive product",
        dismiss: "Keep as draft",
      },
    },
  ],
  published: [
    {
      to: "draft",
      action: "Unpublish",
      effect: "Takes it out of the shop and back to draft.",
    },
    {
      to: "archived",
      action: "Archive",
      effect: "Withdraws the product for good.",
      confirm: {
        question: "Archive this product?",
        note: "It disappears from the shop immediately and cannot be bought. Existing orders are unaffected — they keep their own record of what was bought and charged. You can publish it again later.",
        confirm: "Archive product",
        dismiss: "Keep it published",
      },
    },
  ],
  archived: [
    {
      to: "published",
      action: "Publish again",
      effect: "Returns it to the shop at its current price.",
    },
    {
      to: "draft",
      action: "Move to draft",
      effect: "Brings it back for editing, still hidden from the shop.",
    },
  ],
};

type Feedback =
  | { kind: "idle" }
  | { kind: "saved"; message: string }
  | { kind: "error"; message: string };

export function ProductStatusControl({
  slug,
  status,
  updatedAt,
}: ProductStatusControlProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<ProductStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ kind: "idle" });
  const dismissButton = useRef<HTMLButtonElement>(null);

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

  const apply = async (to: ProductStatus) => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setFeedback({ kind: "idle" });

    try {
      const response = await fetch(
        `/api/admin/products/${encodeURIComponent(slug)}/status`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: to, expectedUpdatedAt: updatedAt }),
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
      setFeedback({ kind: "saved", message: `This product is now ${to}.` });
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

      {MOVES[status].map((move) =>
        confirming === move.to && move.confirm ? (
          <div
            key={move.to}
            aria-labelledby={`confirm-${move.to}-heading`}
            className="flex flex-col gap-3 rounded-xl border border-danger/40 bg-danger/5 p-4"
          >
            <p id={`confirm-${move.to}-heading`} className="text-sm font-semibold">
              {move.confirm.question}
            </p>
            <p className="type-caption text-foreground-muted">{move.confirm.note}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={submitting}
                aria-busy={submitting}
                data-confirm-status={move.to}
                onClick={() => void apply(move.to)}
              >
                {submitting ? "Working…" : move.confirm.confirm}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                ref={dismissButton}
                disabled={submitting}
                onClick={() => setConfirming(null)}
              >
                {move.confirm.dismiss}
              </Button>
            </div>
          </div>
        ) : (
          <div key={move.to} className="flex flex-col gap-1">
            <Button
              type="button"
              variant={move.to === "published" ? "primary" : "outline"}
              size="sm"
              disabled={submitting}
              data-request-status={move.to}
              onClick={() => {
                setFeedback({ kind: "idle" });
                if (move.confirm) {
                  setConfirming(move.to);
                } else {
                  void apply(move.to);
                }
              }}
            >
              {move.action}
            </Button>
            <p className="type-caption text-foreground-subtle">{move.effect}</p>
          </div>
        ),
      )}
    </div>
  );
}

function readMessage(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "error" in data) {
    const message = (data as { error?: unknown }).error;
    if (typeof message === "string" && message.length > 0 && message.length <= 300) {
      return message;
    }
  }
  return null;
}
