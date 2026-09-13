-- Integrity rules the Prisma schema language cannot express.
--
-- These are deliberately enforced by the database rather than only by
-- application code: an order is a financial record, and no future service,
-- script or console session should be able to write a negative total or a
-- zero-quantity line.

-- Money is always a non-negative number of minor units.
ALTER TABLE "orders"
  ADD CONSTRAINT "orders_subtotal_non_negative" CHECK ("subtotalAmount" >= 0),
  ADD CONSTRAINT "orders_shipping_non_negative" CHECK ("shippingAmount" >= 0),
  ADD CONSTRAINT "orders_tax_non_negative" CHECK ("taxAmount" >= 0),
  ADD CONSTRAINT "orders_discount_non_negative" CHECK ("discountAmount" >= 0),
  ADD CONSTRAINT "orders_total_non_negative" CHECK ("totalAmount" >= 0);

-- Currency codes are ISO 4217, stored lowercase to match the payment provider.
ALTER TABLE "orders"
  ADD CONSTRAINT "orders_currency_format" CHECK ("currency" ~ '^[a-z]{3}$');

-- The customer-facing reference has one shape: ZYV- plus six characters from
-- an alphabet chosen to be unambiguous when read aloud.
ALTER TABLE "orders"
  ADD CONSTRAINT "orders_reference_format"
  CHECK ("reference" ~ '^ZYV-[0-9A-HJKMNP-TV-Z]{6}$');

-- Line quantities are whole and positive, and a line total is never negative.
ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_quantity_positive" CHECK ("quantity" >= 1),
  ADD CONSTRAINT "order_items_unit_amount_non_negative" CHECK ("unitAmount" >= 0),
  ADD CONSTRAINT "order_items_line_amount_non_negative" CHECK ("lineAmount" >= 0);

-- A line total must equal its own unit price times its own quantity. This is
-- the one arithmetic invariant that keeps a historical order internally
-- consistent for ever.
ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_line_amount_matches"
  CHECK ("lineAmount" = "unitAmount" * "quantity");
