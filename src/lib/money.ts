/**
 * Money arithmetic.
 *
 * Every amount that reaches a payment provider is an integer number of minor
 * units (cents for USD). Catalogue prices are authored as decimals, so they
 * are converted once, here, and never multiplied as floats afterwards:
 * `19.99 * 3` is 59.97000000000001, while `1999 * 3` is exactly 5997.
 */

/** Minor units per major unit. USD, and every other two-decimal currency. */
export const MINOR_UNITS_PER_MAJOR = 100;

/** Upper bound for a single order, guarding against absurd or crafted totals. */
export const MAX_ORDER_AMOUNT_MINOR = 50_000_00;

export class MoneyError extends Error {}

/**
 * Converts a major-unit price to minor units.
 *
 * Rounds half away from zero after nudging past binary-float error, so 8.345
 * stored as 8.344999999999999 still becomes 835.
 */
export function toMinorUnits(amount: number): number {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
    throw new MoneyError("Amount must be a finite, non-negative number.");
  }
  const scaled = amount * MINOR_UNITS_PER_MAJOR;
  const rounded = Math.round(Number(scaled.toFixed(6)));
  if (!Number.isSafeInteger(rounded)) {
    throw new MoneyError("Amount is out of range.");
  }
  return rounded;
}

/** Converts minor units back to major units, for display only. */
export function fromMinorUnits(minor: number): number {
  assertMinorUnits(minor);
  return minor / MINOR_UNITS_PER_MAJOR;
}

/** `unit * quantity` in minor units. The only place a line is multiplied. */
export function lineAmount(unitMinor: number, quantity: number): number {
  assertMinorUnits(unitMinor);
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new MoneyError("Quantity must be a positive integer.");
  }
  const total = unitMinor * quantity;
  if (!Number.isSafeInteger(total)) {
    throw new MoneyError("Line total is out of range.");
  }
  return total;
}

/** Sums minor-unit amounts, rejecting anything that is not a whole amount. */
export function sumMinorUnits(values: readonly number[]): number {
  return values.reduce<number>((total, value) => {
    assertMinorUnits(value);
    const next = total + value;
    if (!Number.isSafeInteger(next)) {
      throw new MoneyError("Total is out of range.");
    }
    return next;
  }, 0);
}

function assertMinorUnits(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new MoneyError("Minor-unit amounts must be non-negative integers.");
  }
}

/* -------------------------------------------------------------------------
 * Reading a price a person typed
 *
 * The admin form takes "19.99" and the database stores 1999. Doing that with
 * `Number("19.99") * 100` gives 1998.9999999999998, so this never multiplies a
 * float: the string is split at the decimal point and the halves are read as
 * integers.
 *
 * Nothing is guessed. Three decimal places, a thousands separator, a stray
 * letter, an empty string, a negative, NaN and Infinity are all refused with a
 * reason rather than rounded into something plausible.
 * ---------------------------------------------------------------------- */

/** Decimal places a two-decimal currency allows. */
const PRICE_DECIMALS = 2;

/** Well above any plausible product price; stops absurd or crafted input. */
export const MAX_PRICE_MINOR = MAX_ORDER_AMOUNT_MINOR;

export type PriceParseResult =
  | { ok: true; minor: number }
  | { ok: false; reason: string };

export function parsePriceInput(raw: unknown): PriceParseResult {
  if (typeof raw !== "string" && typeof raw !== "number") {
    return { ok: false, reason: "Enter a price." };
  }

  const value = String(raw).trim();
  if (!value) {
    return { ok: false, reason: "Enter a price." };
  }

  // One optional decimal point, digits either side, nothing else. This is
  // what rejects "1,999", "19.999", "1e3", "-5", "NaN" and "Infinity" — each
  // of them simply fails to match rather than being coerced.
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) {
    if (/^\d+\.\d{3,}$/.test(value)) {
      return {
        ok: false,
        reason: `Use at most ${PRICE_DECIMALS} decimal places, like 19.99.`,
      };
    }
    return { ok: false, reason: "Enter a price like 19.99, with no symbols." };
  }

  const [, whole, fraction = ""] = match;
  const minor =
    Number(whole) * MINOR_UNITS_PER_MAJOR +
    Number(fraction.padEnd(PRICE_DECIMALS, "0"));

  if (!Number.isSafeInteger(minor)) {
    return { ok: false, reason: "That price is out of range." };
  }
  if (minor > MAX_PRICE_MINOR) {
    return {
      ok: false,
      reason: `Keep the price under ${fromMinorUnits(MAX_PRICE_MINOR)}.`,
    };
  }

  return { ok: true, minor };
}

/** Formats minor units back into the form's own input format ("1999" → "19.99"). */
export function toPriceInput(minor: number): string {
  assertMinorUnits(minor);
  const whole = Math.floor(minor / MINOR_UNITS_PER_MAJOR);
  const fraction = minor % MINOR_UNITS_PER_MAJOR;
  return `${whole}.${String(fraction).padStart(PRICE_DECIMALS, "0")}`;
}
