/**
 * What an image actually is, read from its own bytes.
 *
 * Never from a filename, never from a `Content-Type` header, never from a
 * multipart part's declared type: all three are written by whoever is
 * uploading. A `.webp` that is really an HTML document is a stored XSS if the
 * storage origin ever serves it back, and a "1200x1200" claimed in a form
 * field is a layout shift at best. So the header is parsed.
 *
 * Only the four formats the storefront serves are recognised. Anything else —
 * SVG very much included, because SVG is a script container — is rejected by
 * not being recognised at all.
 */
import { isMediaFormat, type MediaFormat } from "./keys";

export interface ImageMetadata {
  format: MediaFormat;
  width: number;
  height: number;
  byteSize: number;
}

/** Parses the header. Returns null for anything that is not a supported image. */
export function readImageMetadata(bytes: Uint8Array): ImageMetadata | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const size = bytes.byteLength;

  const found =
    readPng(bytes, view) ?? readJpeg(bytes, view) ?? readWebp(bytes, view) ?? readAvif(bytes, view);

  if (!found) return null;
  if (!isMediaFormat(found.format)) return null;
  const format: MediaFormat = found.format;
  if (found.width < 1 || found.height < 1) return null;
  if (found.width > 10_000 || found.height > 10_000) return null;

  return { format, width: found.width, height: found.height, byteSize: size };
}

type Raw = { format: string; width: number; height: number };

/** `bytes[i]` is `number | undefined` under the project's strict index rules;
 *  past the end reads as -1, which never matches a magic byte. */
function at(bytes: Uint8Array, index: number): number {
  return bytes[index] ?? -1;
}

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function readPng(bytes: Uint8Array, view: DataView): Raw | null {
  if (bytes.byteLength < 24) return null;
  if (!PNG_MAGIC.every((byte, i) => at(bytes, i) === byte)) return null;
  // Bytes 12..16 must be the IHDR chunk type; its payload starts at 16.
  if (String.fromCharCode(...bytes.subarray(12, 16)) !== "IHDR") return null;
  return { format: "png", width: view.getUint32(16), height: view.getUint32(20) };
}

/**
 * JPEG: walk the marker chain to the frame header.
 *
 * Bounded by the buffer itself and by a segment count, so a file made of ten
 * thousand zero-length segments cannot turn a request into a spin.
 */
function readJpeg(bytes: Uint8Array, view: DataView): Raw | null {
  if (bytes.byteLength < 4 || at(bytes, 0) !== 0xff || at(bytes, 1) !== 0xd8) return null;

  let offset = 2;
  for (let segments = 0; segments < 2048 && offset + 3 < bytes.byteLength; segments += 1) {
    if (at(bytes, offset) !== 0xff) return null;
    const marker = at(bytes, offset + 1);

    // Standalone markers carry no length.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    // Start of scan: past this point is entropy-coded data, not headers.
    if (marker === 0xda || marker === 0xd9) return null;

    const length = view.getUint16(offset + 2);
    if (length < 2) return null;

    // SOF0..SOF15, excluding the four markers in that range that are not frames.
    const isFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrame) {
      if (offset + 9 >= bytes.byteLength) return null;
      return {
        format: "jpeg",
        height: view.getUint16(offset + 5),
        width: view.getUint16(offset + 7),
      };
    }
    offset += 2 + length;
  }
  return null;
}

/** WebP: a RIFF container whose VP8/VP8L/VP8X chunk carries the size. */
function readWebp(bytes: Uint8Array, view: DataView): Raw | null {
  if (bytes.byteLength < 30) return null;
  if (ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 12) !== "WEBP") return null;

  const chunk = ascii(bytes, 12, 16);

  if (chunk === "VP8X") {
    // 24-bit little-endian, stored as (dimension - 1).
    const width = 1 + (at(bytes, 24) | (at(bytes, 25) << 8) | (at(bytes, 26) << 16));
    const height = 1 + (at(bytes, 27) | (at(bytes, 28) << 8) | (at(bytes, 29) << 16));
    return { format: "webp", width, height };
  }

  if (chunk === "VP8 ") {
    // Lossy: a 3-byte start code then two 16-bit dimensions, 14 bits each.
    if (at(bytes, 23) !== 0x9d || at(bytes, 24) !== 0x01 || at(bytes, 25) !== 0x2a) return null;
    return {
      format: "webp",
      width: view.getUint16(26, true) & 0x3fff,
      height: view.getUint16(28, true) & 0x3fff,
    };
  }

  if (chunk === "VP8L") {
    if (at(bytes, 20) !== 0x2f) return null;
    // 14 bits of width then 14 bits of height, packed little-endian.
    const packed = view.getUint32(21, true);
    return {
      format: "webp",
      width: 1 + (packed & 0x3fff),
      height: 1 + ((packed >> 14) & 0x3fff),
    };
  }

  return null;
}

/**
 * AVIF: an ISO-BMFF file whose `ispe` box carries the size.
 *
 * Scanned rather than fully parsed — the box tree is deep and the only thing
 * needed from it is one 8-byte payload — but the scan is bounded to the first
 * 64 KiB of header, which is far more than any real `meta` box needs.
 */
function readAvif(bytes: Uint8Array, view: DataView): Raw | null {
  if (bytes.byteLength < 32) return null;
  if (ascii(bytes, 4, 8) !== "ftyp") return null;
  const brand = ascii(bytes, 8, 12);
  if (brand !== "avif" && brand !== "avis") return null;

  const limit = Math.min(bytes.byteLength - 12, 65_536);
  for (let i = 0; i < limit; i += 1) {
    if (ascii(bytes, i, i + 4) !== "ispe") continue;
    return { format: "avif", width: view.getUint32(i + 8), height: view.getUint32(i + 12) };
  }
  return null;
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  if (end > bytes.byteLength) return "";
  let out = "";
  for (let i = start; i < end; i += 1) out += String.fromCharCode(at(bytes, i));
  return out;
}
