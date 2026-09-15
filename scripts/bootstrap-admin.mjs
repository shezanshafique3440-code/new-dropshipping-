/**
 * Creates the first ZYVERO administrator.
 *
 *   ADMIN_BOOTSTRAP_EMAIL=... ADMIN_BOOTSTRAP_PASSWORD=... npm run admin:bootstrap
 *
 * or put those variables in `.env.local`, which this reads the same way the
 * Prisma CLI does. Both are required and neither has a default: no password
 * is written down in this repository, and no administrator exists until
 * somebody deliberately creates one.
 *
 * Running it twice is safe. An address that already has an account is left
 * exactly as it is — the password is never silently rotated — and an account
 * that had been deactivated is switched back on.
 *
 * The password is read from the environment, hashed with the application's own
 * Argon2id utility, and never printed, logged or stored in any other form.
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const { bootstrapAdmin, AdminBootstrapError } = await import(
  "../src/server/admin/bootstrap.ts"
);

const MESSAGES = {
  created: "Administrator created.",
  reactivated: "Administrator reactivated; the existing password still applies.",
  "already-exists": "Administrator already exists; nothing changed.",
};

try {
  const result = await bootstrapAdmin(process.env);
  console.log(`${MESSAGES[result.outcome]}`);
  console.log(`  email: ${result.email}`);
  console.log(`  name:  ${result.name}`);
  console.log("Sign in at /admin/login.");
  process.exit(0);
} catch (error) {
  if (error instanceof AdminBootstrapError) {
    console.error(`Could not bootstrap an administrator: ${error.message}`);
    process.exit(1);
  }
  // Anything else: the type, never the payload — a database error can carry a
  // connection string, and this must not be the thing that prints it.
  console.error(
    `Could not bootstrap an administrator: ${
      error instanceof Error ? error.name : "unknown error"
    }.`,
  );
  process.exit(1);
}
