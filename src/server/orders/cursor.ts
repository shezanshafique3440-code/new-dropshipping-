import { isOrderReference } from "./reference";
import type { OrderPageCursor } from "./repository";

/**
 * Pagination cursors as URL text.
 *
 * A cursor is the (createdAt, reference) pair of the row at the edge of a
 * page. Both halves are the customer's own data — the reference is the order
 * number printed on their confirmation — so nothing internal is exposed: no
 * database id, no offset that shifts under them when an order arrives.
 *
 * It is encoded rather than left readable only to keep it opaque enough that
 * nobody builds a link out of it by hand. It is not a secret and is not
 * treated as one: a tampered cursor changes which page is asked for, never
 * whose orders are returned, because the customer id in the query comes from
 * the session.
 */

const SEPARATOR = "|";

export function encodeOrderCursor(cursor: OrderPageCursor): string {
  const raw = `${cursor.createdAt.toISOString()}${SEPARATOR}${cursor.reference}`;
  return Buffer.from(raw, "utf8").toString("base64url");
}

/** Returns null for anything malformed; the caller then shows page one. */
export function decodeOrderCursor(value: string | undefined): OrderPageCursor | null {
  if (!value || value.length > 200) {
    return null;
  }

  let raw: string;
  try {
    raw = Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const separator = raw.indexOf(SEPARATOR);
  if (separator < 0) {
    return null;
  }

  const timestamp = raw.slice(0, separator);
  const reference = raw.slice(separator + 1);
  if (!isOrderReference(reference)) {
    return null;
  }

  const createdAt = new Date(timestamp);
  if (Number.isNaN(createdAt.getTime())) {
    return null;
  }

  return { createdAt, reference };
}
