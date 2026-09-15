-- CreateEnum
CREATE TYPE "ProductImageSource" AS ENUM ('generated', 'uploaded');

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL,
    "productId" VARCHAR(120) NOT NULL,
    "storageKey" VARCHAR(300) NOT NULL,
    "altText" VARCHAR(300) NOT NULL,
    "label" VARCHAR(40) NOT NULL,
    "source" "ProductImageSource" NOT NULL DEFAULT 'uploaded',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "format" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_images_productId_sortOrder_idx" ON "product_images"("productId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "product_images_productId_storageKey_key" ON "product_images"("productId", "storageKey");

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Invariants the application must not be the only thing enforcing.
--
-- A gallery is read on every storefront page and edited by more than one
-- administrator at a time, so "there is exactly one primary image" and "an
-- image has real pixels and a real alt text" are enforced here, where a bug
-- in a route handler cannot get past them.
-- ---------------------------------------------------------------------------

-- At most one primary image per product. A partial unique index rather than a
-- trigger: promoting a new primary is then a two-statement transaction that
-- either holds the invariant or fails, never a window where a product has two.
CREATE UNIQUE INDEX "product_images_one_primary"
  ON "product_images" ("productId")
  WHERE "isPrimary";

-- A storage key, not a URL and not a path. Lowercase, relative, no scheme, no
-- leading slash, no traversal: whatever a driver does with it, it cannot be
-- made to escape its bucket or point at another host.
ALTER TABLE "product_images"
  ADD CONSTRAINT "product_images_storage_key_is_relative"
  CHECK (
    "storageKey" ~ '^[a-z0-9][a-z0-9._/-]*\.[a-z0-9]{2,5}$'
    AND "storageKey" NOT LIKE '%..%'
    AND "storageKey" NOT LIKE '%//%'
  );

-- Alt text is what a screen reader reads out. An empty or whitespace-only one
-- is a defect, so it cannot be stored.
ALTER TABLE "product_images"
  ADD CONSTRAINT "product_images_alt_text_present"
  CHECK (btrim("altText") <> '' AND "altText" = btrim("altText"));

ALTER TABLE "product_images"
  ADD CONSTRAINT "product_images_label_present"
  CHECK (btrim("label") <> '');

-- Intrinsic dimensions are what stops the page shifting as images load, so a
-- zero or an absurd value is rejected rather than rendered.
ALTER TABLE "product_images"
  ADD CONSTRAINT "product_images_has_pixels"
  CHECK ("width" BETWEEN 1 AND 10000 AND "height" BETWEEN 1 AND 10000);

ALTER TABLE "product_images"
  ADD CONSTRAINT "product_images_byte_size_positive"
  CHECK ("byteSize" > 0 AND "byteSize" <= 20971520);

ALTER TABLE "product_images"
  ADD CONSTRAINT "product_images_sort_order_not_negative"
  CHECK ("sortOrder" >= 0);

-- The formats the storefront is willing to serve, matching the sniffer in
-- src/server/media/image-metadata.ts.
ALTER TABLE "product_images"
  ADD CONSTRAINT "product_images_known_format"
  CHECK ("format" IN ('webp', 'avif', 'png', 'jpeg'));
