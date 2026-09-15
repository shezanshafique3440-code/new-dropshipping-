/**
 * Renders the catalogue's product imagery.
 *
 *   node --import ./scripts/ts-resolve.mjs scripts/generate-product-media.mjs
 *   ... --only aeropulse-wireless-headphones      # one product
 *   ... --check                                   # render, compare, write nothing
 *
 * What this produces are *generated product renders*: original vector scenes,
 * drawn by this repository, rasterised through the Chromium that Playwright
 * already installs and written as WebP. They are not photographs and nothing
 * in the application claims they are. Every pixel is ours, so there is no
 * licence, no watermark, no third-party branding and no hotlink to somebody
 * else's server — which is exactly why the catalogue can ship with them.
 *
 * Deterministic: the same product and view always produce the same bytes, so
 * re-running this does not churn the committed files. `--check` proves it.
 *
 * Output:
 *   public/products/<slug>/<view>.webp
 *   public/products/manifest.json      (the seed's input — see seed-product-media.mjs)
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { backdrop, camera, defs, SIZE, TONES, VIEWS } from "./media/studio.mjs";
import { sceneFor } from "./media/scenes.mjs";

const args = process.argv.slice(2);
const only = valueOf("--only");
const checkOnly = args.includes("--check");

function valueOf(flag) {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1];
}

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "products");

const { products } = await import("../src/data/mock-storefront.ts");

const selected = only ? products.filter((item) => item.slug === only) : products;
if (selected.length === 0) {
  console.error(`No product matches --only ${only}.`);
  process.exit(1);
}

/* ------------------------------------------------------------------ svg */

function documentFor(product, view) {
  const tone = TONES[product.tone] ?? TONES.neutral;
  const scene = sceneFor(product.art);
  if (!scene) {
    throw new Error(`No scene is drawn for art key "${product.art}" (${product.slug}).`);
  }
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">`,
    defs(tone, view.id),
    backdrop(tone, view.id),
    `<g transform="${camera(view.id)}">${scene(tone)}</g>`,
    `</svg>`,
  ].join("");
}

/* --------------------------------------------------------------- render */

// Playwright is a rendering tool, not something the storefront ships, so it
// is not a dependency of this package. Point `PLAYWRIGHT_CORE` at an install
// (or run this from somewhere `playwright-core` already resolves) and set
// `CHROMIUM_PATH` if the browser is not where Playwright usually puts it.
const { chromium } = await import(process.env.PLAYWRIGHT_CORE ?? "playwright-core").catch(
  () => {
    console.error(
      "This script renders through Chromium and needs `playwright-core`.\n" +
        "Install it, or set PLAYWRIGHT_CORE to the module path of an existing install.",
    );
    process.exit(1);
  },
);

const executablePath = process.env.CHROMIUM_PATH ?? undefined;

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({
  viewport: { width: SIZE, height: SIZE },
  deviceScaleFactor: 1,
});

const sharp = (await import("sharp")).default;

const manifest = [];
let written = 0;
let unchanged = 0;
const drift = [];

try {
  for (const product of selected) {
    const dir = path.join(OUT_DIR, product.slug);
    if (!checkOnly) {
      // The product's whole folder is rebuilt, so a renamed view cannot leave
      // an orphan behind for the seed to pick up.
      await rm(dir, { recursive: true, force: true });
      await mkdir(dir, { recursive: true });
    }

    for (const [index, view] of VIEWS.entries()) {
      const svg = documentFor(product, view);
      await page.setContent(
        `<!doctype html><body style="margin:0;width:${SIZE}px;height:${SIZE}px">${svg}</body>`,
        { waitUntil: "load" },
      );
      const png = await page.screenshot({ type: "png" });
      const webp = await sharp(png).webp({ quality: 90, effort: 6 }).toBuffer();

      const file = path.join(dir, `${view.id}.webp`);
      const relative = path.relative(ROOT, file);
      const digest = createHash("sha256").update(webp).digest("hex").slice(0, 16);

      if (checkOnly) {
        const existing = await readFile(file).catch(() => null);
        if (!existing) {
          drift.push(`${relative}: missing`);
        } else if (!existing.equals(webp)) {
          drift.push(`${relative}: differs`);
        } else {
          unchanged += 1;
        }
      } else {
        await writeFile(file, webp);
        written += 1;
      }

      manifest.push({
        productId: product.id,
        slug: product.slug,
        view: view.id,
        key: `products/${product.slug}/${view.id}.webp`,
        alt: view.describe(product.name),
        label: view.label,
        width: SIZE,
        height: SIZE,
        byteSize: webp.length,
        format: "webp",
        sortOrder: index,
        isPrimary: index === 0,
        digest,
      });
    }
  }
} finally {
  await browser.close();
}

if (checkOnly) {
  if (drift.length > 0) {
    console.error(`Rendered output does not match the committed files:\n  ${drift.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`All ${unchanged} rendered images match the committed files byte for byte.`);
  process.exit(0);
}

// Only a full run may rewrite the manifest: a partial run would drop every
// product it did not render.
if (!only) {
  manifest.sort((a, b) => a.slug.localeCompare(b.slug) || a.sortOrder - b.sortOrder);
  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    `${JSON.stringify({ generatedBy: "scripts/generate-product-media.mjs", images: manifest }, null, 2)}\n`,
  );
}

const bytes = manifest.reduce((sum, item) => sum + item.byteSize, 0);
console.log(
  `Rendered ${written} images for ${selected.length} products (${(bytes / 1024 / 1024).toFixed(2)} MB).` +
    (only ? " Manifest left alone — this was a partial run." : ""),
);
