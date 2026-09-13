import type {
  Category,
  CommunityTile,
  Product,
  Testimonial,
  TrustItem,
  ValueProp,
} from "@/types";

/**
 * Demo storefront content.
 *
 * Everything here is fictional placeholder data used to build and review the
 * store. Products, prices, ratings and testimonials are NOT real, and nothing
 * is stocked. The exported shapes match `@/types`, so a database, CMS or
 * supplier feed can replace this module later without touching a component.
 *
 * `addedRank` stands in for a `createdAt` timestamp: 1 is the most recently
 * added product. Swap it for a real date column when one exists.
 */
export const products: readonly Product[] = [
  // ---------------------------------------------------------------- Tech
  {
    id: "aeropulse-headphones",
    slug: "aeropulse-wireless-headphones",
    name: "AeroPulse Wireless Headphones",
    category: "Tech",
    description:
      "Over-ear headphones with active noise cancelling, plush memory-foam cups and a 40-hour battery that recharges to half in twenty minutes.",
    features: [
      "Hybrid active noise cancelling with a transparency mode",
      "40-hour battery, 20-minute fast charge",
      "Multipoint pairing across two devices",
    ],
    price: 79.99,
    compareAtPrice: 99.99,
    badge: { label: "Popular", tone: "popular" },
    rating: { value: 4.8, count: 214 },
    tags: ["bestSeller", "trending"],
    featured: true,
    addedRank: 5,
    art: "headphones",
    tone: "violet",
  },
  {
    id: "orbit-mini-speaker",
    slug: "orbit-mini-smart-speaker",
    name: "Orbit Mini Smart Speaker",
    category: "Tech",
    description:
      "A palm-sized speaker with a surprisingly wide soundstage, splash resistance and twelve hours of playback per charge.",
    features: [
      "360° driver array tuned for small rooms",
      "IPX5 splash resistance",
      "Pair two units for stereo",
    ],
    price: 49.99,
    compareAtPrice: 64.99,
    badge: { label: "Trending", tone: "trending" },
    rating: { value: 4.7, count: 158 },
    tags: ["trending"],
    featured: true,
    addedRank: 7,
    art: "speaker",
    tone: "cyan",
  },
  {
    id: "novacharge-dock",
    slug: "novacharge-3-in-1-charging-dock",
    name: "NovaCharge 3-in-1 Charging Dock",
    category: "Tech",
    description:
      "One weighted dock for a phone, watch and earbuds, with magnetic alignment so everything lands in the right spot first time.",
    features: [
      "15W magnetic phone pad",
      "Folds flat for travel",
      "Weighted base stays put one-handed",
    ],
    price: 54.0,
    compareAtPrice: 69.0,
    badge: { label: "New", tone: "new" },
    rating: { value: 4.6, count: 88 },
    tags: ["newArrival"],
    addedRank: 2,
    art: "chargingDock",
    tone: "violet",
  },
  {
    id: "pixelbeam-projector",
    slug: "pixelbeam-portable-projector",
    name: "PixelBeam Portable Projector",
    category: "Tech",
    description:
      "A pocket projector that throws a sharp 100-inch picture onto any pale wall, with autofocus and built-in stereo sound.",
    features: [
      "1080p native, autofocus and keystone correction",
      "Three-hour battery on a single charge",
      "HDMI, USB-C and screen mirroring",
    ],
    price: 149.0,
    compareAtPrice: 189.0,
    badge: { label: "Trending", tone: "trending" },
    rating: { value: 4.5, count: 132 },
    tags: ["trending"],
    addedRank: 9,
    art: "projector",
    tone: "blue",
  },
  {
    id: "flexsound-earbuds",
    slug: "flexsound-mini-earbuds",
    name: "FlexSound Mini Earbuds",
    category: "Tech",
    description:
      "Lightweight earbuds that disappear in the ear, with four tip sizes in the box and a case small enough for a coin pocket.",
    features: [
      "Six hours per charge, 24 with the case",
      "Four silicone tip sizes included",
      "Single-bud mode for calls",
    ],
    price: 39.0,
    badge: { label: "New", tone: "new" },
    rating: { value: 4.4, count: 64 },
    tags: ["newArrival"],
    addedRank: 3,
    art: "earbuds",
    tone: "violet",
  },
  {
    id: "snapcharge-power-bank",
    slug: "snapcharge-magnetic-power-bank",
    name: "SnapCharge Magnetic Power Bank",
    category: "Tech",
    description:
      "A slim 5,000mAh pack that snaps to the back of a phone and tops it up while you keep using it.",
    features: [
      "Magnetic alignment, no cable needed",
      "Pass-through charging",
      "Cabin-bag friendly capacity",
    ],
    price: 34.5,
    compareAtPrice: 44.0,
    rating: { value: 4.6, count: 176 },
    tags: ["bestSeller"],
    addedRank: 12,
    art: "powerBank",
    tone: "blue",
  },
  {
    id: "keystone-keyboard",
    slug: "keystone-low-profile-keyboard",
    name: "Keystone Low-Profile Keyboard",
    category: "Tech",
    description:
      "A quiet low-profile mechanical board with a machined aluminium frame and three saved wireless pairings.",
    features: [
      "Low-profile tactile switches",
      "Aluminium frame, adjustable feet",
      "Three saved Bluetooth pairings",
    ],
    price: 89.0,
    rating: { value: 4.9, count: 221 },
    tags: ["bestSeller"],
    addedRank: 16,
    art: "keyboard",
    tone: "violet",
  },

  // ---------------------------------------------------------------- Home
  {
    id: "novaglow-lamp",
    slug: "novaglow-ambient-lamp",
    name: "NovaGlow Ambient Lamp",
    category: "Home",
    description:
      "A warm ambient lamp with a dimmable glow and a touch base, sized for a bedside table or a shelf that needs softening.",
    features: [
      "Stepless touch dimming",
      "Warm 2700K light, no blue cast",
      "USB-C powered",
    ],
    price: 44.99,
    badge: { label: "New", tone: "new" },
    rating: { value: 4.6, count: 96 },
    tags: ["newArrival"],
    featured: true,
    addedRank: 4,
    art: "lamp",
    tone: "magenta",
  },
  {
    id: "cloudmist-diffuser",
    slug: "cloudmist-aroma-diffuser",
    name: "CloudMist Aroma Diffuser",
    category: "Home",
    description:
      "An ultrasonic diffuser that runs near-silently for eight hours and shuts itself off when the reservoir empties.",
    features: [
      "Eight-hour continuous run",
      "Auto shut-off when empty",
      "Optional low-glow night light",
    ],
    price: 42.0,
    compareAtPrice: 52.0,
    rating: { value: 4.5, count: 154 },
    tags: ["bestSeller"],
    addedRank: 11,
    art: "diffuser",
    tone: "cyan",
  },
  {
    id: "lumidesk-light",
    slug: "lumidesk-led-light",
    name: "LumiDesk LED Light",
    category: "Home",
    description:
      "A jointed desk light with a wide even beam and no visible flicker, so long evenings at a screen stay comfortable.",
    features: [
      "Five brightness steps, three colour temperatures",
      "Flicker-free driver",
      "Weighted clamp base",
    ],
    price: 38.0,
    rating: { value: 4.4, count: 71 },
    tags: [],
    addedRank: 18,
    art: "deskLight",
    tone: "neutral",
  },
  {
    id: "zenwave-organizer",
    slug: "zenwave-desk-organizer",
    name: "ZenWave Desk Organizer",
    category: "Home",
    description:
      "A compact tray-and-slot organizer in soft-touch resin that keeps pens, cables and a phone from colonising the desk.",
    features: [
      "Six sized compartments",
      "Non-slip felt underside",
      "Stackable with a second unit",
    ],
    price: 32.0,
    compareAtPrice: 39.0,
    rating: { value: 4.3, count: 58 },
    tags: [],
    addedRank: 21,
    art: "deskOrganizer",
    tone: "neutral",
  },
  {
    id: "purebreeze-humidifier",
    slug: "purebreeze-mini-humidifier",
    name: "PureBreeze Mini Humidifier",
    category: "Home",
    description:
      "A desk-sized humidifier for dry rooms and long flights, quiet enough to leave running through a call.",
    features: [
      "26dB operation",
      "Ten-hour tank",
      "Washable filter, no cartridges",
    ],
    price: 29.99,
    badge: { label: "New", tone: "new" },
    rating: { value: 4.2, count: 47 },
    tags: ["newArrival"],
    addedRank: 6,
    art: "humidifier",
    tone: "cyan",
  },
  {
    id: "ember-mug-set",
    slug: "ember-stoneware-mug-set",
    name: "Ember Stoneware Mug Set",
    category: "Home",
    description:
      "Two hand-glazed stoneware mugs with a heavy base that holds heat and a handle wide enough for a whole hand.",
    features: [
      "Set of two, 350ml each",
      "Dishwasher and microwave safe",
      "Reactive glaze, no two identical",
    ],
    price: 34.0,
    rating: { value: 4.6, count: 189 },
    tags: ["bestSeller"],
    addedRank: 20,
    art: "mug",
    tone: "neutral",
  },

  // ----------------------------------------------------------- Lifestyle
  {
    id: "flexcore-backpack",
    slug: "flexcore-everyday-backpack",
    name: "FlexCore Everyday Backpack",
    category: "Lifestyle",
    description:
      "A 20-litre everyday pack with a padded laptop sleeve, a quick-reach top pocket and straps that hold their shape.",
    features: [
      "Fits a 16-inch laptop",
      "Water-repellent recycled shell",
      "Luggage pass-through strap",
    ],
    price: 59.99,
    compareAtPrice: 74.99,
    badge: { label: "Best Seller", tone: "bestseller" },
    rating: { value: 4.9, count: 331 },
    tags: ["bestSeller"],
    featured: true,
    addedRank: 10,
    art: "backpack",
    tone: "blue",
  },
  {
    id: "urbancarry-sling",
    slug: "urbancarry-sling-bag",
    name: "UrbanCarry Sling Bag",
    category: "Lifestyle",
    description:
      "A crossbody sling for the days you only need a phone, a wallet and a charger, with a strap that swings round to the front.",
    features: [
      "Three-litre main compartment",
      "Hidden rear zip pocket",
      "One-pull strap adjustment",
    ],
    price: 46.0,
    compareAtPrice: 58.0,
    badge: { label: "Trending", tone: "trending" },
    rating: { value: 4.5, count: 118 },
    tags: ["trending"],
    addedRank: 8,
    art: "slingBag",
    tone: "blue",
  },
  {
    id: "dailyflex-crossbody",
    slug: "dailyflex-crossbody",
    name: "DailyFlex Crossbody",
    category: "Lifestyle",
    description:
      "A structured crossbody in vegan leather that keeps its shape when empty and still swallows a small water bottle.",
    features: [
      "Structured vegan leather",
      "Magnetic quick-open flap",
      "Adjustable webbing strap",
    ],
    price: 52.0,
    badge: { label: "New", tone: "new" },
    rating: { value: 4.4, count: 39 },
    tags: ["newArrival"],
    addedRank: 1,
    art: "crossbody",
    tone: "violet",
  },
  {
    id: "motionfit-bottle",
    slug: "motionfit-bottle",
    name: "MotionFit Bottle",
    category: "Lifestyle",
    description:
      "A gym bottle with a one-handed flip lid, measurement markings and a lid that seals hard enough for a kit bag.",
    features: [
      "750ml, one-handed flip lid",
      "Leak-tested seal",
      "Fits a standard bottle cage",
    ],
    price: 31.0,
    compareAtPrice: 38.0,
    rating: { value: 4.3, count: 92 },
    tags: [],
    addedRank: 24,
    art: "sportBottle",
    tone: "cyan",
  },

  // -------------------------------------------------------------- Beauty
  {
    id: "glowmist-steamer",
    slug: "glowmist-facial-steamer",
    name: "GlowMist Facial Steamer",
    category: "Beauty",
    description:
      "A nano-ionic steamer that warms up in thirty seconds and runs for a full ten-minute session on one fill.",
    features: [
      "30-second warm-up",
      "Ten-minute session per fill",
      "Auto shut-off",
    ],
    price: 68.0,
    compareAtPrice: 85.0,
    badge: { label: "Trending", tone: "trending" },
    rating: { value: 4.5, count: 103 },
    tags: ["trending"],
    addedRank: 13,
    art: "facialSteamer",
    tone: "magenta",
  },
  {
    id: "lumiglow-mirror",
    slug: "lumiglow-mirror",
    name: "LumiGlow Mirror",
    category: "Beauty",
    description:
      "A lit mirror with three colour temperatures and true-to-life rendering, so make-up looks the same outside as it did at the desk.",
    features: [
      "Three light temperatures",
      "High colour-rendering LEDs",
      "Rechargeable, cordless",
    ],
    price: 74.0,
    rating: { value: 4.7, count: 167 },
    tags: ["bestSeller"],
    addedRank: 15,
    art: "mirror",
    tone: "magenta",
  },
  {
    id: "skincloud-ice-roller",
    slug: "skincloud-ice-roller",
    name: "SkinCloud Ice Roller",
    category: "Beauty",
    description:
      "A stainless roller you keep in the fridge, for puffy mornings and the hour after a long flight.",
    features: [
      "Stainless head holds cold",
      "Contoured for jaw and under-eye",
      "No batteries, nothing to charge",
    ],
    price: 22.0,
    badge: { label: "New", tone: "new" },
    rating: { value: 4.4, count: 81 },
    tags: ["newArrival"],
    addedRank: 14,
    art: "iceRoller",
    tone: "cyan",
  },
  {
    id: "puretouch-facial-tool",
    slug: "puretouch-facial-tool",
    name: "PureTouch Facial Tool",
    category: "Beauty",
    description:
      "A weighted gua sha tool in polished stone, shaped to follow the jaw and cheekbone without digging in.",
    features: [
      "Polished natural stone",
      "Contoured double edge",
      "Travel pouch included",
    ],
    price: 26.5,
    compareAtPrice: 33.0,
    rating: { value: 4.2, count: 54 },
    tags: [],
    addedRank: 25,
    art: "facialTool",
    tone: "magenta",
  },
  {
    id: "nimbus-skincare-set",
    slug: "nimbus-daily-skincare-set",
    name: "Nimbus Daily Skincare Set",
    category: "Beauty",
    description:
      "A four-step daily set — cleanser, essence, serum and moisturiser — in travel-legal sizes with no fragrance.",
    features: [
      "Four steps, fragrance free",
      "Travel-legal 100ml sizes",
      "Refill pouches available",
    ],
    price: 52.0,
    compareAtPrice: 68.0,
    badge: { label: "New", tone: "new" },
    rating: { value: 4.4, count: 77 },
    tags: ["newArrival"],
    addedRank: 17,
    art: "skincare",
    tone: "blue",
  },

  // --------------------------------------------------------- Accessories
  {
    id: "pulse-active-watch",
    slug: "pulse-active-smartwatch",
    name: "Pulse Active Smartwatch",
    category: "Accessories",
    description:
      "A lightweight tracker with a bright always-on display, seven-day battery and swim-proof housing.",
    features: [
      "Seven-day typical battery",
      "5ATM swim-proof",
      "Sleep and workout tracking",
    ],
    price: 129.0,
    compareAtPrice: 159.0,
    badge: { label: "Best Seller", tone: "bestseller" },
    rating: { value: 4.8, count: 402 },
    tags: ["bestSeller"],
    addedRank: 19,
    art: "watch",
    tone: "violet",
  },
  {
    id: "verve-sunglasses",
    slug: "verve-polarised-sunglasses",
    name: "Verve Polarised Sunglasses",
    category: "Accessories",
    description:
      "Polarised lenses in a light acetate frame, with spring hinges that survive being pushed onto the top of your head.",
    features: [
      "Polarised UV400 lenses",
      "Spring-loaded hinges",
      "Hard case and cloth included",
    ],
    price: 64.0,
    compareAtPrice: 82.0,
    badge: { label: "Trending", tone: "trending" },
    rating: { value: 4.5, count: 143 },
    tags: ["trending"],
    addedRank: 23,
    art: "sunglasses",
    tone: "magenta",
  },
  {
    id: "urbanlink-wallet",
    slug: "urbanlink-wallet",
    name: "UrbanLink Wallet",
    category: "Accessories",
    description:
      "A slim bifold with RFID-blocking lining that holds eight cards and folded notes without turning into a brick.",
    features: [
      "RFID-blocking lining",
      "Eight card slots plus a note pocket",
      "Full-grain leather",
    ],
    price: 45.0,
    rating: { value: 4.6, count: 121 },
    tags: [],
    addedRank: 26,
    art: "wallet",
    tone: "neutral",
  },
  {
    id: "novagrip-phone-stand",
    slug: "novagrip-phone-stand",
    name: "NovaGrip Phone Stand",
    category: "Accessories",
    description:
      "A folding aluminium stand that holds a phone or small tablet at a comfortable angle and disappears into a pocket.",
    features: [
      "Folds to 8mm thick",
      "Adjustable viewing angle",
      "Silicone pads, no scratches",
    ],
    price: 24.0,
    compareAtPrice: 29.0,
    rating: { value: 4.5, count: 96 },
    tags: [],
    addedRank: 27,
    art: "phoneStand",
    tone: "cyan",
  },
  {
    id: "flexloop-key-organizer",
    slug: "flexloop-key-organizer",
    name: "FlexLoop Key Organizer",
    category: "Accessories",
    description:
      "A compact key holder that stacks up to six keys into a silent block, ending the jangle in your pocket.",
    features: [
      "Holds up to six keys",
      "Anodised aluminium plates",
      "Loop for a car fob",
    ],
    price: 19.5,
    rating: { value: 4.3, count: 68 },
    tags: [],
    addedRank: 30,
    art: "keyOrganizer",
    tone: "neutral",
  },
  {
    id: "edgecarry-card-holder",
    slug: "edgecarry-card-holder",
    name: "EdgeCarry Card Holder",
    category: "Accessories",
    description:
      "A minimal card holder with a thumb slide that fans four cards out one-handed at a ticket barrier.",
    features: [
      "Thumb-slide card release",
      "Holds four cards",
      "Fits a front pocket",
    ],
    price: 28.0,
    badge: { label: "New", tone: "new" },
    rating: { value: 4.4, count: 43 },
    tags: ["newArrival"],
    addedRank: 28,
    art: "cardHolder",
    tone: "neutral",
  },

  // -------------------------------------------------- Everyday Essentials
  {
    id: "halo-hydration-bottle",
    slug: "halo-insulated-bottle",
    name: "Halo Insulated Bottle",
    category: "Everyday Essentials",
    description:
      "A double-walled bottle that holds cold for a full day and hot for half of one, with a lid that never smells of coffee.",
    features: [
      "24 hours cold, 12 hours hot",
      "Odour-resistant steel interior",
      "Fits most cup holders",
    ],
    price: 28.5,
    rating: { value: 4.7, count: 268 },
    tags: ["bestSeller"],
    addedRank: 29,
    art: "bottle",
    tone: "cyan",
  },
  {
    id: "smartfold-storage-box",
    slug: "smartfold-storage-box",
    name: "SmartFold Storage Box",
    category: "Everyday Essentials",
    description:
      "A collapsible storage box that folds to two centimetres when empty, for the cupboard that is always nearly full.",
    features: [
      "Folds flat to 2cm",
      "Reinforced lid, stacks three high",
      "Wipe-clean lining",
    ],
    price: 21.0,
    compareAtPrice: 26.0,
    rating: { value: 4.2, count: 74 },
    tags: [],
    addedRank: 31,
    art: "storageBox",
    tone: "neutral",
  },
  {
    id: "easygrip-multi-tool",
    slug: "easygrip-multi-tool",
    name: "EasyGrip Multi Tool",
    category: "Everyday Essentials",
    description:
      "Eleven tools in a pocket-sized body with a grip that stays comfortable when you actually have to apply force.",
    features: [
      "Eleven tools, lock-in blades",
      "Textured non-slip grip",
      "Belt pouch included",
    ],
    price: 35.0,
    badge: { label: "Trending", tone: "trending" },
    rating: { value: 4.6, count: 137 },
    tags: ["trending"],
    addedRank: 32,
    art: "multiTool",
    tone: "blue",
  },
  {
    id: "movelite-travel-organizer",
    slug: "movelite-travel-organizer",
    name: "MoveLite Travel Organizer",
    category: "Everyday Essentials",
    description:
      "A zip organizer for cables, adapters and the small things that vanish into a bag, with elastic loops that hold their tension.",
    features: [
      "Twelve elastic loops and two mesh pockets",
      "Lies flat when opened",
      "Cabin-bag sized",
    ],
    price: 27.0,
    rating: { value: 4.5, count: 112 },
    tags: [],
    addedRank: 22,
    art: "travelOrganizer",
    tone: "cyan",
  },
];

/** Fails at module load if an id is ever renamed without updating a caller. */
function requireProduct(id: string): Product {
  const product = products.find((item) => item.id === id);
  if (!product) {
    throw new Error(`Unknown product id: ${id}`);
  }
  return product;
}

/** Products marked for the homepage's "Featured Finds" grid. */
export const featuredProducts: readonly Product[] = products.filter(
  (product) => product.featured,
);

/**
 * Six best sellers for the homepage, excluding anything already shown in
 * "Featured Finds" so the same product never appears twice on one page.
 */
export const bestSellers: readonly Product[] = products
  .filter((product) => product.tags.includes("bestSeller") && !product.featured)
  .slice(0, 6);

/** Products floating in the homepage hero composition. */
export const heroProducts: readonly Product[] = [
  requireProduct("novaglow-lamp"),
  requireProduct("aeropulse-headphones"),
  requireProduct("orbit-mini-speaker"),
];

/** Lowest and highest price in the catalogue, used to seed the price filter. */
export const priceBounds = {
  min: Math.floor(Math.min(...products.map((product) => product.price))),
  max: Math.ceil(Math.max(...products.map((product) => product.price))),
} as const;

/** Number of catalogue products in each category, for the category cards. */
function countIn(category: Category["name"]): number {
  return products.filter((product) => product.category === category).length;
}

export const categories: readonly Category[] = [
  {
    id: "tech",
    name: "Tech",
    tagline: "Gear that keeps up with you",
    href: "/shop?category=Tech",
    art: "orbit",
    tone: "violet",
    itemCount: countIn("Tech"),
  },
  {
    id: "home",
    name: "Home",
    tagline: "Warm, considered living",
    href: "/shop?category=Home",
    art: "waves",
    tone: "magenta",
    itemCount: countIn("Home"),
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    tagline: "Made for the everyday",
    href: "/shop?category=Lifestyle",
    art: "grid",
    tone: "blue",
    itemCount: countIn("Lifestyle"),
  },
  {
    id: "beauty",
    name: "Beauty",
    tagline: "Simple rituals, real results",
    href: "/shop?category=Beauty",
    art: "bloom",
    tone: "magenta",
    itemCount: countIn("Beauty"),
  },
  {
    id: "accessories",
    name: "Accessories",
    tagline: "The finishing detail",
    href: "/shop?category=Accessories",
    art: "prism",
    tone: "cyan",
    itemCount: countIn("Accessories"),
  },
  {
    id: "everyday-essentials",
    name: "Everyday Essentials",
    tagline: "The things you reach for daily",
    href: "/shop?category=Everyday+Essentials",
    art: "stack",
    tone: "blue",
    itemCount: countIn("Everyday Essentials"),
  },
];

export const trustItems: readonly TrustItem[] = [
  {
    id: "curated",
    label: "Curated products",
    detail: "Selected, not scraped",
    icon: "sparkle",
  },
  {
    id: "checkout",
    label: "Secure checkout",
    detail: "Encrypted end to end",
    icon: "lock",
  },
  {
    id: "shipping",
    label: "Fast global shipping",
    detail: "Partner hubs worldwide",
    icon: "globe",
  },
  {
    id: "support",
    label: "Easy support",
    detail: "Real people, quick replies",
    icon: "chat",
  },
];

export const valueProps: readonly ValueProp[] = [
  {
    id: "curated",
    index: "01",
    title: "Curated, Not Cluttered",
    description: "Less scrolling. Better discoveries.",
    icon: "sparkle",
  },
  {
    id: "impress",
    index: "02",
    title: "Made to Impress",
    description: "Products chosen for style, usefulness, and everyday appeal.",
    icon: "layers",
  },
  {
    id: "simple",
    index: "03",
    title: "Simple Experience",
    description:
      "From discovery to checkout, everything should feel effortless.",
    icon: "check",
  },
  {
    id: "fresh",
    index: "04",
    title: "Always Something New",
    description: "Fresh finds and new collections keep the experience moving.",
    icon: "refresh",
  },
];

export const communityTiles: readonly CommunityTile[] = [
  {
    id: "desk-setup",
    handle: "@zyvero",
    tag: "#ZYVERODesk",
    caption: "Desk reset, finally finished",
    art: "keyboard",
    tone: "violet",
  },
  {
    id: "morning-light",
    handle: "@zyvero",
    tag: "#ZYVEROHome",
    caption: "Morning light, warmer corners",
    art: "lamp",
    tone: "magenta",
  },
  {
    id: "commute",
    handle: "@zyvero",
    tag: "#ZYVERODaily",
    caption: "Packed for the long commute",
    art: "backpack",
    tone: "blue",
  },
  {
    id: "listening",
    handle: "@zyvero",
    tag: "#ZYVEROSound",
    caption: "Sunday listening session",
    art: "headphones",
    tone: "cyan",
  },
  {
    id: "slow-mornings",
    handle: "@zyvero",
    tag: "#ZYVEROHome",
    caption: "Slow mornings, good ceramics",
    art: "mug",
    tone: "neutral",
  },
  {
    id: "city-days",
    handle: "@zyvero",
    tag: "#ZYVEROStyle",
    caption: "City days in full sun",
    art: "sunglasses",
    tone: "magenta",
  },
];

export const testimonials: readonly Testimonial[] = [
  {
    id: "maya",
    quote: "Beautiful products, incredibly smooth experience.",
    author: "Maya R.",
    location: "Toronto",
    rating: 5,
    initials: "MR",
  },
  {
    id: "daniel",
    quote: "Found something I didn't even know I needed.",
    author: "Daniel K.",
    location: "Berlin",
    rating: 5,
    initials: "DK",
  },
  {
    id: "sofia",
    quote: "The whole store feels different from the usual shopping sites.",
    author: "Sofia M.",
    location: "Lisbon",
    rating: 4,
    initials: "SM",
  },
];
