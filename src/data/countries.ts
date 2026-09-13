/**
 * Shipping destinations.
 *
 * One place to maintain the list — no dependency, no per-component copies.
 * `region` and `postalCode` describe what each destination actually uses, so
 * the address form can label and require the right fields without inventing
 * country-specific validation rules.
 */
export interface Country {
  /** ISO 3166-1 alpha-2. */
  code: string;
  name: string;
  /** Label for the state/province field, when the country uses one. */
  regionLabel?: string;
  /** Whether a region is expected for a deliverable address. */
  regionRequired?: boolean;
  /** Label for the postal field. */
  postalLabel?: string;
  /** A few destinations do not use postal codes at all. */
  postalRequired?: boolean;
}

export const countries: readonly Country[] = [
  { code: "AE", name: "United Arab Emirates", postalRequired: false },
  { code: "AR", name: "Argentina", regionLabel: "Province" },
  { code: "AT", name: "Austria" },
  { code: "AU", name: "Australia", regionLabel: "State", regionRequired: true },
  { code: "BE", name: "Belgium" },
  { code: "BD", name: "Bangladesh" },
  { code: "BR", name: "Brazil", regionLabel: "State", regionRequired: true },
  { code: "CA", name: "Canada", regionLabel: "Province", regionRequired: true, postalLabel: "Postal code" },
  { code: "CH", name: "Switzerland" },
  { code: "CL", name: "Chile", regionLabel: "Region" },
  { code: "CN", name: "China", regionLabel: "Province" },
  { code: "CO", name: "Colombia", regionLabel: "Department" },
  { code: "CZ", name: "Czechia" },
  { code: "DE", name: "Germany" },
  { code: "DK", name: "Denmark" },
  { code: "EG", name: "Egypt", regionLabel: "Governorate" },
  { code: "ES", name: "Spain", regionLabel: "Province" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom", regionLabel: "County", postalLabel: "Postcode" },
  { code: "GR", name: "Greece" },
  { code: "HK", name: "Hong Kong SAR", postalRequired: false },
  { code: "HU", name: "Hungary" },
  { code: "ID", name: "Indonesia", regionLabel: "Province" },
  { code: "IE", name: "Ireland", regionLabel: "County", postalLabel: "Eircode", postalRequired: false },
  { code: "IL", name: "Israel" },
  { code: "IN", name: "India", regionLabel: "State", regionRequired: true, postalLabel: "PIN code" },
  { code: "IT", name: "Italy", regionLabel: "Province" },
  { code: "JP", name: "Japan", regionLabel: "Prefecture", regionRequired: true },
  { code: "KE", name: "Kenya", regionLabel: "County" },
  { code: "KR", name: "South Korea", regionLabel: "Province" },
  { code: "LK", name: "Sri Lanka" },
  { code: "MA", name: "Morocco" },
  { code: "MX", name: "Mexico", regionLabel: "State", regionRequired: true },
  { code: "MY", name: "Malaysia", regionLabel: "State" },
  { code: "NG", name: "Nigeria", regionLabel: "State" },
  { code: "NL", name: "Netherlands" },
  { code: "NO", name: "Norway" },
  { code: "NZ", name: "New Zealand", regionLabel: "Region" },
  { code: "PH", name: "Philippines", regionLabel: "Province" },
  { code: "PK", name: "Pakistan", regionLabel: "Province" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar", postalRequired: false },
  { code: "RO", name: "Romania", regionLabel: "County" },
  { code: "SA", name: "Saudi Arabia", regionLabel: "Region" },
  { code: "SE", name: "Sweden" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand", regionLabel: "Province" },
  { code: "TR", name: "Türkiye", regionLabel: "Province" },
  { code: "UA", name: "Ukraine", regionLabel: "Oblast" },
  { code: "US", name: "United States", regionLabel: "State", regionRequired: true, postalLabel: "ZIP code" },
  { code: "VN", name: "Vietnam", regionLabel: "Province" },
  { code: "ZA", name: "South Africa", regionLabel: "Province" },
];

export function findCountry(code: string): Country | undefined {
  return countries.find((country) => country.code === code);
}

/** Field labels and requirements for the selected destination. */
export function addressRulesFor(code: string): {
  regionLabel: string;
  regionRequired: boolean;
  postalLabel: string;
  postalRequired: boolean;
} {
  const country = findCountry(code);
  return {
    regionLabel: country?.regionLabel ?? "State / Province / Region",
    regionRequired: country?.regionRequired ?? false,
    postalLabel: country?.postalLabel ?? "Postal code",
    postalRequired: country?.postalRequired ?? true,
  };
}
