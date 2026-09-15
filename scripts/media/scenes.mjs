/**
 * One scene per product illustration key.
 *
 * Each function draws a single product around the origin, inside roughly a
 * 760x760 box, using only the studio's gradients so that every render shares
 * one lighting setup. The shapes are deliberately generic industrial-design
 * forms: they show what the product *is* without imitating any manufacturer's
 * design, and they carry no logo, wordmark or watermark.
 *
 * Nothing here is a photograph, and nothing here is claimed to be one.
 */
import { cir, ell, g, gloss, floorShadow, p, rr, stroke } from "./studio.mjs";

const BODY = "url(#bodyG)";
const SIDE = "url(#bodyH)";
const METAL = "url(#metalG)";
const SOFT = "url(#softG)";
const ACCENT = "url(#accentG)";
const GLASS = "url(#glassG)";

/** A row of evenly spaced marks — grille slots, key caps, LED pips. */
function repeat(count, fn) {
  return Array.from({ length: count }, (_, i) => fn(i)).join("");
}

export const scenes = {
  /* ------------------------------------------------------------- audio */

  headphones: (t) =>
    floorShadow(0, 330, 250, 34) +
    stroke("M-230 40 A 230 250 0 0 1 230 40", t.metal, 34) +
    stroke("M-214 40 A 214 234 0 0 1 214 40", "#ffffff", 10, { opacity: 0.5 }) +
    [-1, 1]
      .map((s) =>
        g(
          `translate(${s * 228} 120)`,
          rr(-86, -110, 172, 230, 80, SIDE),
          rr(-70, -96, 140, 200, 68, BODY),
          ell(0, 4, 52, 72, t.deep, { opacity: 0.55 }),
          ell(0, 4, 44, 62, ACCENT),
          gloss(`M-58 -70 a 60 74 0 0 1 44 -26 l 0 16 a 46 60 0 0 0 -32 20 Z`, 0.3),
        ),
      )
      .join("") +
    cir(258, 252, 11, t.accent),

  speaker: (t) =>
    floorShadow(0, 300, 210, 30) +
    rr(-170, -220, 340, 490, 96, SIDE) +
    rr(-152, -206, 304, 462, 84, BODY) +
    rr(-118, -170, 236, 330, 58, t.deep, { opacity: 0.45 }) +
    repeat(11, (i) => rr(-112, -160 + i * 29, 224, 13, 7, t.metal, { opacity: 0.32 })) +
    rr(-70, 176, 140, 26, 13, t.metal, { opacity: 0.5 }) +
    cir(-38, 189, 8, t.accent) +
    gloss("M-140 -180 q 26 -22 60 -24 l 0 452 q -36 -4 -60 -26 Z", 0.16),

  earbuds: (t) =>
    floorShadow(0, 260, 240, 28) +
    // Open case, with both buds seated in their wells.
    g(
      "translate(0 110)",
      rr(-200, -96, 400, 226, 96, SIDE),
      rr(-186, -84, 372, 202, 86, SOFT),
      ell(-92, -52, 78, 34, t.deep, { opacity: 0.3 }),
      ell(92, -52, 78, 34, t.deep, { opacity: 0.3 }),
      p("M-186 40 h 372", "none", { stroke: t.metal, "stroke-width": 4 }),
      cir(0, 92, 10, t.accent),
    ) +
    [-1, 1]
      .map((s) =>
        g(
          `translate(${s * 92} -24) rotate(${s * 10})`,
          rr(-17, 28, 34, 92, 17, METAL),
          rr(-52, -76, 104, 130, 50, METAL),
          cir(0, -22, 36, t.deep, { opacity: 0.35 }),
          cir(0, -22, 27, ACCENT),
          gloss("M-34 -56 a 40 46 0 0 1 26 -14 l 0 14 a 28 32 0 0 0 -18 12 Z", 0.55),
        ),
      )
      .join(""),

  /* -------------------------------------------------------------- desk */

  keyboard: (t) =>
    floorShadow(0, 210, 330, 30) +
    g(
      "translate(0 40) skewX(-4)",
      rr(-330, -60, 660, 210, 30, SIDE),
      rr(-330, -76, 660, 180, 26, METAL),
      repeat(4, (row) =>
        repeat(13, (col) =>
          rr(-306 + col * 47, -56 + row * 40, 38, 32, 8, row === 3 && col === 6 ? ACCENT : SOFT),
        ),
      ),
      rr(-306, 104, 612, 8, 4, t.metal, { opacity: 0.45 }),
    ) +
    cir(300, -6, 9, t.accent),

  chargingDock: (t) =>
    floorShadow(0, 300, 200, 28) +
    ell(0, 268, 200, 46, SIDE) +
    ell(0, 250, 200, 46, METAL) +
    ell(0, 246, 150, 33, t.soft) +
    g(
      "translate(70 40)",
      p("M-30 216 L -12 -186 L 34 -186 L 22 216 Z", SIDE),
      gloss("M-30 216 L -12 -186 L 2 -186 L -8 216 Z", 0.24),
    ) +
    g(
      "translate(-28 -120) rotate(-9)",
      rr(-124, -96, 248, 196, 34, SIDE),
      rr(-112, -88, 224, 180, 28, BODY),
      cir(0, 2, 56, t.deep, { opacity: 0.4 }),
      cir(0, 2, 44, ACCENT),
      gloss("M-96 -68 q 14 -14 34 -16 l 0 168 q -22 -4 -34 -18 Z", 0.16),
    ) +
    cir(96, 250, 9, t.accent),

  projector: (t) =>
    floorShadow(0, 280, 250, 30) +
    rr(-250, -150, 500, 400, 64, SIDE) +
    rr(-234, -138, 468, 372, 54, BODY) +
    g(
      "translate(-74 44)",
      cir(0, 0, 122, t.deep, { opacity: 0.5 }),
      cir(0, 0, 104, METAL),
      cir(0, 0, 80, t.deep, { opacity: 0.75 }),
      cir(0, 0, 58, ACCENT),
      cir(-22, -24, 20, "#ffffff", { opacity: 0.55 }),
    ) +
    rr(96, -74, 118, 26, 13, t.metal, { opacity: 0.45 }) +
    repeat(4, (i) => cir(112 + i * 30, 26, 9, i === 0 ? t.accent : t.metal)) +
    gloss("M-218 -112 q 18 -16 44 -18 l 0 340 q -28 -4 -44 -20 Z", 0.14),

  powerBank: (t) =>
    floorShadow(0, 290, 180, 26) +
    g(
      "translate(0 10) rotate(-6)",
      rr(-160, -270, 320, 540, 52, SIDE),
      rr(-146, -258, 292, 516, 44, BODY),
      rr(-104, -212, 208, 118, 22, t.deep, { opacity: 0.4 }),
      repeat(4, (i) => rr(-86 + i * 46, -168, 26, 10, 5, i < 3 ? t.accent : t.metal)),
      rr(-104, -60, 208, 150, 26, METAL, { opacity: 0.35 }),
      repeat(2, (i) => rr(-66 + i * 76, 8, 54, 30, 8, t.deep, { opacity: 0.55 })),
      rr(-46, 150, 92, 60, 18, t.metal, { opacity: 0.4 }),
      gloss("M-134 -230 q 16 -14 38 -16 l 0 474 q -24 -4 -38 -18 Z", 0.16),
    ),

  deskOrganizer: (t) =>
    floorShadow(0, 300, 300, 30) +
    // Pens and a notebook, standing in the back compartments.
    g(
      "translate(-186 -70)",
      rr(-22, -190, 44, 240, 22, ACCENT),
      rr(-22, -190, 44, 66, 22, METAL),
      rr(-30, -206, 60, 26, 13, t.deep, { opacity: 0.45 }),
    ) +
    g(
      "translate(-118 -44)",
      rr(-22, -206, 44, 250, 22, METAL),
      rr(-22, -206, 44, 58, 22, t.body2),
    ) +
    g(
      "translate(-52 -62)",
      rr(-22, -176, 44, 224, 22, SOFT),
      rr(-22, -176, 44, 50, 22, ACCENT, { opacity: 0.8 }),
    ) +
    g("translate(180 -74)", rr(-96, -120, 192, 190, 12, SOFT), rr(-96, -120, 28, 190, 12, ACCENT, { opacity: 0.7 })) +
    rr(-300, -20, 600, 292, 46, SIDE) +
    rr(-300, -46, 600, 262, 42, BODY) +
    rr(-278, -22, 246, 210, 26, METAL, { opacity: 0.42 }) +
    rr(-14, -22, 136, 210, 26, METAL, { opacity: 0.26 }) +
    rr(140, -22, 138, 210, 26, ACCENT, { opacity: 0.8 }) +
    rr(160, 26, 98, 20, 10, "#ffffff", { opacity: 0.45 }) +
    rr(160, 66, 74, 20, 10, "#ffffff", { opacity: 0.32 }) +
    gloss("M-286 -34 q 130 -20 280 -22 l 0 30 q -152 2 -280 22 Z", 0.18),

  phoneStand: (t) =>
    floorShadow(0, 300, 210, 28) +
    g(
      "translate(0 30)",
      p("M-190 250 L -120 -60 L 120 -60 L 190 250 Z", SIDE),
      p("M-170 236 L -108 -46 L 108 -46 L 170 236 Z", METAL),
      rr(-150, 190, 300, 50, 22, SIDE),
    ) +
    g(
      "translate(24 -110) rotate(9)",
      rr(-124, -232, 248, 440, 34, t.deep, { opacity: 0.85 }),
      rr(-112, -220, 224, 416, 26, ACCENT),
      rr(-92, -196, 184, 148, 14, "#ffffff", { opacity: 0.3 }),
      repeat(3, (i) => rr(-92, -24 + i * 42, 150 - i * 30, 18, 9, "#ffffff", { opacity: 0.25 })),
      gloss("M-104 -206 q 10 -10 26 -12 l 0 400 q -18 -4 -26 -14 Z", 0.22),
    ),

  /* ------------------------------------------------------------- light */

  lamp: (t) =>
    floorShadow(0, 320, 190, 28) +
    ell(0, 296, 176, 40, SIDE) +
    ell(0, 282, 176, 40, METAL) +
    rr(-26, 90, 52, 200, 26, SIDE) +
    ell(0, 84, 100, 26, t.metal, { opacity: 0.55 }) +
    cir(0, -50, 232, t.accent, { opacity: 0.09 }) +
    cir(0, -50, 196, t.glass, { opacity: 0.3 }) +
    cir(0, -50, 172, t.glass, { opacity: 0.85 }) +
    cir(0, -50, 172, ACCENT, { opacity: 0.35 }) +
    cir(6, -38, 150, "#ffffff", { opacity: 0.4 }) +
    cir(-48, -104, 56, "#ffffff", { opacity: 0.75 }) +
    p("M-118 66 a 172 172 0 0 0 236 0 a 172 172 0 0 1 -236 0 Z", t.accent, { opacity: 0.18 }) +
    cir(0, 290, 11, t.accent),

  deskLight: (t) =>
    floorShadow(-40, 320, 230, 30) +
    ell(-40, 296, 190, 42, SIDE) +
    ell(-40, 282, 190, 42, METAL) +
    stroke("M-40 274 L -40 60 Q -40 -30 40 -70 L 150 -124", t.body2, 26) +
    stroke("M-40 274 L -40 60 Q -40 -30 40 -70 L 150 -124", "#ffffff", 7, { opacity: 0.32 }) +
    cir(-40, 62, 26, METAL) +
    g(
      "translate(190 -150) rotate(26)",
      rr(-150, -34, 300, 70, 34, SIDE),
      rr(-140, -26, 280, 44, 22, METAL),
      rr(-128, 14, 256, 20, 10, "#ffffff", { opacity: 0.8 }),
    ) +
    p("M60 -96 L 330 -18 L 300 130 L 40 -50 Z", t.accent, { opacity: 0.12 }) +
    cir(-40, 288, 10, t.accent),

  mirror: (t) =>
    floorShadow(0, 320, 180, 28) +
    ell(0, 300, 160, 36, SIDE) +
    ell(0, 288, 160, 36, METAL) +
    rr(-22, 120, 44, 180, 22, SIDE) +
    cir(0, -60, 246, SIDE) +
    cir(0, -60, 228, METAL) +
    cir(0, -60, 192, t.soft) +
    cir(0, -60, 188, "#ffffff", { opacity: 0.9 }) +
    repeat(18, (i) => {
      const a = (i / 18) * Math.PI * 2;
      return cir(Math.cos(a) * 210, -60 + Math.sin(a) * 210, 11, "#ffffff", { opacity: 0.9 });
    }) +
    p("M-120 -150 a 180 180 0 0 1 96 -54 l 0 26 a 156 156 0 0 0 -78 46 Z", t.glass, { opacity: 0.45 }) +
    cir(0, 288, 10, t.accent),

  /* ------------------------------------------------------------ comfort */

  diffuser: (t) =>
    floorShadow(0, 300, 190, 28) +
    repeat(3, (i) =>
      p(
        `M${-70 + i * 70} -250 q ${i % 2 ? 40 : -40} -70 0 -140`,
        "none",
        { stroke: t.glass, "stroke-width": 16, "stroke-linecap": "round", opacity: 0.35 },
      ),
    ) +
    p("M0 -250 q -210 110 -210 290 a 210 210 0 0 0 420 0 q 0 -180 -210 -290 Z", SIDE) +
    p("M-8 -232 q -186 104 -186 272 a 190 190 0 0 0 380 0 q 0 -168 -186 -272 Z", BODY) +
    ell(0, -96, 66, 22, t.deep, { opacity: 0.5 }) +
    ell(0, -102, 60, 18, ACCENT) +
    p("M-120 -30 a 150 150 0 0 1 64 -108 l 16 22 a 124 124 0 0 0 -52 90 Z", "#ffffff", { opacity: 0.26 }) +
    cir(0, 200, 10, t.accent),

  humidifier: (t) =>
    floorShadow(0, 320, 170, 26) +
    repeat(3, (i) =>
      p(`M${-60 + i * 60} -290 q ${i % 2 ? 34 : -34} -64 0 -126`, "none", {
        stroke: t.glass, "stroke-width": 15, "stroke-linecap": "round", opacity: 0.35,
      }),
    ) +
    rr(-160, -280, 320, 580, 84, SIDE) +
    rr(-146, -268, 292, 556, 74, BODY) +
    ell(0, -262, 146, 34, METAL) +
    ell(0, -266, 64, 17, t.deep, { opacity: 0.6 }) +
    rr(-96, -80, 192, 260, 42, GLASS) +
    rr(-96, 60, 192, 120, 42, ACCENT, { opacity: 0.5 }) +
    cir(0, 236, 12, t.accent) +
    gloss("M-132 -230 q 16 -18 40 -22 l 0 512 q -26 -6 -40 -24 Z", 0.16),

  facialSteamer: (t) =>
    floorShadow(0, 310, 200, 28) +
    repeat(5, (i) =>
      p(`M${104 + i * 30} ${-172 - (i % 2) * 24} q ${i % 2 ? 48 : -48} -68 6 -132`, "none", {
        stroke: t.glass, "stroke-width": 16, "stroke-linecap": "round", opacity: 0.42,
      }),
    ) +
    // Weighted base, upright column, angled steam funnel — one connected body.
    ell(0, 288, 190, 42, SIDE) +
    rr(-186, 150, 372, 132, 56, SIDE) +
    rr(-172, 138, 344, 122, 48, BODY) +
    rr(-96, -40, 192, 200, 34, SIDE) +
    rr(-84, -50, 168, 200, 28, BODY) +
    g(
      "translate(22 -46) rotate(22)",
      p("M-116 12 L -58 -138 L 58 -138 L 116 12 Z", SIDE),
      p("M-96 2 L -46 -124 L 46 -124 L 96 2 Z", BODY),
      ell(0, -136, 58, 20, t.deep, { opacity: 0.55 }),
      ell(0, -140, 46, 15, ACCENT),
      rr(-86, -2, 172, 44, 22, METAL),
      gloss("M-80 -4 L -40 -120 l 20 0 L -58 -2 Z", 0.3),
    ) +
    rr(-108, 178, 90, 28, 14, METAL, { opacity: 0.55 }) +
    cir(96, 196, 15, t.accent) +
    gloss("M-70 -30 q 12 -12 28 -14 l 0 180 q -20 -4 -28 -16 Z", 0.2),

  /* ------------------------------------------------------------- carry */

  backpack: (t) =>
    floorShadow(0, 330, 240, 30) +
    // Shoulder straps, wide enough to read from the front.
    [-1, 1]
      .map((s) =>
        stroke(
          `M${s * 104} -272 q ${s * 190} 110 ${s * 156} 330`,
          t.body2,
          52,
        ),
      )
      .join("") +
    [-1, 1]
      .map((s) =>
        stroke(`M${s * 104} -262 q ${s * 172} 106 ${s * 144} 312`, t.metal, 14, { opacity: 0.35 }),
      )
      .join("") +
    stroke("M-48 -306 q 48 -30 96 0", t.metal, 28) +
    p("M-224 -240 q 224 -62 448 0 q 42 214 20 458 q -244 62 -488 0 q -22 -244 20 -458 Z", SIDE) +
    p("M-200 -216 q 200 -56 400 0 q 36 194 18 414 q -218 54 -436 0 q -18 -220 18 -414 Z", BODY) +
    p("M-180 26 q 180 46 360 0 q 8 108 0 172 q -180 42 -360 0 q -8 -64 0 -172 Z", t.deep, { opacity: 0.34 }) +
    stroke("M-164 22 q 164 44 328 0", t.metal, 12) +
    rr(-32, 4, 64, 36, 18, ACCENT) +
    gloss("M-200 -200 q 92 -42 194 -48 l -8 36 q -94 8 -170 46 Z", 0.16),

  slingBag: (t) =>
    floorShadow(0, 300, 260, 28) +
    stroke("M-230 -60 q -30 -230 200 -250 q 230 20 200 250", t.body2, 34) +
    p("M-300 -70 q 300 -130 600 0 q 40 190 -60 300 q -240 70 -480 0 q -100 -110 -60 -300 Z", SIDE) +
    p("M-274 -52 q 274 -116 548 0 q 34 172 -56 272 q -218 62 -436 0 q -90 -100 -56 -272 Z", BODY) +
    stroke("M-250 30 q 250 76 500 0", t.metal, 14) +
    rr(-34, 10, 68, 40, 20, ACCENT) +
    rr(150, -20, 110, 90, 26, t.deep, { opacity: 0.28 }) +
    gloss("M-266 -34 q 130 -58 268 -64 l -10 36 q -132 8 -236 62 Z", 0.16),

  crossbody: (t) =>
    floorShadow(0, 320, 210, 28) +
    stroke("M-190 -110 q -70 -270 190 -286 q 260 16 190 286", t.body2, 26) +
    rr(-230, -120, 460, 400, 54, SIDE) +
    rr(-212, -106, 424, 374, 46, BODY) +
    p("M-230 -120 q 230 -70 460 0 l 0 150 q -230 62 -460 0 Z", SIDE) +
    p("M-212 -108 q 212 -64 424 0 l 0 128 q -212 56 -424 0 Z", METAL, { opacity: 0.5 }) +
    rr(-40, 12, 80, 44, 22, ACCENT) +
    stroke("M-180 156 q 180 40 360 0", t.metal, 10) +
    gloss("M-204 -92 q 100 -40 206 -46 l -8 32 q -104 8 -186 44 Z", 0.18),

  travelOrganizer: (t) =>
    floorShadow(0, 250, 300, 28) +
    g(
      "translate(0 20) rotate(-4)",
      rr(-330, -180, 660, 400, 56, SIDE),
      rr(-314, -168, 628, 372, 48, BODY),
      rr(-280, -132, 560, 150, 26, t.deep, { opacity: 0.3 }),
      repeat(9, (i) => rr(-268 + i * 60, -120, 8, 126, 4, t.metal, { opacity: 0.4 })),
      stroke("M-300 54 h 600", t.metal, 12),
      repeat(9, (i) => rr(-292 + i * 66, 48, 20, 12, 6, t.metal, { opacity: 0.85 })),
      rr(-34, 34, 68, 42, 20, ACCENT),
      rr(-250, 96, 210, 78, 22, METAL, { opacity: 0.4 }),
      rr(60, 96, 200, 78, 22, METAL, { opacity: 0.4 }),
    ),

  storageBox: (t) =>
    floorShadow(0, 300, 280, 30) +
    p("M-272 -90 L 272 -90 L 236 268 L -236 268 Z", SIDE) +
    p("M-252 -74 L 252 -74 L 220 252 L -220 252 Z", BODY) +
    repeat(7, (i) =>
      p(`M${-236 + i * 78} -70 L ${-208 + i * 68} 246`, "none", {
        stroke: "#ffffff", "stroke-width": 5, opacity: 0.08,
      }),
    ) +
    rr(-120, 40, 240, 96, 24, t.deep, { opacity: 0.3 }) +
    rr(-92, 66, 184, 46, 14, ACCENT, { opacity: 0.85 }) +
    p("M-286 -150 L 286 -150 L 272 -84 L -272 -84 Z", METAL) +
    p("M-286 -150 L 286 -150 L 279 -118 L -279 -118 Z", "#ffffff", { opacity: 0.45 }) +
    rr(-70, -196, 140, 50, 24, SIDE) +
    rr(-56, -186, 112, 32, 16, METAL),

  /* ------------------------------------------------------------ bottles */

  bottle: (t) =>
    floorShadow(0, 330, 150, 26) +
    rr(-84, -360, 168, 90, 26, SIDE) +
    rr(-76, -352, 152, 74, 22, METAL) +
    rr(-40, -394, 80, 44, 20, ACCENT) +
    p("M-150 -286 q 150 -26 300 0 l 0 500 q 0 100 -150 100 q -150 0 -150 -100 Z", SIDE) +
    p("M-134 -272 q 134 -24 268 0 l 0 486 q 0 86 -134 86 q -134 0 -134 -86 Z", BODY) +
    rr(-96, -60, 192, 210, 40, t.metal, { opacity: 0.22 }) +
    gloss("M-118 -244 q 30 -12 62 -16 l 0 508 q -40 -10 -62 -38 Z", 0.18),

  sportBottle: (t) =>
    floorShadow(0, 330, 150, 26) +
    stroke("M86 -330 q 86 -10 66 62", t.metal, 24) +
    rr(-76, -366, 152, 84, 26, SIDE) +
    rr(-68, -358, 136, 68, 22, METAL) +
    rr(-30, -406, 60, 46, 18, ACCENT) +
    p("M-140 -292 q 140 -24 280 0 l 0 260 q -34 46 0 92 l 0 156 q 0 90 -140 90 q -140 0 -140 -90 l 0 -156 q 34 -46 0 -92 Z", SIDE) +
    p("M-124 -278 q 124 -22 248 0 l 0 254 q -30 40 0 80 l 0 154 q 0 78 -124 78 q -124 0 -124 -78 l 0 -154 q 30 -40 0 -80 Z", BODY) +
    rr(-96, 12, 192, 74, 24, ACCENT, { opacity: 0.55 }) +
    gloss("M-108 -252 q 26 -12 54 -14 l 0 500 q -34 -10 -54 -34 Z", 0.18),

  /* ---------------------------------------------------------- skincare */

  // Uses only the shared gradients, so it needs no palette of its own.
  skincare: () =>
    floorShadow(0, 300, 300, 30) +
    g(
      "translate(-200 30)",
      rr(-84, -230, 168, 460, 44, SIDE),
      rr(-74, -220, 148, 440, 38, SOFT),
      rr(-52, -290, 104, 66, 22, METAL),
      rr(-46, -104, 92, 120, 18, ACCENT, { opacity: 0.6 }),
    ) +
    g(
      "translate(0 70)",
      rr(-110, -170, 220, 360, 54, SIDE),
      rr(-98, -158, 196, 340, 46, GLASS),
      rr(-64, -226, 128, 62, 22, METAL),
      rr(-80, -20, 160, 180, 34, ACCENT, { opacity: 0.55 }),
    ) +
    g(
      "translate(212 120)",
      ell(0, 120, 128, 30, SIDE),
      rr(-128, -66, 256, 190, 54, SIDE),
      rr(-116, -56, 232, 168, 46, SOFT),
      ell(0, -62, 116, 34, METAL),
      ell(0, -68, 78, 22, ACCENT, { opacity: 0.5 }),
    ),

  iceRoller: (t) =>
    floorShadow(0, 280, 240, 28) +
    g(
      "translate(0 20) rotate(-18)",
      rr(-40, -60, 80, 400, 40, SIDE),
      rr(-30, -48, 60, 380, 30, METAL),
      rr(-46, 300, 92, 50, 24, ACCENT, { opacity: 0.8 }),
      p("M-70 -60 L 70 -60 L 50 -120 L -50 -120 Z", SIDE),
      cir(0, -210, 150, t.glass, { opacity: 0.35 }),
      cir(0, -210, 132, GLASS),
      cir(0, -210, 96, "#ffffff", { opacity: 0.55 }),
      cir(-44, -252, 32, "#ffffff", { opacity: 0.7 }),
    ),

  facialTool: () =>
    floorShadow(0, 280, 230, 26) +
    g(
      "translate(0 30) rotate(-22)",
      rr(-34, -40, 68, 330, 34, SIDE),
      rr(-25, -30, 50, 312, 25, METAL),
      rr(-40, 258, 80, 44, 22, ACCENT, { opacity: 0.85 }),
      p("M0 -260 q 170 34 160 130 q -10 84 -160 92 q -150 -8 -160 -92 q -10 -96 160 -130 Z", SIDE),
      p("M0 -238 q 148 30 140 114 q -8 72 -140 80 q -132 -8 -140 -80 q -8 -84 140 -114 Z", METAL),
      ell(0, -110, 84, 30, ACCENT, { opacity: 0.45 }),
      gloss("M-92 -160 q 40 -44 96 -54 l 8 26 q -50 10 -86 48 Z", 0.5),
    ),

  /* -------------------------------------------------------------- worn */

  watch: (t) =>
    floorShadow(0, 330, 150, 26) +
    p("M-92 -190 q 92 -26 184 0 l -18 -170 q -74 -18 -148 0 Z", SIDE) +
    p("M-92 190 q 92 26 184 0 l -18 170 q -74 18 -148 0 Z", SIDE) +
    repeat(5, (i) => rr(-74, -348 + i * 34, 148, 22, 11, t.metal, { opacity: 0.35 })) +
    rr(-150, -200, 300, 400, 90, SIDE) +
    rr(-136, -186, 272, 372, 80, METAL) +
    rr(-116, -166, 232, 332, 64, t.deep, { opacity: 0.9 }) +
    rr(-96, -140, 192, 90, 22, ACCENT, { opacity: 0.9 }) +
    repeat(3, (i) => rr(-96, -26 + i * 46, 160 - i * 40, 26, 13, "#ffffff", { opacity: 0.28 })) +
    rr(140, -70, 26, 90, 13, METAL) +
    gloss("M-124 -156 q 14 -14 34 -18 l 0 344 q -22 -6 -34 -20 Z", 0.2),

  sunglasses: (t) =>
    floorShadow(0, 190, 300, 26) +
    g(
      "translate(0 -10) rotate(-4)",
      stroke("M-296 -30 q -80 6 -120 140", t.body2, 26),
      stroke("M296 -30 q 80 6 120 140", t.body2, 26),
      p("M-300 -70 q 300 -46 600 0 l -16 44 q -284 -40 -568 0 Z", SIDE),
      rr(-300, -66, 260, 190, 84, SIDE),
      rr(300 - 260, -66, 260, 190, 84, SIDE),
      rr(-286, -54, 232, 166, 74, ACCENT, { opacity: 0.85 }),
      rr(54, -54, 232, 166, 74, ACCENT, { opacity: 0.85 }),
      rr(-40, -56, 80, 34, 16, SIDE),
      gloss("M-262 -30 q 40 -16 84 -18 l -78 128 q -18 -48 -6 -110 Z", 0.35),
      gloss("M62 -30 q 40 -16 84 -18 l -78 128 q -18 -48 -6 -110 Z", 0.35),
    ),

  /* ------------------------------------------------------------ pocket */

  wallet: (t) =>
    floorShadow(0, 260, 280, 28) +
    g(
      "translate(0 20) rotate(-5)",
      rr(-146, -240, 280, 150, 14, SOFT, { transform: "rotate(-7)" }),
      rr(-120, -220, 280, 150, 14, ACCENT, { opacity: 0.5, transform: "rotate(4)" }),
      rr(-300, -150, 600, 400, 40, SIDE),
      rr(-284, -136, 568, 372, 32, BODY),
      p("M-284 46 h 568", "none", { stroke: t.deep, "stroke-width": 8, opacity: 0.35 }),
      rr(-250, 84, 250, 120, 18, t.deep, { opacity: 0.25 }),
      rr(40, 84, 210, 120, 18, ACCENT, { opacity: 0.55 }),
      stroke("M-260 -112 h 520", t.metal, 6, { opacity: 0.45 }),
      gloss("M-270 -120 q 120 -24 250 -26 l -6 30 q -128 4 -238 24 Z", 0.14),
    ),

  cardHolder: (t) =>
    floorShadow(0, 250, 250, 26) +
    g(
      "translate(0 10) rotate(-8)",
      rr(-170, -260, 340, 210, 22, SOFT, { transform: "rotate(-10)" }),
      rr(-150, -230, 340, 210, 22, ACCENT, { opacity: 0.45, transform: "rotate(-3)" }),
      rr(-250, -180, 500, 340, 40, SIDE),
      rr(-236, -168, 472, 316, 32, BODY),
      rr(-190, -110, 200, 200, 22, t.deep, { opacity: 0.28 }),
      rr(30, -110, 160, 200, 22, ACCENT, { opacity: 0.55 }),
      repeat(3, (i) => rr(-170, -80 + i * 48, 150 - i * 34, 16, 8, "#ffffff", { opacity: 0.35 })),
      gloss("M-224 -150 q 100 -20 210 -22 l -6 28 q -108 4 -198 20 Z", 0.16),
    ),

  keyOrganizer: (t) =>
    floorShadow(10, 250, 260, 28) +
    g(
      "translate(-150 26)",
      ...[0, 1, 2, 3].map((i) =>
        g(
          `rotate(${6 + i * 22})`,
          rr(-14, -30, 336, 60, 30, METAL),
          cir(2, 0, 19, t.deep, { opacity: 0.35 }),
          rr(244, -30, 78, 60, 12, i === 1 ? ACCENT : t.metal),
          repeat(3, (k) => rr(258 + k * 21, -26, 11, 20, 4, t.deep, { opacity: 0.45 })),
        ),
      ),
    ) +
    // Two bolted side plates: the organiser itself, slimmer than the keys.
    g(
      "translate(-186 26)",
      rr(-66, -178, 132, 356, 62, SIDE),
      rr(-54, -166, 108, 332, 52, BODY),
      cir(0, -112, 24, METAL),
      cir(0, 112, 24, METAL),
      cir(0, 0, 30, t.deep, { opacity: 0.4 }),
      cir(0, 0, 21, ACCENT),
      rr(-20, -226, 40, 58, 20, METAL),
      gloss("M-46 -146 q 10 -10 22 -12 l 0 312 q -14 -4 -22 -14 Z", 0.22),
    ),

  multiTool: (t) =>
    floorShadow(0, 280, 280, 28) +
    g(
      "translate(0 10) rotate(-10)",
      // Pliers head, open past the end of the handle.
      g(
        "translate(-296 -6)",
        p("M0 -66 L -168 -156 L -196 -104 L -30 -26 Z", METAL),
        p("M0 66 L -168 156 L -196 104 L -30 26 Z", METAL),
        cir(6, 0, 26, t.deep, { opacity: 0.4 }),
        cir(6, 0, 16, t.metal),
      ),
      // Blades fanned out of the other end.
      ...[-34, -12, 12, 34].map((a, i) =>
        g(
          `translate(268 6) rotate(${a})`,
          p(`M0 -${20 - i * 2} L ${230 - i * 26} -${8 - i} L ${236 - i * 26} ${6 + i} L 0 ${20 - i * 2} Z`, METAL),
          p(`M${40} -${14 - i} L ${222 - i * 26} -${5 - i}`, "none", {
            stroke: "#ffffff", "stroke-width": 5, opacity: 0.5,
          }),
        ),
      ),
      rr(-290, -104, 580, 200, 46, SIDE),
      rr(-276, -92, 552, 176, 38, BODY),
      rr(-236, -52, 168, 96, 20, t.deep, { opacity: 0.32 }),
      repeat(6, (i) => rr(-30 + i * 44, -52, 22, 96, 11, i === 2 ? ACCENT : t.metal, { opacity: i === 2 ? 0.9 : 0.4 })),
      cir(-252, 0, 15, METAL),
      gloss("M-262 -74 q 116 -18 246 -20 l -6 24 q -126 4 -240 18 Z", 0.16),
    ),

  /* ------------------------------------------------------------ kitchen */

  mug: (t) =>
    [
      { x: -130, y: 30, s: 0.86 },
      { x: 130, y: 90, s: 1 },
    ]
      .map(({ x, y, s }) =>
        g(
          `translate(${x} ${y}) scale(${s})`,
          floorShadow(10, 250, 160, 26),
          stroke("M150 -80 q 120 30 100 130 q -20 90 -110 96", t.body2, 44),
          p("M-160 -130 q 160 -34 320 0 l -22 300 q 0 100 -138 100 q -138 0 -138 -100 Z", SIDE),
          p("M-146 -118 q 146 -30 292 0 l -20 288 q 0 86 -126 86 q -126 0 -126 -86 Z", BODY),
          ell(0, -126, 160, 42, METAL),
          ell(0, -124, 126, 32, t.deep, { opacity: 0.55 }),
          gloss("M-124 -96 q 22 -12 48 -16 l -14 300 q -30 -14 -40 -42 Z", 0.2),
        ),
      )
      .join(""),
};

/**
 * Not every art key needs its own drawing — two products can be the same kind
 * of object. This is where a key borrows another's scene, and it is a short
 * list on purpose: a borrowed scene must still be an honest picture of the
 * product it illustrates.
 */
export const ALIASES = {};

export function sceneFor(artKey) {
  return scenes[ALIASES[artKey] ?? artKey] ?? null;
}
