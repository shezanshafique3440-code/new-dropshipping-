import { statSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = new URL("../src/", import.meta.url);

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/** Tries the path as given, then the extensions TypeScript would have added. */
function firstExisting(base) {
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`]) {
    if (isFile(candidate)) {
      return candidate;
    }
  }
  return null;
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const found = firstExisting(fileURLToPath(new URL(specifier.slice(2), SRC)));
    if (found) {
      return { url: pathToFileURL(found).href, shortCircuit: true };
    }
  }

  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    context.parentURL?.startsWith("file:")
  ) {
    const parent = dirname(fileURLToPath(context.parentURL));
    const found = firstExisting(resolvePath(parent, specifier));
    if (found) {
      return { url: pathToFileURL(found).href, shortCircuit: true };
    }
  }

  return next(specifier, context);
}
