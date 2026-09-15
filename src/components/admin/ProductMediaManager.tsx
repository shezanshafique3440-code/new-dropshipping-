"use client";

import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IMAGE_SIZES } from "@/lib/product-media";
import { cn } from "@/lib/utils";
import type { AdminProductImageView, AdminProductMediaView } from "@/server/media/dto";

/**
 * Managing one product's gallery.
 *
 * Reorder, choose the primary image, rewrite alt text, remove an image, and —
 * where the storage driver can actually accept one — upload a new image.
 *
 * Two things this deliberately does not do. It does not call
 * `window.confirm`: removal asks in a named region with the safe choice
 * focused and Escape to back out, the same pattern the status control uses.
 * And it does not draw an upload form when the driver is read-only — a form
 * that cannot store anything is a lie told with a button, so the panel
 * explains how images get published on this deployment instead.
 *
 * The server is the authority for every rule here. Reordering sends the whole
 * list and is rejected if the gallery moved underneath it; alt text is
 * re-validated; the last image cannot be removed. The disabled buttons below
 * are a courtesy, not a control.
 */

export interface ProductMediaManagerProps {
  slug: string;
  media: AdminProductMediaView;
}

type Feedback =
  | { kind: "idle" }
  | { kind: "saved"; message: string }
  | { kind: "error"; message: string };

export function ProductMediaManager({ slug, media }: ProductMediaManagerProps) {
  const router = useRouter();
  const [images, setImages] = useState<readonly AdminProductImageView[]>(media.images);
  const [fromServer, setFromServer] = useState(media.images);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ kind: "idle" });
  const [removing, setRemoving] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const keepButton = useRef<HTMLButtonElement>(null);

  // The page is the source of truth: after `router.refresh()` the server's
  // gallery replaces whatever this component was optimistically showing.
  // Adjusted during render rather than in an effect, so the stale list is
  // never painted first (https://react.dev/reference/react/useState).
  if (fromServer !== media.images) {
    setFromServer(media.images);
    setImages(media.images);
  }

  useEffect(() => {
    if (!removing) return;
    keepButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setRemoving(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [removing, busy]);

  const base = `/api/admin/products/${encodeURIComponent(slug)}/images`;

  const send = async (
    url: string,
    init: RequestInit,
    success: string,
  ): Promise<boolean> => {
    if (busy) return false;
    setBusy(true);
    setFeedback({ kind: "idle" });
    try {
      const response = await fetch(url, init);
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setBusy(false);
        setFeedback({ kind: "error", message: readMessage(data) ?? "That change could not be applied." });
        return false;
      }

      const next = readMedia(data);
      if (next) setImages(next.images);
      setBusy(false);
      setFeedback({ kind: "saved", message: success });
      router.refresh();
      return true;
    } catch {
      setBusy(false);
      setFeedback({
        kind: "error",
        message: "We could not reach the server. Nothing has been changed.",
      });
      return false;
    }
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    const next = [...images];
    const moved = next[index];
    const displaced = next[target];
    if (!moved || !displaced) return;
    next[index] = displaced;
    next[target] = moved;

    // Shown immediately, then confirmed: the list snaps back on the refresh
    // if the server disagrees, which is better than a frozen row.
    setImages(next);
    void send(
      base,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ order: next.map((image) => image.id) }),
      },
      `Moved ${moved.label} to position ${target + 1}.`,
    );
  };

  return (
    <div className="flex flex-col gap-4">
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
            data-media-error
            className="type-caption flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/5 p-3 font-medium text-danger"
          >
            <Icon name="close" className="mt-px size-4 shrink-0" strokeWidth={2.5} />
            {feedback.message}
          </p>
        ) : null}
      </div>

      {images.length === 0 ? (
        <p className="type-caption rounded-xl border border-border-subtle bg-surface-muted p-4 text-foreground-muted">
          This product has no images. The shop draws the built-in illustration panel
          for it until one is added.
        </p>
      ) : (
        <ol data-media-list className="flex flex-col gap-3">
          {images.map((image, index) => (
            <li
              key={image.id}
              data-media-row={image.id}
              className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface p-3"
            >
              {/* Thumbnail and copy on one row, controls on the next.
                  Never side by side: this panel lives in a ~300px aside, and
                  a flex row of five buttons squeezes the text column to zero
                  width and wraps the alt text one character per line. */}
              <div className="flex min-w-0 gap-3">
                <span className="w-20 shrink-0 overflow-hidden rounded-lg border border-border-subtle">
                  <NextImage
                    src={image.src}
                    alt=""
                    width={image.width}
                    height={image.height}
                    sizes={IMAGE_SIZES.line}
                    className="aspect-square size-full object-cover"
                  />
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span>{image.label}</span>
                    {image.isPrimary ? (
                      <span
                        data-primary-badge
                        className="type-caption rounded-full bg-brand-primary-soft px-2 py-0.5 font-semibold text-brand-primary"
                      >
                        Primary
                      </span>
                    ) : null}
                    <span className="type-caption rounded-full bg-surface-muted px-2 py-0.5 font-medium text-foreground-subtle">
                      {image.source}
                    </span>
                  </p>
                  <p className="type-caption break-all text-foreground-subtle">
                    {image.key} · {image.width}×{image.height} ·{" "}
                    {Math.max(1, Math.round(image.byteSize / 1024))} KB
                  </p>

                  {editing === image.id ? (
                    <AltTextForm
                      image={image}
                      busy={busy}
                      onCancel={() => setEditing(null)}
                      onSave={async (altText) => {
                        const saved = await send(
                          `${base}/${encodeURIComponent(image.id)}`,
                          {
                            method: "PATCH",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({ altText }),
                          },
                          "Alt text saved.",
                        );
                        if (saved) setEditing(null);
                      }}
                    />
                  ) : (
                    <p data-media-alt className="type-caption break-words text-foreground-muted">
                      {image.alt}
                    </p>
                  )}
                </div>
              </div>

              {removing === image.id ? (
                <div
                  aria-labelledby={`remove-${image.id}-heading`}
                  className="flex flex-col gap-2 rounded-xl border border-danger/40 bg-danger/5 p-3"
                >
                  <p id={`remove-${image.id}-heading`} className="text-sm font-semibold">
                    Remove this image?
                  </p>
                  <p className="type-caption text-foreground-muted">
                    It disappears from the shop. Orders that show it are unaffected —
                    they keep their own record of what was bought.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={busy}
                      aria-busy={busy}
                      data-confirm-remove={image.id}
                      onClick={() =>
                        void send(
                          `${base}/${encodeURIComponent(image.id)}`,
                          { method: "DELETE" },
                          `Removed ${image.label}.`,
                        ).then((done) => {
                          if (done) setRemoving(null);
                        })
                      }
                    >
                      {busy ? "Working…" : "Remove"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      ref={keepButton}
                      disabled={busy}
                      onClick={() => setRemoving(null)}
                    >
                      Keep it
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <IconAction
                    label={`Move ${image.label} earlier`}
                    icon="arrowRight"
                    className="-rotate-90"
                    disabled={busy || index === 0}
                    onClick={() => move(index, -1)}
                  />
                  <IconAction
                    label={`Move ${image.label} later`}
                    icon="arrowRight"
                    className="rotate-90"
                    disabled={busy || index === images.length - 1}
                    onClick={() => move(index, 1)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy || image.isPrimary}
                    data-make-primary={image.id}
                    onClick={() =>
                      void send(
                        `${base}/${encodeURIComponent(image.id)}`,
                        {
                          method: "PATCH",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ primary: true }),
                        },
                        `${image.label} is now the primary image.`,
                      )
                    }
                  >
                    {image.isPrimary ? "Primary" : "Make primary"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => setEditing(editing === image.id ? null : image.id)}
                  >
                    Alt text
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy || images.length === 1}
                    data-remove-image={image.id}
                    onClick={() => setRemoving(image.id)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      {media.uploadsEnabled ? (
        <UploadForm
          base={base}
          busy={busy}
          full={images.length >= media.maxImages}
          maxBytes={media.maxUploadBytes}
          onUploaded={(next, message) => {
            setImages(next.images);
            setFeedback({ kind: "saved", message });
            router.refresh();
          }}
          onError={(message) => setFeedback({ kind: "error", message })}
          setBusy={setBusy}
        />
      ) : (
        <p className="type-caption rounded-xl border border-border-subtle bg-surface-muted p-4 text-foreground-muted">
          This deployment serves product images from files committed to the
          repository (storage driver: <code>{media.driver}</code>), so images
          cannot be uploaded from here. Add the image to the repository, then
          re-run the media seed to publish it.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- fragments */

function IconAction({
  label,
  icon,
  className,
  disabled,
  onClick,
}: {
  label: string;
  icon: "arrowRight";
  className?: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-foreground-muted transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
    >
      <Icon name={icon} className={cn("size-4", className)} />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function AltTextForm({
  image,
  busy,
  onSave,
  onCancel,
}: {
  image: AdminProductImageView;
  busy: boolean;
  onSave: (altText: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(image.alt);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => field.current?.focus(), []);

  return (
    <div className="flex flex-col gap-2">
      <label className="type-caption font-semibold" htmlFor={`alt-${image.id}`}>
        Alt text — what a screen reader says
      </label>
      <textarea
        id={`alt-${image.id}`}
        ref={field}
        name="altText"
        rows={2}
        maxLength={300}
        value={value}
        disabled={busy}
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-lg border border-border bg-surface p-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy || value.trim().length === 0}
          aria-busy={busy}
          data-save-alt={image.id}
          onClick={() => void onSave(value)}
        >
          {busy ? "Saving…" : "Save alt text"}
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function UploadForm({
  base,
  busy,
  full,
  maxBytes,
  onUploaded,
  onError,
  setBusy,
}: {
  base: string;
  busy: boolean;
  full: boolean;
  maxBytes: number;
  onUploaded: (media: AdminProductMediaView, message: string) => void;
  onError: (message: string) => void;
  setBusy: (busy: boolean) => void;
}) {
  const form = useRef<HTMLFormElement>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || full) return;

    const data = new FormData(event.currentTarget);
    const file = data.get("file");
    if (!(file instanceof File) || file.size === 0) {
      onError("Choose an image to upload.");
      return;
    }
    if (file.size > maxBytes) {
      onError(`That image is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
      return;
    }

    setBusy(true);
    try {
      // No `content-type` header: the browser sets the multipart boundary.
      const response = await fetch(base, { method: "POST", body: data });
      const payload: unknown = await response.json().catch(() => null);
      setBusy(false);

      if (!response.ok) {
        onError(readMessage(payload) ?? "That image could not be stored.");
        return;
      }
      const next = readMedia(payload);
      if (next) onUploaded(next, "Image uploaded.");
      form.current?.reset();
    } catch {
      setBusy(false);
      onError("We could not reach the server. Nothing has been changed.");
    }
  };

  return (
    <form
      ref={form}
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-muted p-4"
    >
      <p className="text-sm font-semibold">Add an image</p>
      <p className="type-caption text-foreground-subtle">
        WebP, AVIF, PNG or JPEG, up to {Math.round(maxBytes / 1024 / 1024)} MB. The
        file&rsquo;s own header decides what it is — the name is ignored.
      </p>

      <label className="type-caption font-semibold" htmlFor="media-file">
        Image file
      </label>
      <input
        id="media-file"
        type="file"
        name="file"
        required
        accept="image/webp,image/avif,image/png,image/jpeg"
        disabled={busy || full}
        className="text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border file:border-border file:bg-surface file:px-4 file:text-sm file:font-medium"
      />

      <label className="type-caption font-semibold" htmlFor="media-alt">
        Alt text
      </label>
      <textarea
        id="media-alt"
        name="altText"
        rows={2}
        required
        maxLength={300}
        disabled={busy || full}
        placeholder="Describe what the image shows."
        className="w-full rounded-lg border border-border bg-surface p-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      />

      <label className="type-caption font-semibold" htmlFor="media-label">
        Label
      </label>
      <input
        id="media-label"
        name="label"
        maxLength={40}
        disabled={busy || full}
        placeholder="Front"
        className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      />

      {full ? (
        <p className="type-caption text-foreground-muted">
          This product already has the maximum number of images. Remove one first.
        </p>
      ) : null}

      <Button type="submit" size="sm" disabled={busy || full} aria-busy={busy}>
        {busy ? "Uploading…" : "Upload image"}
      </Button>
    </form>
  );
}

/* ---------------------------------------------------------------- typing */

function readMessage(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "error" in data) {
    const message = (data as { error?: unknown }).error;
    return typeof message === "string" ? message : null;
  }
  return null;
}

/** Narrows the endpoint's reply without asserting it into shape. */
function readMedia(data: unknown): AdminProductMediaView | null {
  if (typeof data !== "object" || data === null || !("media" in data)) return null;
  const media = (data as { media?: unknown }).media;
  if (typeof media !== "object" || media === null) return null;
  if (!("images" in media) || !Array.isArray((media as { images: unknown }).images)) {
    return null;
  }
  return media as AdminProductMediaView;
}
