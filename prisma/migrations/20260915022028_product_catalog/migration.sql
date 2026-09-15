-- The product catalogue.
--
-- Nothing in this migration touches an existing table. In particular
-- `order_items` gains no foreign key to `products`: an order records what was
-- bought and charged at the time, and must keep saying so after a product is
-- edited, unpublished, archived or removed.

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateTable
CREATE TABLE "products" (
    "id" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "shortDescription" VARCHAR(300),
    "category" VARCHAR(40) NOT NULL,
    "features" VARCHAR(200)[],
    "priceAmount" INTEGER NOT NULL,
    "compareAtPriceAmount" INTEGER,
    "currency" VARCHAR(3) NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "bestseller" BOOLEAN NOT NULL DEFAULT false,
    "trending" BOOLEAN NOT NULL DEFAULT false,
    "newArrival" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "artKey" VARCHAR(40) NOT NULL,
    "tone" VARCHAR(20) NOT NULL,
    "badgeLabel" VARCHAR(40),
    "badgeTone" VARCHAR(20),
    "ratingValue" INTEGER,
    "ratingCount" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_status_sortOrder_idx" ON "products"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "products_status_category_idx" ON "products"("status", "category");

-- CreateIndex
CREATE INDEX "products_status_featured_idx" ON "products"("status", "featured");

-- CreateIndex
CREATE INDEX "products_status_bestseller_idx" ON "products"("status", "bestseller");

-- CreateIndex
CREATE INDEX "products_updatedAt_idx" ON "products"("updatedAt" DESC);

-- Integrity rules the Prisma schema language cannot express.
--
-- The category list lives in TypeScript (src/lib/product-categories.ts) and is
-- shared by the admin form, the storefront filters and the repository. This
-- constraint is the database's copy of it, so no script, console session or
-- future service can write a category the shop cannot render.
ALTER TABLE "products"
  ADD CONSTRAINT "products_category_known"
  CHECK ("category" IN ('Tech', 'Home', 'Lifestyle', 'Beauty', 'Accessories', 'Everyday Essentials'));

-- Money: integers in minor units, never negative, and a struck-through price
-- that is genuinely higher than what is being charged.
ALTER TABLE "products"
  ADD CONSTRAINT "products_price_non_negative" CHECK ("priceAmount" >= 0),
  ADD CONSTRAINT "products_compare_at_non_negative"
    CHECK ("compareAtPriceAmount" IS NULL OR "compareAtPriceAmount" >= 0),
  ADD CONSTRAINT "products_compare_at_above_price"
    CHECK ("compareAtPriceAmount" IS NULL OR "compareAtPriceAmount" >= "priceAmount");

-- Currency codes are ISO 4217, stored lowercase to match orders and Stripe.
ALTER TABLE "products"
  ADD CONSTRAINT "products_currency_format" CHECK ("currency" ~ '^[a-z]{3}$');

-- A slug is what appears in a URL: lowercase, digits and single hyphens.
ALTER TABLE "products"
  ADD CONSTRAINT "products_slug_format"
  CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- The name a shopper reads is trimmed and not empty.
ALTER TABLE "products"
  ADD CONSTRAINT "products_name_present"
  CHECK ("name" = btrim("name") AND length("name") > 0);

-- The artwork tone is one of the five the design system draws.
ALTER TABLE "products"
  ADD CONSTRAINT "products_tone_known"
  CHECK ("tone" IN ('violet', 'blue', 'cyan', 'magenta', 'neutral'));

-- A merchandising pill needs both halves or neither, and its tone is one the
-- badge component knows.
ALTER TABLE "products"
  ADD CONSTRAINT "products_badge_complete"
  CHECK (num_nonnulls("badgeLabel", "badgeTone") <> 1);
ALTER TABLE "products"
  ADD CONSTRAINT "products_badge_tone_known"
  CHECK ("badgeTone" IS NULL OR "badgeTone" IN ('new', 'trending', 'bestseller', 'popular', 'sale'));

-- Ratings are stored in tenths, so 4.8 is 48. Both halves or neither.
ALTER TABLE "products"
  ADD CONSTRAINT "products_rating_complete"
  CHECK (num_nonnulls("ratingValue", "ratingCount") <> 1);
ALTER TABLE "products"
  ADD CONSTRAINT "products_rating_range"
  CHECK ("ratingValue" IS NULL OR ("ratingValue" BETWEEN 0 AND 50));
ALTER TABLE "products"
  ADD CONSTRAINT "products_rating_count_non_negative"
  CHECK ("ratingCount" IS NULL OR "ratingCount" >= 0);
