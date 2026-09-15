/**
 * Seeds the product galleries from the committed renders.
 *
 *   npm run db:seed:media
 *   npm run db:seed:media -- --prune   # also detach generated rows whose
 *                                      # file is no longer committed
 *
 * Reads `public/products/manifest.json`, which
 * `scripts/generate-product-media.mjs` writes, and attaches each image to its
 * product. Deterministic and idempotent: every row is keyed by
 * `(productId, storageKey)`, so the second and third runs update the same
 * rows rather than creating more. An administrator's reordering survives a
 * re-seed, because positions are only assigned when a row is first created.
 *
 * The manifest is treated as an index, not as evidence: the file itself is
 * read and its header parsed, so the dimensions and byte size stored are the
 * ones the browser will actually download. A manifest entry whose file is
 * missing, unreadable or not a supported image is reported and skipped rather
 * than written as a row pointing at nothing.
 *
 * No secrets, no customer data, nothing random.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const prune = process.argv.includes("--prune");

const ROOT = path.resolve(import.meta.dirname, "..");
const MANIFEST = path.join(ROOT, "public", "products", "manifest.json");

const { readImageMetadata } = await import("../src/server/media/image-metadata.ts");
const { isValidStorageKey } = await import("../src/server/media/keys.ts");
const { getPrismaClient } = await import("../src/server/db/client.ts");
const { PrismaProductMediaRepository } = await import(
  "../src/server/media/prisma-repository.ts"
);

const prisma = getPrismaClient();
const media = new PrismaProductMediaRepository(prisma);

let manifest;
try {
  manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
} catch {
  console.error(
    `Could not read ${path.relative(ROOT, MANIFEST)}.\n` +
      "Run `npm run media:generate` first — the galleries are seeded from the renders it writes.",
  );
  process.exit(1);
}

const entries = Array.isArray(manifest.images) ? manifest.images : [];
if (entries.length === 0) {
  console.error("The manifest lists no images.");
  process.exit(1);
}

let attached = 0;
let skipped = 0;
let pruned = 0;
const problems = [];

try {
  const productIds = new Set(
    (await prisma.product.findMany({ select: { id: true } })).map((row) => row.id),
  );

  // Ordered by product and then by gallery position, so a first run creates
  // each gallery in the order the generator intended and the front view — the
  // one at position zero — becomes the primary image.
  const ordered = [...entries].sort(
    (a, b) => String(a.slug).localeCompare(String(b.slug)) || a.sortOrder - b.sortOrder,
  );

  for (const entry of ordered) {
    if (!productIds.has(entry.productId)) {
      problems.push(`${entry.key}: no product with id "${entry.productId}"`);
      skipped += 1;
      continue;
    }
    if (!isValidStorageKey(entry.key)) {
      problems.push(`${entry.key}: not a valid storage key`);
      skipped += 1;
      continue;
    }

    const file = path.join(ROOT, "public", entry.key);
    const bytes = await readFile(file).catch(() => null);
    if (!bytes) {
      problems.push(`${entry.key}: file is missing from public/`);
      skipped += 1;
      continue;
    }

    const measured = readImageMetadata(bytes);
    if (!measured) {
      problems.push(`${entry.key}: not a supported image`);
      skipped += 1;
      continue;
    }

    await media.add({
      productId: entry.productId,
      storageKey: entry.key,
      altText: String(entry.alt).trim(),
      label: String(entry.label ?? entry.view),
      source: "generated",
      // Measured from the bytes on disk, not copied from the manifest.
      width: measured.width,
      height: measured.height,
      byteSize: measured.byteSize,
      format: measured.format,
    });
    attached += 1;
  }

  if (prune) {
    // Only generated rows: an uploaded image has no manifest entry and is not
    // this script's to remove.
    const keys = new Set(ordered.map((entry) => entry.key));
    const stale = await prisma.productImage.findMany({
      where: { source: "generated" },
      select: { id: true, productId: true, storageKey: true },
    });
    for (const row of stale) {
      if (keys.has(row.storageKey)) continue;
      const result = await media.remove(row.productId, row.id);
      if (result.ok) {
        pruned += 1;
      } else {
        problems.push(`${row.storageKey}: could not be detached (${result.reason})`);
      }
    }
  }

  const total = await prisma.productImage.count();
  const withPrimary = await prisma.product.count({ where: { images: { some: { isPrimary: true } } } });
  const products = await prisma.product.count();

  console.log(
    `Media seed complete: ${attached} images attached or refreshed` +
      (pruned ? `, ${pruned} pruned` : "") +
      (skipped ? `, ${skipped} skipped` : "") +
      `. ${total} images across ${withPrimary}/${products} products with a primary image.`,
  );
  if (problems.length > 0) {
    console.log(`\nProblems:\n  ${problems.join("\n  ")}`);
  }
  process.exit(problems.length > 0 ? 1 : 0);
} catch (error) {
  // The type, never the payload: a database error can carry a connection
  // string, and this must not be the thing that prints it.
  console.error(
    `Could not seed the galleries: ${
      error instanceof Error
        ? `${error.name}: ${error.message.split("\n")[0]}`
        : "unknown error"
    }`,
  );
  process.exit(1);
}
