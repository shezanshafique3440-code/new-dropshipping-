import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import type { Order } from "@/types";

/**
 * Order and payment state, as words.
 *
 * Two separate facts, shown separately, because that is how they are stored:
 * where the order is, and where the money is. Colour only reinforces the
 * label — every badge says what it means in text, so nothing depends on
 * distinguishing violet from amber.
 */

const ORDER_STATUS: Record<Order["status"], { label: string; variant: BadgeVariant }> = {
  pending: { label: "Awaiting payment", variant: "neutral" },
  paid: { label: "Confirmed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "neutral" },
  failed: { label: "Payment failed", variant: "limited" },
};

const PAYMENT_STATUS: Record<
  Order["paymentStatus"],
  { label: string; variant: BadgeVariant }
> = {
  unpaid: { label: "Unpaid", variant: "neutral" },
  paid: { label: "Paid", variant: "success" },
  failed: { label: "Payment failed", variant: "limited" },
  refunded: { label: "Refunded", variant: "neutral" },
};

export interface OrderStatusBadgesProps {
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
}

export function OrderStatusBadges({ status, paymentStatus }: OrderStatusBadgesProps) {
  const order = ORDER_STATUS[status];
  const payment = PAYMENT_STATUS[paymentStatus];

  return (
    <span className="flex flex-wrap items-center gap-2">
      <Badge variant={order.variant}>
        <span className="sr-only">Order status: </span>
        {order.label}
      </Badge>
      {/* One badge when both say the same thing, rather than "Paid  Paid". */}
      {payment.label === order.label ? null : (
        <Badge variant={payment.variant}>
          <span className="sr-only">Payment: </span>
          {payment.label}
        </Badge>
      )}
    </span>
  );
}
