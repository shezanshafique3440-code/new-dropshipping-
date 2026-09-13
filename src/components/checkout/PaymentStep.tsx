import { acceptedPaymentMethods, paymentHandoff } from "@/data/checkout-options";
import { Icon } from "@/components/ui/Icon";
import type { PaymentMode } from "@/types";

export interface PaymentStepProps {
  mode: PaymentMode;
}

/**
 * Payment step.
 *
 * There is no card form here, and there never will be: payment is completed
 * on Stripe's hosted page, which is what keeps card numbers, expiry dates and
 * security codes out of this application entirely. This step's job is to say
 * plainly what happens next and what will be accepted.
 */
export function PaymentStep({ mode }: PaymentStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div
        role="note"
        className="flex items-start gap-3 rounded-2xl border border-border-highlight bg-brand-primary-soft/40 p-4"
      >
        <Icon
          name="lock"
          className="mt-0.5 size-[1.15rem] shrink-0 text-brand-primary"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">{paymentHandoff.title}</p>
          <p className="type-caption text-foreground-muted">
            {paymentHandoff.description}
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {acceptedPaymentMethods.map((method) => (
          <li
            key={method.id}
            className="flex items-start gap-3.5 rounded-2xl border border-border bg-surface p-4"
          >
            <Icon
              name={method.icon}
              className="mt-0.5 size-[1.15rem] shrink-0 text-foreground-subtle"
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold">{method.name}</p>
              <p className="type-caption text-foreground-muted">
                {method.description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {mode === "test" ? (
        <p
          data-testid="payment-mode-notice"
          className="type-caption flex items-start gap-2 rounded-xl border border-border-subtle bg-surface-muted p-3.5 text-foreground-muted"
        >
          <Icon name="shield" className="mt-px size-4 shrink-0" />
          {paymentHandoff.testModeNotice}
        </p>
      ) : null}

      {mode === "unconfigured" ? (
        <p
          data-testid="payment-mode-notice"
          role="alert"
          className="type-caption flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/5 p-3.5 font-medium text-danger"
        >
          <Icon name="shield" className="mt-px size-4 shrink-0" />
          {paymentHandoff.unconfiguredNotice}
        </p>
      ) : null}
    </div>
  );
}
