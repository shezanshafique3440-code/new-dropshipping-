"use client";

import { FieldRow, TextField } from "@/components/ui/FormField";
import type { CustomerInformation, FieldErrors, InformationField } from "@/types";

export interface CustomerInformationFormProps {
  values: CustomerInformation;
  errors: FieldErrors<InformationField>;
  onChange: (field: InformationField, value: string) => void;
}

export function CustomerInformationForm({
  values,
  errors,
  onChange,
}: CustomerInformationFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <TextField
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        label="Email address"
        hint="Your order confirmation and delivery updates go here."
        value={values.email}
        error={errors.email}
        data-field="email"
        onChange={(event) => onChange("email", event.target.value)}
      />

      <FieldRow className="sm:grid-cols-2">
        <TextField
          name="given-name"
          autoComplete="given-name"
          label="First name"
          value={values.firstName}
          error={errors.firstName}
          data-field="firstName"
          onChange={(event) => onChange("firstName", event.target.value)}
        />
        <TextField
          name="family-name"
          autoComplete="family-name"
          label="Last name"
          value={values.lastName}
          error={errors.lastName}
          data-field="lastName"
          onChange={(event) => onChange("lastName", event.target.value)}
        />
      </FieldRow>

      <TextField
        name="tel"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        label="Phone number"
        optional
        hint="Only used if the carrier needs to reach you about a delivery."
        value={values.phone}
        error={errors.phone}
        data-field="phone"
        onChange={(event) => onChange("phone", event.target.value)}
      />
    </div>
  );
}
