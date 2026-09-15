/**
 * Seeds the product catalogue.
 *
 *   npm run db:seed            # create anything missing, touch nothing else
 *   npm run db:seed -- --force # also rewrite existing rows to the seed values
 *
 * The products come from `src/data/mock-storefront.ts`, which is where the
 * catalogue lived before it was a table. Prices are authored the way a person
 * writes them (79.99) and converted to integer minor units here, once, by the
 * application's own money helper.
 *
 * Deterministic and idempotent. Every row is keyed by the product's id, so
 * running it twice creates nothing the second time. The default run never
 * overwrites an existing row: once the shop is live, the catalogue belongs to
 * whoever edits it in the operations panel, and a re-seed should not quietly
 * undo their work. `--force` is the explicit way to say otherwise.
 *
 * No secrets, no customer data, nothing random.
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const force = process.argv.includes("--force");

const { products } = await import("../src/data/mock-storefront.ts");
const { toMinorUnits } = await import("../src/lib/money.ts");
const { getPrismaClient } = await import("../src/server/db/client.ts");

const prisma = getPrismaClient();

/** The seed's view of one product, in the shape the table wants. */
function toRow(product) {
  const compareAt =
    product.compareAtPrice === undefined
      ? null
      : toMinorUnits(product.compareAtPrice);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    shortDescription: null,
    category: product.category,
    features: [...product.features],
    priceAmount: toMinorUnits(product.price),
    compareAtPriceAmount: compareAt,
    currency: "usd",
    // These were the live catalogue, so they seed as published.
    status: "published",
    featured: product.featured === true,
    bestseller: product.tags.includes("bestSeller"),
    trending: product.tags.includes("trending"),
    newArrival: product.tags.includes("newArrival"),
    sortOrder: product.addedRank,
    artKey: product.art,
    tone: product.tone,
    badgeLabel: product.badge?.label ?? null,
    badgeTone: product.badge?.tone ?? null,
    // Stored in tenths so the rating is an exact integer.
    ratingValue: product.rating ? Math.round(product.rating.value * 10) : null,
    ratingCount: product.rating?.count ?? null,
  };
}

let created = 0;
let updated = 0;
let unchanged = 0;

try {
  for (const product of products) {
    const row = toRow(product);
    const { id, ...rest } = row;

    if (force) {
      const result = await prisma.product.upsert({
        where: { id },
        create: row,
        update: rest,
      });
      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created += 1;
      } else {
        updated += 1;
      }
      continue;
    }

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (existing) {
      unchanged += 1;
      continue;
    }
    await prisma.product.create({ data: row });
    created += 1;
  }

  const total = await prisma.product.count();
  console.log(
    force
      ? `Seed complete: ${created} created, ${updated} rewritten. ${total} products in the catalogue.`
      : `Seed complete: ${created} created, ${unchanged} already present (left alone). ${total} products in the catalogue.`,
  );
  if (!force && unchanged > 0) {
    console.log("Run with --force to rewrite existing rows to the seed values.");
  }
  process.exit(0);
} catch (error) {
  // The type, never the payload: a database error can carry a connection
  // string, and this must not be the thing that prints it.
  console.error(
    `Could not seed the catalogue: ${
      error instanceof Error ? `${error.name}: ${error.message.split("\n")[0]}` : "unknown error"
    }`,
  );
  process.exit(1);
}
