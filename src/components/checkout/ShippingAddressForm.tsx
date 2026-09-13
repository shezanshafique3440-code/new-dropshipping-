"use client";

import { FieldRow, SelectField, TextField } from "@/components/ui/FormField";
import { addressRulesFor, countries } from "@/data/countries";
import type { AddressField, FieldErrors, ShippingAddress } from "@/types";

export interface ShippingAddressFormProps {
  values: ShippingAddress;
  errors: FieldErrors<AddressField>;
  onChange: (field: AddressField, value: string) => void;
  /** True when a phone number was already given on the information step. */
  hasContactPhone: boolean;
}

/**
 * International address form.
 *
 * Field labels and which fields are required come from the selected country
 * (`@/data/countries`), so the form adapts without inventing per-country
 * format rules that would reject legitimate addresses.
 */
export function ShippingAddressForm({
  values,
  errors,
  onChange,
  hasContactPhone,
}: ShippingAddressFormProps) {
  const rules = addressRulesFor(values.country);

  return (
    <div className="flex flex-col gap-5">
      <SelectField
        name="country"
        autoComplete="country"
        label="Country or region"
        value={values.country}
        error={errors.country}
        data-field="country"
        onChange={(event) => onChange("country", event.target.value)}
      >
        <option value="">Select a destination</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </SelectField>

      <FieldRow className="sm:grid-cols-2">
        <TextField
          name="shipping-given-name"
          autoComplete="shipping given-name"
          label="First name"
          value={values.firstName}
          error={errors.firstName}
          data-field="firstName"
          onChange={(event) => onChange("firstName", event.target.value)}
        />
        <TextField
          name="shipping-family-name"
          autoComplete="shipping family-name"
          label="Last name"
          value={values.lastName}
          error={errors.lastName}
          data-field="lastName"
          onChange={(event) => onChange("lastName", event.target.value)}
        />
      </FieldRow>

      <TextField
        name="shipping-address-line1"
        autoComplete="shipping address-line1"
        label="Address"
        hint="Street and house or building number."
        value={values.address1}
        error={errors.address1}
        data-field="address1"
        onChange={(event) => onChange("address1", event.target.value)}
      />

      <TextField
        name="shipping-address-line2"
        autoComplete="shipping address-line2"
        label="Apartment, suite, unit"
        optional
        value={values.address2}
        error={errors.address2}
        data-field="address2"
        onChange={(event) => onChange("address2", event.target.value)}
      />

      <FieldRow className="sm:grid-cols-2 lg:grid-cols-3">
        <TextField
          name="shipping-city"
          autoComplete="shipping address-level2"
          label="City"
          value={values.city}
          error={errors.city}
          data-field="city"
          onChange={(event) => onChange("city", event.target.value)}
        />
        <TextField
          name="shipping-region"
          autoComplete="shipping address-level1"
          label={rules.regionLabel}
          optional={!rules.regionRequired}
          value={values.region}
          error={errors.region}
          data-field="region"
          onChange={(event) => onChange("region", event.target.value)}
        />
        <TextField
          name="shipping-postal-code"
          autoComplete="shipping postal-code"
          label={rules.postalLabel}
          optional={!rules.postalRequired}
          value={values.postalCode}
          error={errors.postalCode}
          data-field="postalCode"
          onChange={(event) => onChange("postalCode", event.target.value)}
        />
      </FieldRow>

      <TextField
        name="shipping-tel"
        type="tel"
        autoComplete="shipping tel"
        inputMode="tel"
        label="Delivery phone number"
        optional
        hint={
          hasContactPhone
            ? "Leave empty to use the number from the previous step."
            : "Helps the carrier reach you on the day."
        }
        value={values.phone}
        error={errors.phone}
        data-field="phone"
        onChange={(event) => onChange("phone", event.target.value)}
      />
    </div>
  );
}
