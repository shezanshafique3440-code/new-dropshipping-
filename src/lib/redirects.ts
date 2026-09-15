/**
 * Safe return-to handling.
 *
 * A `next` parameter is a redirect an attacker can choose, so it is treated as
 * hostile input: only a path on this site is ever followed. Anything that
 * could leave the origin — an absolute URL, a protocol-relative `//host`, a
 * `javascript:` URL, a backslash that browsers normalise into a slash — is
 * discarded in favour of the default.
 */

export const DEFAULT_AFTER_LOGIN = "/account";

export function safeNextPath(
  value: string | null | undefined,
  fallback: string = DEFAULT_AFTER_LOGIN,
): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 512) {
    return fallback;
  }

  // Control characters (including a newline that could split a header) and any
  // whitespace are enough on their own to reject the value.
  if (/[\u0000-\u001f\u007f\s]/.test(value)) {
    return fallback;
  }

  // Must be a single-slash-rooted path. This rules out "//evil.example",
  // "https://evil.example", "javascript:alert(1)" and "\\evil.example".
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }

  // Resolve against a throwaway origin to normalise "/a/../../b" and friends,
  // then keep only same-origin results.
  try {
    const resolved = new URL(value, "https://zyvero.invalid");
    if (resolved.origin !== "https://zyvero.invalid") {
      return fallback;
    }
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}

/** Where an operator lands after signing in, when nothing else is asked for. */
export const DEFAULT_AFTER_ADMIN_LOGIN = "/admin";

/**
 * The same guard, narrowed to the operations panel.
 *
 * An admin sign-in must not become a way to bounce somebody to an arbitrary
 * storefront path, so on top of "a path on this site" the destination has to
 * be inside `/admin` — and not the sign-in page itself, which would loop.
 */
export function safeAdminPath(
  value: string | null | undefined,
  fallback: string = DEFAULT_AFTER_ADMIN_LOGIN,
): string {
  const path = safeNextPath(value, fallback);
  const pathname = path.split("?")[0] ?? "";
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) {
    return fallback;
  }
  // Sending an operator back to the sign-in page they just used would loop.
  return pathname === "/admin/login" ? fallback : path;
}
