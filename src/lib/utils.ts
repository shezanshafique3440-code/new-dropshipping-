/** Values accepted by {@link cn} — falsy entries are dropped. */
export type ClassValue = string | number | false | null | undefined;

/**
 * Joins conditional class names.
 *
 * A dependency-free stand-in for `clsx`; swap in `clsx` + `tailwind-merge`
 * only if conflicting-utility merging ever becomes necessary.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
