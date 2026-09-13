import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration.
 *
 * Prisma 7 no longer reads the connection URL from `schema.prisma`: migration
 * and introspection commands read it here, from the environment. The URL is
 * never written down in the repository, and the runtime client gets its
 * connection separately through a driver adapter
 * (see `src/server/db/client.ts`).
 *
 * `.env.local` is loaded first and wins, matching how Next.js resolves
 * environment files, so `npm run db:migrate` talks to the same database the
 * dev server does. Neither file is committed.
 */
loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
