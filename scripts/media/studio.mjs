/**
 * The studio: backdrops, lighting and drawing primitives shared by every
 * product scene.
 *
 * Everything here is deterministic. The same product and view always produce
 * byte-identical SVG, which is what lets `generate-product-media.mjs` be
 * re-run without churning the committed image files.
 */

/**
 * Colour families, one per `ArtTone`.
 *
 * `body`/`body2` are the product's own surfaces, `metal` its trim, `accent`
 * the one saturated detail per render, `soft` a pale surface for light
 * products and `glass` a translucent element. Backdrops stay very light so a
 * render sits comfortably on both the light and dark ZYVERO UI.
 */
export const TONES = {
  violet: {
    bg1: "#f5f2ff", bg2: "#e6dffb", pool: "#ffffff",
    body: "#3b3260", body2: "#524577", metal: "#cfc6ee",
    accent: "#7c5cff", soft: "#f2eeff", deep: "#241d3d", glass: "#b9a9f5",
  },
  blue: {
    bg1: "#eff4ff", bg2: "#dce8fc", pool: "#ffffff",
    body: "#26385f", body2: "#3a4f7a", metal: "#c6d4ee", accent: "#3d7bff",
    soft: "#eef3ff", deep: "#16203a", glass: "#a7c2f5",
  },
  cyan: {
    bg1: "#edf8fa", bg2: "#d6eef3", pool: "#ffffff",
    body: "#1d4750", body2: "#2f626d", metal: "#c2e0e6", accent: "#12a5bd",
    soft: "#ecfafd", deep: "#0e2b31", glass: "#9ad8e4",
  },
  magenta: {
    bg1: "#fdf1f7", bg2: "#f7dfeb", pool: "#ffffff",
    body: "#4d2340", body2: "#6d3859", metal: "#eccada", accent: "#d6489a",
    soft: "#fdf0f7", deep: "#2e1327", glass: "#f0aed0",
  },
  neutral: {
    bg1: "#f6f6f8", bg2: "#e7e7ec", pool: "#ffffff",
    body: "#2f3138", body2: "#45484f", metal: "#d3d5dc", accent: "#6b7080",
    soft: "#f4f4f6", deep: "#1b1c21", glass: "#c3c6ce",
  },
};

export const TONE_KEYS = Object.keys(TONES);

/**
 * The four views every product gets.
 *
 * They are genuinely different renders of the same subject rather than four
 * copies: a straight-on pack shot, a three-quarter turn, a cropped close-up
 * and a wider one on a surface.
 *
 * `describe` writes the alt text. It says what is *visible* and never claims
 * the image is a photograph, because it is not one — these are vector renders
 * this repository draws. The storefront discloses that in visible copy; the
 * alt text's job is to describe the picture to somebody who cannot see it.
 */
export const VIEWS = [
  {
    id: "front",
    label: "Front",
    describe: (name) => `${name} shown from the front against a plain studio background`,
  },
  {
    id: "angle",
    label: "Angle",
    describe: (name) => `${name} shown turned to a three-quarter angle`,
  },
  {
    id: "detail",
    label: "Detail",
    describe: (name) => `Close-up view of the ${lower(name)}, cropped to show its surfaces`,
  },
  {
    id: "lifestyle",
    label: "In use",
    describe: (name) => `${name} shown resting on a light surface`,
  },
];

function lower(name) {
  // "AeroPulse Wireless Headphones" reads badly mid-sentence in title case,
  // but the brand-ish first word should keep its capitals.
  const [first, ...rest] = name.split(" ");
  return [first, ...rest.map((word) => (/[A-Z]{2,}/.test(word) ? word : word.toLowerCase()))].join(" ");
}

export const SIZE = 1200;

/* ---------------------------------------------------------------- shapes */

const attrs = (extra) =>
  Object.entries(extra ?? {})
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("");

export const rr = (x, y, w, h, r, fill, extra) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${attrs(extra)}/>`;

export const cir = (cx, cy, r, fill, extra) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${attrs(extra)}/>`;

export const ell = (cx, cy, rx, ry, fill, extra) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${attrs(extra)}/>`;

export const p = (d, fill, extra) => `<path d="${d}" fill="${fill}"${attrs(extra)}/>`;

export const stroke = (d, color, width, extra) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${attrs(extra)}/>`;

export const g = (transform, ...children) =>
  `<g transform="${transform}">${children.join("")}</g>`;

/** The soft white sheen that makes a moulded surface read as moulded. */
export const gloss = (d, opacity = 0.22) => p(d, "#ffffff", { opacity });

/** Contact shadow under a product standing on the studio floor. */
export const floorShadow = (cx, cy, rx, ry) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#shadow)"/>`;

/* -------------------------------------------------------------- backdrop */

/**
 * Gradients and filters, once per document.
 *
 * `bg` is the sweep behind the product, `pool` the pool of light it stands
 * in, `shadow` its contact shadow, and `bodyG`/`metalG`/`glassG` the vertical
 * falloff that keeps a flat fill from looking flat.
 */
export function defs(t, view) {
  const warm = view === "lifestyle";
  return `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${view === "angle" ? 1 : 0}" y2="1">
      <stop offset="0" stop-color="${warm ? "#ffffff" : t.bg1}"/>
      <stop offset="1" stop-color="${t.bg2}"/>
    </linearGradient>
    <radialGradient id="pool" cx="0.5" cy="0.42" r="0.62">
      <stop offset="0" stop-color="${t.pool}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${t.pool}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="shadow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${t.deep}" stop-opacity="0.26"/>
      <stop offset="0.6" stop-color="${t.deep}" stop-opacity="0.1"/>
      <stop offset="1" stop-color="${t.deep}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bodyG" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${t.body2}"/>
      <stop offset="1" stop-color="${t.body}"/>
    </linearGradient>
    <linearGradient id="bodyH" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${t.body2}"/>
      <stop offset="0.55" stop-color="${t.body}"/>
      <stop offset="1" stop-color="${t.deep}"/>
    </linearGradient>
    <linearGradient id="metalG" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="${t.metal}"/>
    </linearGradient>
    <linearGradient id="softG" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="${t.soft}"/>
    </linearGradient>
    <linearGradient id="accentG" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${t.glass}"/>
      <stop offset="1" stop-color="${t.accent}"/>
    </linearGradient>
    <linearGradient id="glassG" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${t.glass}" stop-opacity="0.45"/>
    </linearGradient>
    <linearGradient id="surfaceG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${t.metal}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${t.metal}" stop-opacity="0.15"/>
    </linearGradient>
  </defs>`;
}

/** The set the product is photographed on, before the product is placed. */
export function backdrop(t, view) {
  const base = `${rr(0, 0, SIZE, SIZE, 0, "url(#bg)")}${rr(0, 0, SIZE, SIZE, 0, "url(#pool)")}`;
  if (view !== "lifestyle") {
    return base;
  }
  // A horizon line and a table plane, so the wide shot reads as a room.
  return (
    base +
    p(`M0 724 H${SIZE} V${SIZE} H0 Z`, "url(#surfaceG)") +
    p(`M0 724 H${SIZE}`, "none", { stroke: t.metal, "stroke-width": 2, opacity: 0.5 }) +
    ell(SIZE * 0.5, 744, 470, 36, t.deep, { opacity: 0.06 })
  );
}

/**
 * Where the camera stands for each shot.
 *
 * Scenes draw around the origin in roughly a 760×760 box and this places
 * them; `detail` deliberately overflows the frame, which is what makes it a
 * crop rather than a small picture of the whole thing.
 */
export function camera(view) {
  switch (view) {
    case "angle":
      return "translate(600 610) rotate(-9) scale(0.94)";
    case "detail":
      return "translate(580 620) scale(1.72)";
    case "lifestyle":
      return "translate(600 548) scale(0.84)";
    default:
      return "translate(600 600) scale(1)";
  }
}
