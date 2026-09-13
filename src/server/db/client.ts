import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { getDatabaseUrl } from "./config";

/**
 * The Prisma client.
 *
 * Server-only, and constructed lazily so that importing this module during a
 * build — or in a checkout that has no database configured yet — never opens
 * a connection or demands credentials.
 *
 * The instance is cached on `globalThis` because Next.js re-evaluates modules
 * on every hot reload in development: without this, a few minutes of editing
 * would leave dozens of orphaned connection pools behind and eventually
 * exhaust PostgreSQL's connection limit.
 */

const globalKey = Symbol.for("zyvero.prisma");

interface Cached {
  client: PrismaClient;
  url: string;
}

type GlobalWithPrisma = typeof globalThis & { [globalKey]?: Cached };

function createClient(url: string): PrismaClient {
  return new PrismaClient({
    // Prisma 7 connects through a driver adapter; the pool lives in `pg`.
    adapter: new PrismaPg({ connectionString: url }),
    // Quiet by default: SQL in the logs is noise in production and a way to
    // spill customer data into a log aggregator. Warnings and errors only.
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

export function getPrismaClient(): PrismaClient {
  const url = getDatabaseUrl();
  const globals = globalThis as GlobalWithPrisma;
  const cached = globals[globalKey];

  if (cached && cached.url === url) {
    return cached.client;
  }

  const client = createClient(url);
  globals[globalKey] = { client, url };
  return client;
}
