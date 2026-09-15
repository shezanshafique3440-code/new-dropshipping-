import { getPrismaClient } from "../db/client";
import { hashPassword } from "../auth/password";
import { normalizeEmail } from "../auth/validation";

/**
 * Creating the first administrator.
 *
 * Deliberately not something the application does. An admin account appears
 * only when somebody runs `npm run admin:bootstrap` with credentials they
 * chose, in an environment they control — never because a server started, and
 * never from a value committed to this repository.
 *
 * Nothing here prints, logs, returns or stores the password in any form other
 * than an Argon2id hash produced by the same `hashPassword` the storefront
 * uses. There is no weaker second implementation to find.
 */

export class AdminBootstrapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminBootstrapError";
  }
}

export type BootstrapOutcome = "created" | "reactivated" | "already-exists";

export interface BootstrapResult {
  outcome: BootstrapOutcome;
  /** The normalized address. Safe to print; the password never is. */
  email: string;
  name: string;
}

/** Admins get a longer minimum than shoppers: one account, far more reach. */
export const MIN_ADMIN_PASSWORD_LENGTH = 12;
const MAX_ADMIN_PASSWORD_LENGTH = 200;
const MAX_ADMIN_NAME_LENGTH = 160;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface BootstrapEnvironment {
  ADMIN_BOOTSTRAP_EMAIL?: string;
  ADMIN_BOOTSTRAP_PASSWORD?: string;
  ADMIN_BOOTSTRAP_NAME?: string;
  ADMIN_BOOTSTRAP_ALLOW_PRODUCTION?: string;
  NODE_ENV?: string;
}

/**
 * Reads the bootstrap credentials from the environment.
 *
 * Both variables are required and neither has a default: an administrator can
 * only come into existence because somebody supplied a password on purpose.
 */
export function readBootstrapCredentials(env: BootstrapEnvironment): {
  email: string;
  password: string;
  name: string;
} {
  for (const key of Object.keys(env)) {
    if (key.startsWith("NEXT_PUBLIC_ADMIN")) {
      // A NEXT_PUBLIC_* variable is compiled into the browser bundle.
      throw new AdminBootstrapError(
        `${key} must never be set: NEXT_PUBLIC_* values are shipped to the browser.`,
      );
    }
  }

  if (env.NODE_ENV === "production" && env.ADMIN_BOOTSTRAP_ALLOW_PRODUCTION !== "true") {
    throw new AdminBootstrapError(
      "Refusing to bootstrap an administrator against a production environment. " +
        "Set ADMIN_BOOTSTRAP_ALLOW_PRODUCTION=true to confirm this is intended.",
    );
  }

  const email = (env.ADMIN_BOOTSTRAP_EMAIL ?? "").trim();
  const password = env.ADMIN_BOOTSTRAP_PASSWORD ?? "";
  const name = (env.ADMIN_BOOTSTRAP_NAME ?? "").trim() || defaultName(email);

  if (!email || !password) {
    throw new AdminBootstrapError(
      "ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD must both be set.",
    );
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    // Says nothing about the value itself beyond that it is not an address.
    throw new AdminBootstrapError("ADMIN_BOOTSTRAP_EMAIL is not a valid email address.");
  }
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new AdminBootstrapError(
      `ADMIN_BOOTSTRAP_PASSWORD must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`,
    );
  }
  if (password.length > MAX_ADMIN_PASSWORD_LENGTH) {
    throw new AdminBootstrapError(
      `ADMIN_BOOTSTRAP_PASSWORD must be under ${MAX_ADMIN_PASSWORD_LENGTH} characters.`,
    );
  }
  if (name.length > MAX_ADMIN_NAME_LENGTH) {
    throw new AdminBootstrapError(
      `ADMIN_BOOTSTRAP_NAME must be under ${MAX_ADMIN_NAME_LENGTH} characters.`,
    );
  }

  return { email, password, name };
}

/**
 * Creates the administrator, or reports that it already exists.
 *
 * Safe to run twice. A second run against an existing address changes no
 * password — rotating a credential is a deliberate act, not a side effect of
 * re-running a setup command — and only reactivates an account that had been
 * switched off.
 */
export async function bootstrapAdmin(env: BootstrapEnvironment): Promise<BootstrapResult> {
  const { email, password, name } = readBootstrapCredentials(env);
  const emailNormalized = normalizeEmail(email);
  const prisma = getPrismaClient();

  const existing = await prisma.adminUser.findUnique({
    where: { emailNormalized },
    select: { id: true, isActive: true, name: true },
  });

  if (existing) {
    if (existing.isActive) {
      return { outcome: "already-exists", email: emailNormalized, name: existing.name };
    }
    await prisma.adminUser.update({
      where: { id: existing.id },
      data: { isActive: true },
    });
    return { outcome: "reactivated", email: emailNormalized, name: existing.name };
  }

  const passwordHash = await hashPassword(password);
  const created = await prisma.adminUser.create({
    data: { email, emailNormalized, name, passwordHash, role: "admin" },
    select: { name: true },
  });

  return { outcome: "created", email: emailNormalized, name: created.name };
}

function defaultName(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local ? `${local.charAt(0).toUpperCase()}${local.slice(1)}` : "Administrator";
}
