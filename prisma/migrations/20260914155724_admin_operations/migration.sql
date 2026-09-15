-- Internal operations: administrators, admin sessions and the order status
-- trail.
--
-- Administrators live in their own table with their own session table, so a
-- customer session has nothing it could resolve to here. Nothing in this
-- migration touches an existing order row.
--
-- The one change to `orders` is an index swap: `orders_createdAt_idx` is
-- dropped for `orders_createdAt_reference_idx`, which has `createdAt` as its
-- leading column and therefore answers everything the old index did, plus the
-- (createdAt DESC, reference DESC) ordering the admin order list pages
-- through.

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('admin');

-- DropIndex
DROP INDEX "orders_createdAt_idx";

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "emailNormalized" VARCHAR(254) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "adminUserId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "lastUsedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMPTZ(3),

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "fromStatus" "OrderStatus" NOT NULL,
    "toStatus" "OrderStatus" NOT NULL,
    "changedByAdminId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_emailNormalized_key" ON "admin_users"("emailNormalized");

-- CreateIndex
CREATE INDEX "admin_users_createdAt_idx" ON "admin_users"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_tokenHash_key" ON "admin_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "admin_sessions_adminUserId_idx" ON "admin_sessions"("adminUserId");

-- CreateIndex
CREATE INDEX "admin_sessions_expiresAt_idx" ON "admin_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "order_status_history_orderId_createdAt_idx" ON "order_status_history"("orderId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "order_status_history_createdAt_idx" ON "order_status_history"("createdAt");

-- CreateIndex
CREATE INDEX "orders_createdAt_reference_idx" ON "orders"("createdAt" DESC, "reference" DESC);

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changedByAdminId_fkey" FOREIGN KEY ("changedByAdminId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Integrity rules the Prisma schema language cannot express.

-- An audit row records a real change; recording "pending to pending" would be
-- noise in a trail whose only job is to be trustworthy.
ALTER TABLE "order_status_history"
  ADD CONSTRAINT "order_status_history_is_a_change"
  CHECK ("fromStatus" <> "toStatus");

-- An administrator's session cannot outlive its own creation, and neither
-- deadline may be missing.
ALTER TABLE "admin_sessions"
  ADD CONSTRAINT "admin_sessions_expires_after_creation"
  CHECK ("expiresAt" > "createdAt");

-- Identity is the normalized address: trimmed, lowercased, and non-empty.
ALTER TABLE "admin_users"
  ADD CONSTRAINT "admin_users_email_normalized"
  CHECK ("emailNormalized" = lower(btrim("emailNormalized")) AND length("emailNormalized") > 0);
