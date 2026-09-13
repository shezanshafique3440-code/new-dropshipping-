/**
 * Database configuration.
 *
 * Server-only. The connection string is read here and nowhere else, is never
 * returned to a caller, and is never written to a log or an error message —
 * a `DATABASE_URL` typically contains a password, so even an "invalid URL"
 * message must not echo it back.
 */

export class DatabaseConfigError extends Error {}

/** True when the server has been given somewhere to store orders. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new DatabaseConfigError(
      "DATABASE_URL is not set. Copy .env.example to .env.local and point it at a PostgreSQL database.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Deliberately says nothing about the value itself.
    throw new DatabaseConfigError(
      "DATABASE_URL is not a valid connection URL. Expected postgresql://USER:PASSWORD@HOST:PORT/DATABASE",
    );
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new DatabaseConfigError(
      "DATABASE_URL must be a PostgreSQL connection URL (postgresql://…).",
    );
  }

  if (process.env.NEXT_PUBLIC_DATABASE_URL) {
    // A NEXT_PUBLIC_* variable is compiled into the browser bundle. If one of
    // these ever appears, refuse rather than quietly shipping credentials.
    throw new DatabaseConfigError(
      "NEXT_PUBLIC_DATABASE_URL must never be set: it would expose database credentials to the browser.",
    );
  }

  return url;
}

/** Host and database name only — safe to log when diagnosing connectivity. */
export function describeDatabaseTarget(): string {
  try {
    const parsed = new URL(getDatabaseUrl());
    return `${parsed.hostname}:${parsed.port || "5432"}${parsed.pathname}`;
  } catch {
    return "unconfigured";
  }
}
