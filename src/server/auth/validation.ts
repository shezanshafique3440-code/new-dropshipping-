/**
 * Authentication input rules.
 *
 * Pure and framework-free — no database, no crypto, no secret — so the same
 * rules can back a route handler, a form and a test, and the sign-up form can
 * import them without dragging a server module into the browser bundle. The
 * browser's copy is a convenience for the customer; only the server's run
 * decides anything.
 */

export const MIN_PASSWORD_LENGTH = 10;

/** Longer than any real password; stops a huge body becoming CPU exhaustion. */
export const MAX_PASSWORD_LENGTH = 200;
export const MAX_NAME_LENGTH = 80;
export const MAX_EMAIL_LENGTH = 254;

/** Same permissive shape the checkout uses: real addresses are odd. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface RegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type FieldErrors<TField extends string> = Partial<Record<TField, string>>;

export type RegistrationField = keyof RegistrationInput;
export type LoginField = "email" | "password";
export type ProfileField = "firstName" | "lastName";

/**
 * Canonical email identity: trimmed and lowercased.
 *
 * `Amelia@Example.com` and `amelia@example.com` are one person, and the unique
 * index is on this value, so they cannot become two accounts.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateRegistration(
  input: RegistrationInput,
): FieldErrors<RegistrationField> {
  const errors: FieldErrors<RegistrationField> = {};

  const firstName = input.firstName.trim();
  if (!firstName) {
    errors.firstName = "Enter your first name.";
  } else if (firstName.length > MAX_NAME_LENGTH) {
    errors.firstName = `Keep your first name under ${MAX_NAME_LENGTH} characters.`;
  }

  const lastName = input.lastName.trim();
  if (!lastName) {
    errors.lastName = "Enter your last name.";
  } else if (lastName.length > MAX_NAME_LENGTH) {
    errors.lastName = `Keep your last name under ${MAX_NAME_LENGTH} characters.`;
  }

  const email = input.email.trim();
  if (!email) {
    errors.email = "Enter your email address.";
  } else if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address, like you@example.com.";
  }

  // Length is the requirement that actually helps. No character-class rules:
  // they push people towards "Password1!" and away from a long passphrase.
  if (!input.password) {
    errors.password = "Choose a password.";
  } else if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  } else if (input.password.length > MAX_PASSWORD_LENGTH) {
    errors.password = `Keep your password under ${MAX_PASSWORD_LENGTH} characters.`;
  } else if (isTooObvious(input.password, email, firstName, lastName)) {
    errors.password = "Choose something less predictable than that.";
  }

  if (!errors.password && input.confirmPassword !== input.password) {
    errors.confirmPassword = "Both passwords need to match.";
  }

  return errors;
}

export function validateLogin(input: {
  email: string;
  password: string;
}): FieldErrors<LoginField> {
  const errors: FieldErrors<LoginField> = {};
  if (!input.email.trim()) {
    errors.email = "Enter your email address.";
  }
  if (!input.password) {
    errors.password = "Enter your password.";
  }
  return errors;
}

export function validateProfile(input: {
  firstName: string;
  lastName: string;
}): FieldErrors<ProfileField> {
  const errors: FieldErrors<ProfileField> = {};

  const firstName = input.firstName.trim();
  if (!firstName) {
    errors.firstName = "Enter your first name.";
  } else if (firstName.length > MAX_NAME_LENGTH) {
    errors.firstName = `Keep your first name under ${MAX_NAME_LENGTH} characters.`;
  }

  const lastName = input.lastName.trim();
  if (!lastName) {
    errors.lastName = "Enter your last name.";
  } else if (lastName.length > MAX_NAME_LENGTH) {
    errors.lastName = `Keep your last name under ${MAX_NAME_LENGTH} characters.`;
  }

  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

/** A handful of guesses anybody would try first, plus the customer's own details. */
const OBVIOUS = [
  "password",
  "12345678",
  "qwertyuiop",
  "letmein",
  "iloveyou",
  "zyvero",
];

function isTooObvious(
  password: string,
  email: string,
  firstName: string,
  lastName: string,
): boolean {
  const lowered = password.toLowerCase();
  if (OBVIOUS.some((candidate) => lowered.includes(candidate))) {
    return true;
  }
  const localPart = email.split("@")[0]?.toLowerCase() ?? "";
  return [localPart, firstName.toLowerCase(), lastName.toLowerCase()]
    .filter((value) => value.length >= 4)
    .some((value) => lowered === value || lowered.startsWith(value));
}

/**
 * Rough guidance for the sign-up form.
 *
 * Deliberately about length, because length is what matters. It is advice, not
 * a gate: only the rules in `validateRegistration` can refuse a password.
 */
export type PasswordStrength = "weak" | "fair" | "strong";

export function assessPassword(password: string): {
  strength: PasswordStrength;
  hint: string;
} {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      strength: "weak",
      hint: `At least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^\w\s]/].filter((pattern) =>
    pattern.test(password),
  ).length;
  if (password.length >= 16 || (password.length >= 12 && variety >= 3)) {
    return { strength: "strong", hint: "Strong password." };
  }
  return {
    strength: "fair",
    hint: "Good. A few more words or characters would be stronger.",
  };
}
