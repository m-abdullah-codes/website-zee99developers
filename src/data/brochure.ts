/**
 * Copy and figures that live only on the full e-brochure (/zee99lifestyle-e-brochure).
 *
 * All of it is carried over from the light Astro brochure under
 * `brochures/zee99lifestyle/` — its `src/lib/content.ts` for the words, its
 * `data/inventory.json` for the shop ledger and `src/lib/plate.ts` for where
 * each shop sits on its drawing. It is *copied*, not imported: the two
 * brochures are separate builds, and a cross-import would make the Next bundle
 * depend on an Astro app that is meant to be deletable on its own.
 *
 * One deliberate omission. The light brochure tracks live inventory — every
 * unit carries available / reserved / booked / sold — and the full brochure
 * does not. This page is a document, not a stock list; it is sent, forwarded
 * and read weeks later, and a status that was true on the day it was sent is a
 * liability by the time it is read. So the shops keep their sizes, rates and
 * schedules and lose their availability.
 */

/* --------------------------------------------------------- specification */

export type SpecRow = { item: string; detail: string; brands: string[]; note: string };

/**
 * Verbatim from the light brochure's `spec.rows`, which took it from the
 * client's own facts sheet. `note` is new: the rows expand on this page, and a
 * row that opens to nothing more than what was already on its face is a
 * disclosure control with nothing to disclose.
 */
export const SPEC = {
  title: "Premium is a word. *This is the list.*",
  lede: "Fitted in every apartment before a single piece of your own furniture goes in. Open a line to see what it means and who makes it.",
  rows: [
    {
      item: "Kitchen",
      detail: "High-pressure laminate, tempered glass",
      brands: ["ZRK", "Al-Noor", "Formite"],
      note: "Full run of base and wall units, laminate faces over an engineered carcass, tempered glass splashback. Fitted before handover — the kitchen is not a later purchase.",
    },
    {
      item: "Wardrobes",
      detail: "Floor-to-ceiling, high gloss",
      brands: ["ZRK", "Al-Noor", "Master Wood"],
      note: "A wardrobe wall in every bedroom, floor to ceiling, hanging and shelving inside. It is the reason the plans give no room to a freestanding almirah.",
    },
    {
      item: "Doors",
      detail: "Semi-solid engineered wood",
      brands: ["ZRK", "Al-Noor", "Adamjee"],
      note: "Semi-solid engineered leaves rather than hollow-core flush doors, on concealed hinges. They shut with weight behind them, which is the difference you notice first.",
    },
    {
      item: "Art walls",
      detail: "Decorative laminate",
      brands: ["Formite", "Al-Noor"],
      note: "One finished feature wall in the living room and in each bedroom, laminate over a battened frame. Fitted, not a render.",
    },
    {
      item: "Windows",
      detail: "Double-glazed, heavy-gauge aluminium",
      brands: ["Al-Cop", "Pak-Aluminium", "Awami"],
      note: "Double glazing on a heavy-gauge aluminium section throughout. It is what keeps a road-facing apartment quiet and a July afternoon out of the lounge.",
    },
    {
      item: "Sanitary",
      detail: "Concealed cisterns, chrome fittings",
      brands: ["Faisal", "Sonex", "Master"],
      note: "Concealed cisterns behind the wall, chrome fittings, every bathroom attached to the room it serves.",
    },
    {
      item: "Appliances",
      detail: "Integrated hood and stove",
      brands: ["Cannon", "Waves", "Schneider"],
      note: "Hood and stove built into the kitchen run and handed over with the apartment. Everything else is yours to choose.",
    },
    {
      item: "Smart",
      detail: "Motorised curtains, smart lighting",
      brands: ["Schneider Electric", "Legrand", "Philips"],
      note: "Motorised curtain tracks and switched smart lighting, wired in at first fix. Retro-fitting either after handover means opening finished walls.",
    },
  ] satisfies SpecRow[],
  close: "Every line names its brands. A substitution would be visible.",
};

/* ------------------------------------------------------------- the building */

export const BUILDING = {
  title: "Experience *every evening.*",
  lede: "A cinema on the roof. A BBQ lounge beside it. Solar above both.",
  /* Captions describe what is in each frame, not what the amenity list says.
     The renders carried over from the light brochure were labelled cinema /
     BBQ / terrace; only the second one actually shows what it was called. */
  roof: [
    {
      image: "/images/projects/zee99-lifestyle/rooftop-1.webp",
      alt: "Rooftop fire pit with sunken seating in a planted terrace at dusk, the sports complex courts below.",
      caption: "The fire lounge",
    },
    {
      image: "/images/projects/zee99-lifestyle/rooftop-2.webp",
      alt: "Rooftop BBQ kitchen and dining table under a planted pergola at dusk, solar panels above and the sports complex beyond.",
      caption: "The BBQ kitchen",
    },
    {
      image: "/images/projects/zee99-lifestyle/rooftop-3.webp",
      alt: "The whole roof at dusk — shaded terrace, bar, fire lounge, planting and the solar array, with Bahria Town beyond.",
      caption: "The roof at dusk",
    },
  ],
  /**
   * The split the light brochure insists on, kept. Presenting a hospital
   * across the road as a building feature is the move that costs trust on a
   * page whose only job is to build it.
   */
  inBuilding: {
    label: "In the building",
    note: "Ours. Built into the structure and handed over with it.",
    groups: [
      { g: "Roof", items: ["Rooftop cinema", "BBQ lounge", "Rooftop solar"] },
      { g: "Shared", items: ["Gymnasium", "Clubhouse", "Indoor games", "Kids play area"] },
      {
        g: "Security",
        items: [
          "Card access",
          "Reception desk",
          "24/7 CCTV",
          "Guard",
          "Video door phone",
          "Intercom",
          "Gated access",
          "Fire safety system",
        ],
      },
      {
        g: "Services",
        items: [
          "Lift",
          "Room service",
          "Maintenance staff",
          "24x7 water",
          "Power backup",
          "Visitor parking",
          "EV charging",
          "Rainwater harvesting",
          "Earthquake-resistant structure",
        ],
      },
    ],
  },
  acrossRoad: {
    label: "Across the road",
    note: "Not ours. Listed because it is why the address works, and because the difference is worth being clear about.",
    items: [
      "Safari Sports Complex — padel, tennis, badminton, cricket, football, jogging track",
      "Safari Mall",
      "Qartaba Masjid",
      "Kids Park",
      "Safari Park",
      "Safari Zoo",
      "Green Valley Supermart",
      "Bahria Hospital",
      "Schools and study centres",
      "Bahria's largest mobile market",
      "Money exchanger",
    ],
  },
  serviced: {
    head: "These are serviced apartments.",
    body: "Zee99 runs a rental programme: their team finds the tenant, handles the maintenance, and transfers the rent to your account. If you are buying to let, that is the part that matters.",
  },
};

/* -------------------------------------------------------------- the builder */

export const BUILDER = {
  title: "Two delivered. *The third is ahead of schedule.*",
  lede: "Zee99 Arcade's structure is complete. Possession is eight months out with fifteen months still to run on its payment plan, which in this market is the credential that counts.",
  stats: [
    { n: "15", unit: "years", label: "Building" },
    { n: "50+", unit: "", label: "Homes delivered" },
    { n: "6", unit: "", label: "Commercial projects" },
    { n: "2", unit: "", label: "High-rise developments" },
  ],
  projects: [
    { name: "Takwa Center", status: "Delivered", note: "" },
    { name: "Safari Apartments", status: "Delivered", note: "" },
    {
      name: "Zee99 Arcade",
      status: "Structure complete",
      note: "Possession in 8 months, 15 months left on plan",
    },
    { name: "Zee99 Lifestyle", status: "Current", note: "This building" },
  ],
  close:
    "Zee99 counts more than a hundred customers across those projects. We have not put their faces in a badge, because a badge is not evidence. The delivered buildings are.",
};

/* ------------------------------------------------------------------ the film */

export const FILM = {
  title: "Then walk it, *floor by floor.*",
  lede: "Two minutes through the finished building: the corner elevation, the terraces, the rooftop, and one of each plan as it will be handed over.",
  src: "/media/full-tour-video.mp4",
  poster: "/media/full-tour-poster.jpg",
  captionLeft: "Zee99 Lifestyle — full tour",
  captionRight: "2:15 · Render",
};

/* ------------------------------------------------------------- the shopfront */

/** One retail unit, with the schedule it is sold on. No availability — see the
 *  note at the top of this file. */
export type ShopUnit = {
  id: string;
  type: "Shop" | "Kiosk";
  sqft: number;
  /** PKR per sq ft. G9 is the one unit below its floor's headline rate. */
  rate: number;
  price: number;
  down: number;
  monthly: number;
  monthlyCount: number;
  biAnnual: number;
  biAnnualCount: number;
  structure: number;
  possession: number;
};

const GROUND_UNITS: ShopUnit[] = [
  { id: "G1", type: "Shop", sqft: 486, rate: 55000, price: 26730000, down: 5346000, monthly: 222750, monthlyCount: 36, biAnnual: 891000, biAnnualCount: 6, structure: 2673000, possession: 5346000 },
  { id: "G2", type: "Shop", sqft: 380, rate: 55000, price: 20900000, down: 4180000, monthly: 174167, monthlyCount: 36, biAnnual: 696667, biAnnualCount: 6, structure: 2090000, possession: 4179986 },
  { id: "G3", type: "Shop", sqft: 380, rate: 55000, price: 20900000, down: 4180000, monthly: 174167, monthlyCount: 36, biAnnual: 696667, biAnnualCount: 6, structure: 2090000, possession: 4179986 },
  { id: "G4", type: "Shop", sqft: 440, rate: 55000, price: 24200000, down: 4840000, monthly: 201667, monthlyCount: 36, biAnnual: 806667, biAnnualCount: 6, structure: 2420000, possession: 4839986 },
  { id: "G5", type: "Shop", sqft: 399, rate: 55000, price: 21945000, down: 4389000, monthly: 182875, monthlyCount: 36, biAnnual: 731500, biAnnualCount: 6, structure: 2194500, possession: 4389000 },
  { id: "G6", type: "Shop", sqft: 410, rate: 55000, price: 22550000, down: 4510000, monthly: 187917, monthlyCount: 36, biAnnual: 751667, biAnnualCount: 6, structure: 2255000, possession: 4509986 },
  { id: "G7", type: "Shop", sqft: 390, rate: 55000, price: 21450000, down: 4290000, monthly: 178750, monthlyCount: 36, biAnnual: 715000, biAnnualCount: 6, structure: 2145000, possession: 4290000 },
  { id: "G8", type: "Shop", sqft: 305, rate: 55000, price: 16775000, down: 3355000, monthly: 139792, monthlyCount: 36, biAnnual: 559167, biAnnualCount: 6, structure: 1677500, possession: 3354986 },
  { id: "G9", type: "Shop", sqft: 450, rate: 50000, price: 22500000, down: 4500000, monthly: 187500, monthlyCount: 36, biAnnual: 750000, biAnnualCount: 6, structure: 2250000, possession: 4500000 },
];

const LOWER_UNITS: ShopUnit[] = [
  { id: "L1", type: "Shop", sqft: 180, rate: 35000, price: 6300000, down: 1260000, monthly: 52500, monthlyCount: 36, biAnnual: 210000, biAnnualCount: 6, structure: 630000, possession: 1260000 },
  { id: "L2", type: "Shop", sqft: 180, rate: 35000, price: 6300000, down: 1260000, monthly: 52500, monthlyCount: 36, biAnnual: 210000, biAnnualCount: 6, structure: 630000, possession: 1260000 },
  { id: "L3", type: "Shop", sqft: 180, rate: 35000, price: 6300000, down: 1260000, monthly: 52500, monthlyCount: 36, biAnnual: 210000, biAnnualCount: 6, structure: 630000, possession: 1260000 },
  { id: "L4", type: "Shop", sqft: 180, rate: 35000, price: 6300000, down: 1260000, monthly: 52500, monthlyCount: 36, biAnnual: 210000, biAnnualCount: 6, structure: 630000, possession: 1260000 },
  { id: "L5", type: "Shop", sqft: 300, rate: 35000, price: 10500000, down: 2100000, monthly: 87500, monthlyCount: 36, biAnnual: 350000, biAnnualCount: 6, structure: 1050000, possession: 2100000 },
  { id: "L6", type: "Shop", sqft: 360, rate: 35000, price: 12600000, down: 2520000, monthly: 105000, monthlyCount: 36, biAnnual: 420000, biAnnualCount: 6, structure: 1260000, possession: 2520000 },
  { id: "L7", type: "Shop", sqft: 360, rate: 35000, price: 12600000, down: 2520000, monthly: 105000, monthlyCount: 36, biAnnual: 420000, biAnnualCount: 6, structure: 1260000, possession: 2520000 },
  { id: "L8", type: "Shop", sqft: 360, rate: 35000, price: 12600000, down: 2520000, monthly: 105000, monthlyCount: 36, biAnnual: 420000, biAnnualCount: 6, structure: 1260000, possession: 2520000 },
  { id: "L9", type: "Shop", sqft: 360, rate: 35000, price: 12600000, down: 2520000, monthly: 105000, monthlyCount: 36, biAnnual: 420000, biAnnualCount: 6, structure: 1260000, possession: 2520000 },
  { id: "L10", type: "Shop", sqft: 390, rate: 35000, price: 13650000, down: 2730000, monthly: 113750, monthlyCount: 36, biAnnual: 455000, biAnnualCount: 6, structure: 1365000, possession: 2730000 },
  { id: "L11", type: "Shop", sqft: 320, rate: 35000, price: 11200000, down: 2240000, monthly: 93333, monthlyCount: 36, biAnnual: 373333, biAnnualCount: 6, structure: 1120000, possession: 2240014 },
  { id: "L12", type: "Shop", sqft: 320, rate: 35000, price: 11200000, down: 2240000, monthly: 93333, monthlyCount: 36, biAnnual: 373333, biAnnualCount: 6, structure: 1120000, possession: 2240014 },
  { id: "L13", type: "Shop", sqft: 340, rate: 35000, price: 11900000, down: 2380000, monthly: 99167, monthlyCount: 36, biAnnual: 396667, biAnnualCount: 6, structure: 1190000, possession: 2379986 },
  { id: "LK1", type: "Kiosk", sqft: 70, rate: 35000, price: 2450000, down: 490000, monthly: 20417, monthlyCount: 36, biAnnual: 81667, biAnnualCount: 6, structure: 245000, possession: 489986 },
];

/**
 * Where each shop sits on its drawing — fraction of image width and height,
 * origin top-left, read off the plans themselves. If either drawing is
 * re-exported at a different crop, these move.
 */
export const PLATE_POS: Record<string, { x: number; y: number }> = {
  // Ground: nine shops, arcade along the bottom edge.
  G1: { x: 0.284, y: 0.258 },
  G2: { x: 0.276, y: 0.39 },
  G3: { x: 0.276, y: 0.52 },
  G4: { x: 0.286, y: 0.668 },
  G5: { x: 0.45, y: 0.566 },
  G6: { x: 0.616, y: 0.566 },
  G7: { x: 0.856, y: 0.556 },
  G8: { x: 0.858, y: 0.376 },
  G9: { x: 0.586, y: 0.376 },

  // Lower ground: thirteen shops plus the kiosk.
  L13: { x: 0.213, y: 0.14 },
  L12: { x: 0.213, y: 0.292 },
  L11: { x: 0.225, y: 0.438 },
  L4: { x: 0.512, y: 0.42 },
  L3: { x: 0.64, y: 0.42 },
  L2: { x: 0.757, y: 0.42 },
  L1: { x: 0.895, y: 0.42 },
  L10: { x: 0.108, y: 0.712 },
  L9: { x: 0.25, y: 0.712 },
  L8: { x: 0.386, y: 0.712 },
  L7: { x: 0.521, y: 0.712 },
  L6: { x: 0.66, y: 0.712 },
  L5: { x: 0.8, y: 0.712 },
  LK1: { x: 0.436, y: 0.132 },
};

/** Shops that open directly onto the ten-foot arcade — confirmed by the door
 *  swings drawn on the ground-floor plate. */
export const ARCADE_FRONTED = ["G4", "G5", "G6", "G7"];

export type ShopFloor = {
  id: string;
  name: string;
  sub: string;
  body: string;
  /** Headline rate for the floor. G9 sells below the ground-floor one. */
  rate: number;
  image: string;
  alt: string;
  caption: string;
  /** Heading on the folded price list — "Ground" alone reads wrong in a sentence. */
  ledgerLabel: string;
  units: ShopUnit[];
};

const DIR = "/images/projects/zee99-lifestyle";

/*
 * A note on the two `*-plate.webp` drawings below.
 *
 * They are the retouched plans from the light brochure, with the "SHOP-01 /
 * GROSS AREA 486SFT" lettering painted out. That lettering has to go here: the
 * markers stand exactly where it used to, so on the un-retouched plans (still
 * in this folder as `*-floor-plan.webp`, and still what the project page uses)
 * every marker sits on top of a label saying almost the same thing.
 *
 * They exist only as build output — brochures/zee99lifestyle/dist/img/plan/,
 * generated back when the retouched files were the image source. Running
 * `npm run images --prefix brochures/zee99lifestyle` would regenerate that
 * folder from assets/floor-plans/, which holds the lettered originals, and the
 * clean versions would be gone. These copies are the only ones left.
 */

export const SHOP_FLOORS: ShopFloor[] = [
  {
    id: "ground",
    name: "Ground",
    sub: "Nine shops behind a ten-foot arcade.",
    body: "The arcade runs the length of the frontage: shade in June, cover in monsoon, and enough depth to put a display outside the door. Shops 04, 05, 06 and 07 open directly onto it. This is the floor you take if the street is your customer.",
    rate: 55000,
    image: `${DIR}/commercial-ground-plate.webp`,
    alt: "Ground floor plan — nine shops from 305 to 486 sq ft around a five- and six-foot corridor, with a ten-foot covered arcade along the frontage, central lift, two staircases and toilets including an accessible one.",
    caption: "Ground floor. Arcade ten feet wide along the frontage; shops 04, 05, 06 and 07 open onto it.",
    ledgerLabel: "Price of every ground-floor shop",
    units: GROUND_UNITS,
  },
  {
    id: "lower-ground",
    name: "Lower Ground",
    sub: "Small-format retail on six-foot corridors.",
    body: "The smallest cells are the size that works for phone accessories, opticians, tailoring and cosmetics, the trades already doing volume a few blocks away at the mobile market. Lower entry, lower rate, faster to fill.",
    rate: 35000,
    image: `${DIR}/commercial-lower-ground-plate.webp`,
    alt: "Lower ground floor plan — thirteen shops from 180 to 390 sq ft plus a 70 sq ft kiosk, on six-foot corridors, with a patio, lift and accessible bathroom.",
    caption: "Lower ground. Six-foot corridors, a patio, lift and accessible bath. The kiosk is 70 sq ft.",
    ledgerLabel: "Price of every lower-ground unit",
    units: LOWER_UNITS,
  },
];

export const SHOPFRONT = {
  title: "Two floors of *shopfront.*",
  lede: "The footfall is not speculative. The sports complex is across the road, Safari Mall is next door, and forty-eight households live directly upstairs. Tap any unit on a plan to see what it costs.",
  /** G9's discount, explained rather than hidden — it is landlocked between
   *  shops 01, 02, 05, 06 and the corridor. The figures under this are computed
   *  from the ledger, not typed. */
  exception: {
    head: "One shop is priced below the others.",
    body: "Shop 09 sits inside the plate with no arcade frontage, so it is sold at a lower rate than the eight around it. It is a worse shop and it is priced like one.",
  },
  note: "Prelaunch rates. Every commercial unit is sold on the same split.",
};

/* ---------------------------------------------------------------- the close */

export const CLOSING = {
  title: "Sector B, facing the *Safari Sports Complex.*",
  lines: ["Approved, registered, and under way.", "Prelaunch pricing, current on the date below."],
  marks: ["FBR", "LDA", "TMA"],
  colophon:
    "Figures on this page are the project's own prelaunch schedule. They move with construction progress, demand and supply.",
};
