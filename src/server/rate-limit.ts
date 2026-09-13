/**
 * Fixed-window rate limiting.
 *
 * There was no rate-limiting infrastructure in the project before this step,
 * so this is deliberately the smallest thing that stops one client hammering
 * the payment endpoints: an in-process counter per key and window. It is not
 * a distributed limiter — behind several instances each holds its own count —
 * and the seam is here for a shared store (Redis, Upstash) to replace it.
 */

interface Window {
  count: number;
  resetAt: number;
}

const globalKey = Symbol.for("zyvero.rate-limit");

function getWindows(): Map<string, Window> {
  const globals = globalThis as typeof globalThis & {
    [globalKey]?: Map<string, Window>;
  };
  globals[globalKey] ??= new Map<string, Window>();
  return globals[globalKey];
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets, for a `Retry-After` header. */
  retryAfter: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const windows = getWindows();
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    if (windows.size > 5_000) {
      pruneExpired(windows, now);
    }
    return { allowed: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfter: 0 };
}

function pruneExpired(windows: Map<string, Window>, now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) {
      windows.delete(key);
    }
  }
}

/**
 * Best-effort client identity for limiting.
 *
 * Proxy headers are spoofable, so this is a courtesy limit rather than a
 * security boundary — the real protections are server-side price lookup and
 * webhook signature verification.
 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const first = forwarded.split(",")[0]?.trim();
  const ip = first || request.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
