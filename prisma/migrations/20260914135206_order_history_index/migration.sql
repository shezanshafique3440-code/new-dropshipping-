-- DropIndex
DROP INDEX "orders_customerId_idx";

-- CreateIndex
CREATE INDEX "orders_customerId_createdAt_reference_idx" ON "orders"("customerId", "createdAt" DESC, "reference" DESC);
