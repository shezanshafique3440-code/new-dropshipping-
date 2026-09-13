"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/format";
import { fromMinorUnits } from "@/lib/money";
import { checkoutHref, shopHref } from "@/lib/routes";

/**
 * Payment verification.
 *
 * Landing here means Stripe redirected the browser back — nothing more. The
 * page starts in a verifying state and asks the server what really happened
 * to the session before it says a single confirming word, so a hand-typed URL
 * can never produce a confirmation. The cart is cleared only once the server
 * reports a paid order.
 */

interface PublicOrderItem {
  name: string;
  quantity: number;
  unitAmount: number;
  lineAmount: number;
}

interface PublicOrder {
  reference: string;
  currency: string;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  email: string;
  items: readonly PublicOrderItem[];
}

type Verification =
  | { state: "verifying" }
  | { state: "paid"; order: PublicOrder }
  | { state: "processing" }
  | { state: "incomplete" }
  | { state: "expired" }
  | { state: "not_found" }
  | { state: "error"; message: string };

/** A delayed payment method can take a moment; poll briefly, then stop. */
const MAX_POLLS = 5;
const POLL_DELAY_MS = 2_000;

export function PaymentVerification() {
  const { clear } = useCart();
  const [result, setResult] = useState<Verification>({ state: "verifying" });
  const clearedRef = useRef(false);
  const pollsRef = useRef(0);

  const verify = useCallback(async (sessionId: string): Promise<Verification> => {
    try {
      const response = await fetch(
        `/api/checkout/session-status?session_id=${encodeURIComponent(sessionId)}`,
        { cache: "no-store" },
      );
      const data: unknown = await response.json().catch(() => null);
      return readVerification(data);
    } catch {
      return {
        state: "error",
        message: "We could not reach the server to confirm your payment.",
      };
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      // Read from the address bar rather than a prop: the session id is a
      // one-time token from Stripe, not part of this route's contract.
      const sessionId = new URLSearchParams(window.location.search).get("session_id");
      if (!sessionId) {
        setResult({ state: "not_found" });
        return;
      }

      const next = await verify(sessionId);
      if (cancelled) {
        return;
      }
      setResult(next);

      if (next.state === "paid" && !clearedRef.current) {
        // The one place the cart is emptied: a payment the server confirmed.
        clearedRef.current = true;
        clear();
        return;
      }

      if (next.state === "processing" && pollsRef.current < MAX_POLLS) {
        pollsRef.current += 1;
        timer = setTimeout(run, POLL_DELAY_MS);
      }
    };

    void run();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [clear, verify]);

  return (
    <Container size="md" className="section-y-sm">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        {result.state === "verifying" ? <Verifying /> : null}
        {result.state === "paid" ? <Confirmed order={result.order} /> : null}
        {result.state === "processing" ? <Processing /> : null}
        {result.state === "incomplete" ? <Incomplete /> : null}
        {result.state === "expired" ? <Expired /> : null}
        {result.state === "not_found" ? <NotFound /> : null}
        {result.state === "error" ? <Failed message={result.message} /> : null}
      </div>
    </Container>
  );
}

function Verifying() {
  return (
    <div role="status" className="flex flex-col items-center gap-4 py-10 text-center">
      <span
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-2 border-border-strong border-t-brand-primary"
      />
      <h1 className="type-h2">Confirming your payment…</h1>
      <p className="text-sm text-foreground-muted">
        Checking with our payment provider. This usually takes a second — please
        do not close this page.
      </p>
    </div>
  );
}

function Confirmed({ order }: { order: PublicOrder }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-primary-soft text-brand-primary">
          <Icon name="check" className="size-6" strokeWidth={2.5} />
        </span>
        <h1 className="type-h2">Order confirmed</h1>
        <p className="text-sm text-foreground-muted">
          Payment was received and your order is booked in. A copy of these
          details is on this page — we have no order emails yet, so it is worth
          keeping your reference.
        </p>
      </header>

      <dl className="grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="type-caption text-foreground-subtle">Order reference</dt>
          <dd className="text-lg font-bold tracking-wide">{order.reference}</dd>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <dt className="type-caption text-foreground-subtle">Email on this order</dt>
          <dd className="text-sm break-words">{order.email}</dd>
        </div>
      </dl>

      <section
        aria-labelledby="paid-summary-heading"
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5"
      >
        <h2 id="paid-summary-heading" className="type-h3">
          What you paid for
        </h2>

        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li
              key={`${item.name}-${item.unitAmount}`}
              className="flex items-start justify-between gap-4 text-sm"
            >
              <span className="min-w-0 break-words">
                {item.name}
                <span className="type-caption block text-foreground-subtle">
                  {formatPrice(fromMinorUnits(item.unitAmount))} each ·{" "}
                  {item.quantity}
                </span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums">
                {formatPrice(fromMinorUnits(item.lineAmount))}
              </span>
            </li>
          ))}
        </ul>

        <dl className="flex flex-col gap-2 border-t border-border-subtle pt-4 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-foreground-muted">Subtotal</dt>
            <dd className="tabular-nums">
              {formatPrice(fromMinorUnits(order.subtotalAmount))}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-foreground-muted">Shipping</dt>
            <dd className="tabular-nums">
              {formatPrice(fromMinorUnits(order.shippingAmount))}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle pt-2">
            <dt className="text-base font-semibold">Total paid</dt>
            <dd className="text-xl font-bold tabular-nums">
              {formatPrice(fromMinorUnits(order.totalAmount))}
            </dd>
          </div>
        </dl>
      </section>

      <p className="type-caption text-foreground-muted">
        Fulfilment is not connected yet, so there is no dispatch date to give
        you. Quote your reference if you need to reach support about this order.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={shopHref()} variant="primary" size="lg">
          Continue shopping
          <Icon name="arrowRight" className="size-4" strokeWidth={2} />
        </ButtonLink>
        <ButtonLink href="/" variant="outline" size="lg">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}

function Processing() {
  return (
    <StatusCard
      icon="shield"
      title="Payment is still being confirmed"
      body="Your payment method takes a little longer to settle. Nothing more is needed from you — your order is confirmed as soon as the payment clears, and your cart is left untouched until then."
    >
      <ButtonLink href={shopHref()} variant="outline">
        Continue shopping
      </ButtonLink>
    </StatusCard>
  );
}

function Incomplete() {
  return (
    <StatusCard
      icon="bag"
      title="This payment was not completed"
      body="No charge was made and no order was created. Your cart is still as you left it, so you can pick up where you stopped."
    >
      <ButtonLink href={checkoutHref()} variant="primary">
        Return to checkout
      </ButtonLink>
    </StatusCard>
  );
}

function Expired() {
  return (
    <StatusCard
      icon="bag"
      title="This payment session expired"
      body="Nothing was charged. Start checkout again when you are ready — everything in your cart is still there."
    >
      <ButtonLink href={checkoutHref()} variant="primary">
        Return to checkout
      </ButtonLink>
    </StatusCard>
  );
}

function NotFound() {
  return (
    <StatusCard
      icon="close"
      title="We could not find that payment"
      body="This link does not match a payment we know about. If you have just paid, use the link Stripe returned you; nothing here confirms an order on its own."
    >
      <ButtonLink href={checkoutHref()} variant="primary">
        Return to checkout
      </ButtonLink>
    </StatusCard>
  );
}

function Failed({ message }: { message: string }) {
  return (
    <StatusCard icon="close" title="We could not confirm your payment" body={message}>
      <Button variant="primary" onClick={() => window.location.reload()}>
        Try again
      </Button>
      <ButtonLink href={checkoutHref()} variant="outline">
        Return to checkout
      </ButtonLink>
    </StatusCard>
  );
}

function StatusCard({
  icon,
  title,
  body,
  children,
}: {
  icon: "shield" | "bag" | "close";
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6"
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-surface-muted text-foreground-subtle">
        <Icon name={icon} className="size-5" />
      </span>
      <h1 className="type-h2">{title}</h1>
      <p className="text-sm text-foreground-muted">{body}</p>
      <div className="flex flex-col gap-3 sm:flex-row">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Response reading
 *
 * The endpoint is ours, but the response is still parsed defensively: an
 * unexpected shape must land on an honest error state, never on a confirmation.
 * ---------------------------------------------------------------------- */

function readVerification(data: unknown): Verification {
  if (typeof data !== "object" || data === null || !("state" in data)) {
    return { state: "error", message: "We received an unexpected response." };
  }

  const state = (data as { state?: unknown }).state;

  if (state === "paid") {
    const order = readOrder((data as { order?: unknown }).order);
    return order
      ? { state: "paid", order }
      : { state: "error", message: "We could not read your order details." };
  }

  if (
    state === "processing" ||
    state === "incomplete" ||
    state === "expired" ||
    state === "not_found"
  ) {
    return { state };
  }

  const message = (data as { message?: unknown }).message;
  return {
    state: "error",
    message:
      typeof message === "string" && message.length > 0 && message.length <= 200
        ? message
        : "We could not confirm your payment just yet.",
  };
}

function readOrder(value: unknown): PublicOrder | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const raw = value as Record<string, unknown>;
  if (typeof raw.reference !== "string" || typeof raw.totalAmount !== "number") {
    return null;
  }
  const items = Array.isArray(raw.items) ? raw.items : [];
  return {
    reference: raw.reference,
    currency: typeof raw.currency === "string" ? raw.currency : "usd",
    subtotalAmount: numberOr(raw.subtotalAmount, 0),
    shippingAmount: numberOr(raw.shippingAmount, 0),
    totalAmount: raw.totalAmount,
    email: typeof raw.email === "string" ? raw.email : "",
    items: items.flatMap((item) => {
      if (typeof item !== "object" || item === null) {
        return [];
      }
      const line = item as Record<string, unknown>;
      return typeof line.name === "string"
        ? [
            {
              name: line.name,
              quantity: numberOr(line.quantity, 1),
              unitAmount: numberOr(line.unitAmount, 0),
              lineAmount: numberOr(line.lineAmount, 0),
            },
          ]
        : [];
    }),
  };
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
