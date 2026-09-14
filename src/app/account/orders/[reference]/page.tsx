import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrderDetail } from "@/components/account/OrderDetail";
import { Container } from "@/components/ui/Container";
import { requireCustomer } from "@/server/auth/current-customer";
import { isOrderReference } from "@/server/orders/reference";
import { getCustomerOrder } from "@/server/orders/service";

export const metadata: Metadata = {
  title: "Order",
  description: "Details of your ZYVERO order.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ reference: string }>;
}

/**
 * One order.
 *
 * Authorisation is the query: `getCustomerOrder` asks for this reference
 * *belonging to this customer*, so an order that exists but is somebody
 * else's — or a guest order, which belongs to nobody — simply does not come
 * back. Both cases end in the same not-found page as a reference that was
 * never real, so nothing here can be used to discover that an order exists.
 */
export default async function AccountOrderPage({ params }: OrderPageProps) {
  const { reference: raw } = await params;
  const { customer } = await requireCustomer(
    `/account/orders/${encodeURIComponent(raw)}`,
  );

  const reference = decodeURIComponent(raw).toUpperCase();
  if (!isOrderReference(reference)) {
    // Not even the right shape: no need to ask the database.
    notFound();
  }

  const order = await getCustomerOrder(customer.id, reference);
  if (!order) {
    notFound();
  }

  return (
    <Container className="section-y-sm">
      <OrderDetail order={order} />
    </Container>
  );
}
