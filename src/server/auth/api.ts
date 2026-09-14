import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "../db/config";
import { checkSameOrigin } from "../http/same-origin";
import { checkRateLimit, clientKey } from "../rate-limit";

/**
 * Shared plumbing for the authentication endpoints.
 *
 * Every one of them needs the same four things before it does any work: a
 * same-origin request, a working database, a rate-limit check, and a body it
 * can trust to be small and well-formed JSON. Doing that once means no
 * endpoint can quietly skip a step.
 *
 * Responses are deliberately plain. A caller learns whether the request
 * succeeded and, at most, which field to fix — never why the server thinks
 * so internally.
 */

/** Largest body any auth endpoint reads. Passwords are capped well below this. */
const MAX_BODY_BYTES = 8 * 1024;

export interface GuardOptions {
  request: Request;
  /** Distinguishes limits per endpoint. */
  scope: string;
  limit: number;
  windowMs: number;
}

export type GuardResult =
  | { ok: true }
  | { ok: false; response: Response };

/**
 * Rate limiting note: the counter is in this process's memory, as it has been
 * since Step 7. It stops a single client hammering an endpoint; it is not a
 * distributed limiter, and several instances each hold their own count. The
 * seam is `checkRateLimit`, so a shared store can replace it without touching
 * any endpoint.
 */
export function guardAuthRequest(options: GuardOptions): GuardResult {
  const origin = checkSameOrigin(options.request);
  if (!origin.ok) {
    console.warn(`[auth] Refused a ${origin.reason} request to ${options.scope}.`);
    return {
      ok: false,
      response: authError(403, "This request could not be verified. Please reload and try again."),
    };
  }

  if (!isDatabaseConfigured()) {
    console.error("[auth] No database configured; refusing the request.");
    return {
      ok: false,
      response: authError(503, "Accounts are temporarily unavailable. Please try again shortly."),
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
      response: authError(429, "Too many attempts. Please wait a moment and try again.", {
        "retry-after": String(limit.retryAfter),
      }),
    };
  }

  return { ok: true };
}

export type BodyResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; response: Response };

export async function readJsonBody(request: Request): Promise<BodyResult> {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return { ok: false, response: authError(413, "That request was too large.") };
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
      response: authError(400, "We could not read that request. Please try again."),
    };
  }
}

/** Reads a string field, trimmed and length-capped. Never throws. */
export function readField(
  body: Record<string, unknown>,
  key: string,
  maxLength: number,
): string {
  const value = body[key];
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

export function authError(
  status: number,
  message: string,
  headers?: Record<string, string>,
  extra?: Record<string, unknown>,
): Response {
  return NextResponse.json(
    { error: message, ...extra },
    { status, headers: { "cache-control": "no-store", ...headers } },
  );
}

export function authJson(
  body: Record<string, unknown>,
  init?: { status?: number },
): NextResponse {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: { "cache-control": "no-store" },
  });
}

/**
 * Type name only. An authentication path must never return a database
 * message, a Prisma code or a stack trace to the browser, and must not write
 * a password or a session token to the log either.
 */
export function describeError(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    return `error code ${String((error as { code?: unknown }).code)}`;
  }
  return error instanceof Error ? error.name : "unknown error";
}
