import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "../db/config";
import { checkSameOrigin } from "../http/same-origin";
import { checkRateLimit, clientKey } from "../rate-limit";
import { getCurrentAdmin, type AdminContext } from "./current-admin";

/**
 * Shared plumbing for the admin endpoints.
 *
 * The same four checks the storefront's auth endpoints run — same origin,
 * database present, rate limit, small well-formed JSON body — reusing the
 * same `checkSameOrigin` and `checkRateLimit` seams rather than a second
 * implementation that could drift. Admin endpoints add a fifth: everything
 * except signing in must resolve a live admin session first.
 *
 * Responses say as little as possible. An operator learns whether the request
 * worked; nobody learns what the server thinks internally, which accounts
 * exist, or what the database had to say about it.
 */

/** Largest body any admin endpoint reads. */
const MAX_BODY_BYTES = 4 * 1024;

export interface AdminGuardOptions {
  request: Request;
  /** Distinguishes limits per endpoint. */
  scope: string;
  limit: number;
  windowMs: number;
}

export type AdminGuardResult = { ok: true } | { ok: false; response: Response };

/**
 * Rate limiting note: the counter lives in this process's memory, the same
 * seam Step 7 introduced. It stops one client hammering an endpoint; it is
 * not distributed, and several instances each hold their own count. Replacing
 * `checkRateLimit` with a shared store is the only change a Redis-backed
 * limiter would need.
 */
export function guardAdminRequest(options: AdminGuardOptions): AdminGuardResult {
  const origin = checkSameOrigin(options.request);
  if (!origin.ok) {
    console.warn(`[admin] Refused a ${origin.reason} request to ${options.scope}.`);
    return {
      ok: false,
      response: adminError(403, "This request could not be verified. Reload and try again."),
    };
  }

  if (!isDatabaseConfigured()) {
    console.error("[admin] No database configured; refusing the request.");
    return {
      ok: false,
      response: adminError(503, "The operations panel is temporarily unavailable."),
    };
  }

  const limit = checkRateLimit(
    clientKey(options.request, options.scope),
    options.limit,
    options.windowMs,
  );
  if (!limit.allowed) {
    return {
      ok: false,
      response: adminError(429, "Too many attempts. Wait a moment and try again.", {
        "retry-after": String(limit.retryAfter),
      }),
    };
  }

  return { ok: true };
}

export type AdminAuthResult =
  | { ok: true; context: AdminContext }
  | { ok: false; response: Response };

/**
 * The administrator behind this request, or a 401.
 *
 * The endpoint equivalent of `requireAdmin()`: identity comes from the admin
 * session cookie and nowhere else, and the answer to "not signed in" and
 * "session no longer valid" is the same status and the same sentence.
 */
export async function requireAdminApi(): Promise<AdminAuthResult> {
  const context = await getCurrentAdmin();
  if (!context) {
    return {
      ok: false,
      response: adminError(401, "Your session has ended. Sign in again."),
    };
  }
  return { ok: true, context };
}

export type AdminBodyResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; response: Response };

export async function readAdminJsonBody(request: Request): Promise<AdminBodyResult> {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return { ok: false, response: adminError(413, "That request was too large.") };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("not an object");
    }
    return { ok: true, value: parsed as Record<string, unknown> };
  } catch {
    return {
      ok: false,
      response: adminError(400, "We could not read that request."),
    };
  }
}

/** Reads a string field, length-capped. Never throws. */
export function readAdminField(
  body: Record<string, unknown>,
  key: string,
  maxLength: number,
): string {
  const value = body[key];
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

export function adminError(
  status: number,
  message: string,
  headers?: Record<string, string>,
): Response {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "cache-control": "no-store",
        // Belt and braces alongside the pages' own robots metadata.
        "x-robots-tag": "noindex, nofollow",
        ...headers,
      },
    },
  );
}

export function adminJson(
  body: Record<string, unknown>,
  init?: { status?: number },
): NextResponse {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

/**
 * Type name only. An admin path must never return a database message, a
 * Prisma code or a stack trace to the browser, and must not write a password
 * or a session token to the log either.
 */
export function describeAdminError(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    return `error code ${String((error as { code?: unknown }).code)}`;
  }
  return error instanceof Error ? error.name : "unknown error";
}
