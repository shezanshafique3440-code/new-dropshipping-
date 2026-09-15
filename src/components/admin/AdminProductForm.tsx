"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/FormField";
import { Icon } from "@/components/ui/Icon";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";
import { adminProductHref } from "@/lib/routes";
import { ART_TONES, PRODUCT_ART_KEYS } from "@/types";
import type { AdminProductView } from "@/server/catalog/admin-dto";
import type { ProductErrors, ProductInput } from "@/server/catalog/validation";

export interface AdminProductFormProps {
  /** Absent when creating. */
  product?: AdminProductView;
}

/**
 * Creating and editing a product.
 *
 * One form for both, because they are the same fields — the only difference
 * is that an existing product's slug is shown read-only. A slug is immutable
 * once created: it is the product's URL and the id written into every order
 * that has ever included it, so letting it change would break a link and
 * disconnect a receipt at the same time.
 *
 * The checks here mirror the server's so a mistake is caught while the
 * operator is still looking at the field, but they decide nothing: the server
 * validates every field again, and the table's constraints sit behind that.
 * Errors come back per field from the server and are rendered against the
 * input they belong to.
 */

const BADGE_TONES = ["", "new", "trending", "bestseller", "popular", "sale"] as const;

type Feedback =
  | { kind: "idle" }
  | { kind: "saved"; message: string }
  | { kind: "error"; message: string };

function toInput(product?: AdminProductView): ProductInput {
  if (!product) {
    return {
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      category: "Tech",
      price: "",
      compareAtPrice: "",
      currency: "usd",
      status: "draft",
      featured: false,
      bestseller: false,
      trending: false,
      newArrival: false,
      sortOrder: "0",
      artKey: "headphones",
      tone: "violet",
      features: "",
      badgeLabel: "",
      badgeTone: "",
    };
  }

  return {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? "",
    description: product.description,
    category: product.category,
    price: product.priceInput,
    compareAtPrice: product.compareAtPriceInput,
    currency: product.currency,
    status: product.status,
    featured: product.featured,
    bestseller: product.bestseller,
    trending: product.trending,
    newArrival: product.newArrival,
    sortOrder: String(product.sortOrder),
    artKey: product.artKey,
    tone: product.tone,
    features: product.features.join("\n"),
    badgeLabel: product.badgeLabel,
    badgeTone: product.badgeTone,
  };
}

/** "AeroPulse Headphones" → "aeropulse-headphones". */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export function AdminProductForm({ product }: AdminProductFormProps) {
  const router = useRouter();
  const editing = product !== undefined;

  const [form, setForm] = useState<ProductInput>(() => toInput(product));
  const [slugTouched, setSlugTouched] = useState(editing);
  const [errors, setErrors] = useState<ProductErrors>({});
  const [feedback, setFeedback] = useState<Feedback>({ kind: "idle" });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const onNameChange = (name: string) => {
    setForm((current) => ({
      ...current,
      name,
      // A new product's slug follows the name until the operator edits it
      // themselves, which is the moment it stops being a guess.
      slug: slugTouched ? current.slug : slugify(name),
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) {
      return;
    }
    setSaving(true);
    setErrors({});
    setFeedback({ kind: "idle" });

    const endpoint = editing
      ? `/api/admin/products/${encodeURIComponent(product.slug)}`
      : "/api/admin/products";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...(editing ? { expectedUpdatedAt: product.updatedAt } : {}),
        }),
      });
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setSaving(false);
        const fieldErrors = readErrors(data);
        if (fieldErrors) {
          setErrors(fieldErrors);
          setFeedback({
            kind: "error",
            message: "Some fields need attention before this can be saved.",
          });
          return;
        }
        setFeedback({
          kind: "error",
          message: readMessage(data) ?? "That product could not be saved.",
        });
        return;
      }

      setSaving(false);
      if (editing) {
        setFeedback({ kind: "saved", message: "Saved." });
        // Re-read from the server, so the version this form holds is the one
        // the database now has and the next save is not a phantom conflict.
        router.refresh();
        return;
      }

      const slug = readSlug(data) ?? form.slug;
      router.replace(adminProductHref(slug));
      router.refresh();
    } catch {
      setSaving(false);
      setFeedback({
        kind: "error",
        message: "We could not reach the server. Nothing has been saved.",
      });
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div aria-live="polite" className="empty:hidden">
        {feedback.kind === "saved" ? (
          <p className="type-caption flex items-start gap-2 rounded-xl border border-success/40 bg-success/5 p-3 font-medium text-success">
            <Icon name="check" className="mt-px size-4 shrink-0" strokeWidth={2.5} />
            {feedback.message}
          </p>
        ) : null}
        {feedback.kind === "error" ? (
          <p
            role="alert"
            data-product-error
            className="type-caption flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/5 p-3 font-medium text-danger"
          >
            <Icon name="close" className="mt-px size-4 shrink-0" strokeWidth={2.5} />
            {feedback.message}
          </p>
        ) : null}
      </div>

      <Section heading="Product" id="product-basics">
        <TextField
          label="Name"
          name="name"
          value={form.name}
          error={errors.name}
          maxLength={200}
          onChange={(event) => onNameChange(event.target.value)}
        />

        {editing ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Slug</span>
            <p className="rounded-xl border border-border-subtle bg-surface-muted px-4 py-3 font-mono text-sm break-all">
              {product.slug}
            </p>
            <p className="type-caption text-foreground-subtle">
              A slug cannot change: it is the product&rsquo;s public URL and the
              id recorded against every order that has included it.
            </p>
          </div>
        ) : (
          <TextField
            label="Slug"
            name="slug"
            value={form.slug}
            error={errors.slug}
            maxLength={160}
            hint="Lowercase letters, numbers and single hyphens. This cannot be changed later."
            onChange={(event) => {
              setSlugTouched(true);
              set("slug", event.target.value);
            }}
          />
        )}

        <TextField
          label="Short description"
          name="shortDescription"
          value={form.shortDescription}
          error={errors.shortDescription}
          optional
          maxLength={300}
          onChange={(event) => set("shortDescription", event.target.value)}
        />

        <TextArea
          label="Description"
          name="description"
          value={form.description}
          error={errors.description}
          rows={4}
          onChange={(value) => set("description", value)}
        />

        <TextArea
          label="Selling points"
          name="features"
          value={form.features}
          error={errors.features}
          rows={4}
          optional
          hint="One per line. These appear as the bullet list on the product page."
          onChange={(value) => set("features", value)}
        />
      </Section>

      <Section heading="Money" id="product-money">
        <FieldPair>
          <TextField
            label="Price"
            name="price"
            value={form.price}
            error={errors.price}
            inputMode="decimal"
            placeholder="19.99"
            hint="In dollars, up to two decimal places. Stored as whole cents."
            onChange={(event) => set("price", event.target.value)}
          />
          <TextField
            label="Compare-at price"
            name="compareAtPrice"
            value={form.compareAtPrice}
            error={errors.compareAtPrice}
            optional
            inputMode="decimal"
            placeholder="24.99"
            hint="Shown struck through. Must be at least the price."
            onChange={(event) => set("compareAtPrice", event.target.value)}
          />
        </FieldPair>

        <SelectField
          label="Currency"
          name="currency"
          value={form.currency}
          error={errors.currency}
          onChange={(event) => set("currency", event.target.value)}
        >
          <option value="usd">USD</option>
        </SelectField>
      </Section>

      <Section heading="Placement" id="product-placement">
        <FieldPair>
          <SelectField
            label="Category"
            name="category"
            value={form.category}
            error={errors.category}
            onChange={(event) => set("category", event.target.value)}
          >
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Sort order"
            name="sortOrder"
            value={form.sortOrder}
            error={errors.sortOrder}
            inputMode="numeric"
            hint="Lower sorts first in the catalogue."
            onChange={(event) => set("sortOrder", event.target.value)}
          />
        </FieldPair>

        <SelectField
          label="Status"
          name="status"
          value={form.status}
          error={errors.status}
          hint="Only published products appear in the shop."
          onChange={(event) => set("status", event.target.value)}
        >
          <option value="draft">Draft — hidden from the shop</option>
          <option value="published">Published — on sale</option>
          <option value="archived">Archived — withdrawn, orders keep working</option>
        </SelectField>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium">Merchandising</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <Switch
              label="Featured"
              hint="Appears in the homepage grid."
              checked={form.featured}
              onChange={(checked) => set("featured", checked)}
            />
            <Switch
              label="Best seller"
              hint="Appears in the homepage best-seller row."
              checked={form.bestseller}
              onChange={(checked) => set("bestseller", checked)}
            />
            <Switch
              label="Trending"
              checked={form.trending}
              onChange={(checked) => set("trending", checked)}
            />
            <Switch
              label="New arrival"
              checked={form.newArrival}
              onChange={(checked) => set("newArrival", checked)}
            />
          </div>
        </fieldset>
      </Section>

      <Section heading="Artwork" id="product-artwork">
        <p className="type-caption text-foreground-subtle">
          Products are drawn with the built-in illustration set — there is no
          photography yet, and the database stores a key rather than an image.
        </p>
        <FieldPair>
          <SelectField
            label="Illustration"
            name="artKey"
            value={form.artKey}
            error={errors.artKey}
            onChange={(event) => set("artKey", event.target.value)}
          >
            {PRODUCT_ART_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Tone"
            name="tone"
            value={form.tone}
            error={errors.tone}
            onChange={(event) => set("tone", event.target.value)}
          >
            {ART_TONES.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </SelectField>
        </FieldPair>

        <FieldPair>
          <TextField
            label="Badge label"
            name="badgeLabel"
            value={form.badgeLabel}
            error={errors.badgeLabel}
            optional
            maxLength={40}
            placeholder="Popular"
            onChange={(event) => set("badgeLabel", event.target.value)}
          />
          <SelectField
            label="Badge tone"
            name="badgeTone"
            value={form.badgeTone}
            error={errors.badgeTone}
            optional
            onChange={(event) => set("badgeTone", event.target.value)}
          >
            {BADGE_TONES.map((tone) => (
              <option key={tone || "none"} value={tone}>
                {tone || "None"}
              </option>
            ))}
          </SelectField>
        </FieldPair>
      </Section>

      <div className="flex flex-wrap items-center gap-3 border-t border-border-subtle pt-5">
        <Button type="submit" disabled={saving} aria-busy={saving}>
          {saving ? "Saving…" : editing ? "Save changes" : "Create product"}
        </Button>
        <p className="type-caption text-foreground-subtle">
          {editing
            ? "Editing a product never changes what an existing order says was bought."
            : "New products are saved as drafts unless you choose otherwise."}
        </p>
      </div>
    </form>
  );
}

function Section({
  heading,
  id,
  children,
}: {
  heading: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5"
    >
      <h2 id={`${id}-heading`} className="type-h5">
        {heading}
      </h2>
      {children}
    </section>
  );
}

function FieldPair({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

/** A labelled textarea with the same error and hint wiring as TextField. */
function TextArea({
  label,
  name,
  value,
  error,
  hint,
  rows,
  optional = false,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  error?: string;
  hint?: string;
  rows: number;
  optional?: boolean;
  onChange: (value: string) => void;
}) {
  const id = `product-${name}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional ? (
          <span className="ml-1.5 text-xs font-normal text-foreground-subtle">
            (optional)
          </span>
        ) : (
          <span aria-hidden="true" className="ml-1 text-danger">
            *
          </span>
        )}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full min-w-0 rounded-xl border bg-surface px-4 py-3 text-base text-foreground transition-[border-color] duration-200 placeholder:text-foreground-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:text-sm ${
          error
            ? "border-danger"
            : "border-border hover:border-border-strong focus-visible:border-brand-primary"
        }`}
      />
      {hint ? (
        <p id={hintId} className="type-caption text-foreground-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="type-caption font-medium text-danger">
          • {error}
        </p>
      ) : null}
    </div>
  );
}

/** A checkbox with its own label and hint. A real checkbox, not a div. */
function Switch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = `product-flag-${label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <label
      htmlFor={id}
      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-border-subtle bg-surface-muted/40 p-3"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4.5 shrink-0 accent-[var(--brand-fill)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      />
      <span className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        {hint ? (
          <span className="type-caption text-foreground-subtle">{hint}</span>
        ) : null}
      </span>
    </label>
  );
}

function readErrors(data: unknown): ProductErrors | null {
  if (typeof data === "object" && data !== null && "errors" in data) {
    const errors = (data as { errors?: unknown }).errors;
    if (typeof errors === "object" && errors !== null && !Array.isArray(errors)) {
      return errors as ProductErrors;
    }
  }
  return null;
}

function readMessage(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "error" in data) {
    const message = (data as { error?: unknown }).error;
    if (typeof message === "string" && message.length > 0 && message.length <= 300) {
      return message;
    }
  }
  return null;
}

function readSlug(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "product" in data) {
    const product = (data as { product?: { slug?: unknown } }).product;
    if (product && typeof product.slug === "string") {
      return product.slug;
    }
  }
  return null;
}
