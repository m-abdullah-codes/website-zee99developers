/**
 * The e-brochure's copy and figures as they ship — the fallback under the
 * dashboard.
 *
 * Same arrangement as `commercial.ts` and `unitMedia.ts`: D1 is the source of
 * truth (the `brochure` row in `settings`, edited at /admin → Brochure), and
 * this is what /zee99lifestyle-e-brochure shows until — and wherever — that row
 * says nothing. So a fresh database, a half-filled block or a key the client
 * has not touched can never blank a section of the document.
 *
 * `src/data/brochure.ts` does the merging and is what components import. This
 * file is imported directly by the dashboard too, which is why it holds no
 * imports of its own: it is data, and both sides need it before any of it has
 * been edited.
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

/* ------------------------------------------------------------------- types */

export type SpecRow = { item: string; detail: string; brands: string[]; note: string };

export type RoofFrame = { image: string; alt: string; caption: string };

export type AmenityGroup = { g: string; items: string[] };

/** One apartment on the typical plate — its number on the drawing and what it
 *  looks out at. `facing` is free text and is what the section counts itself
 *  by, so a third orientation needs no code. Sizes and types are not repeated
 *  here: they are lettered on the drawing itself and priced in the residences
 *  two sections down. */
export type FloorUnit = { id: string; facing: string };

/**
 * One side of the fork — everything a reader is given before they choose it.
 *
 * A label, a name and a few short facts. Nothing more: the card is a signpost,
 * not an argument. Whoever is reading already knows whether they want a home or
 * a shop, and the only job of the card is to be recognised at a glance — which
 * is also what lets the two of them sit side by side on a phone, where each is
 * about a hundred and sixty pixels wide and a sentence would not fit.
 */
export type PathOption = {
  /** The small mono label over the name. */
  label: string;
  /** The name, set large. */
  title: string;
  /** Two or three short facts, one per line. Counts and ranges, not claims. */
  meta: string[];
};

export type BuilderStat = { n: string; unit: string; label: string };

export type BuilderProject = { name: string; status: string; note: string };

/** One retail unit, with the schedule it is sold on. No availability — see the
 *  note at the top of this file. */
export type ShopUnit = {
  id: string;
  type: "Shop" | "Kiosk";
  sqft: number;
  /** PKR per sq ft. */
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

export type ShopFloor = {
  id: string;
  name: string;
  sub: string;
  body: string;
  /** Headline rate for the floor. */
  rate: number;
  image: string;
  alt: string;
  caption: string;
  /** Heading on the folded price list — "Ground" alone reads wrong in a sentence. */
  ledgerLabel: string;
  units: ShopUnit[];
};

/** Fraction of the drawing's width and height, origin top-left. */
export type PlatePoint = { x: number; y: number };

export type BrochureDoc = {
  /** The fork the document turns on: apartments or shops. */
  paths: {
    title: string;
    lede: string;
    /** The line under the two cards while neither is open — the page does not
     *  go on until one of them is. */
    note: string;
    residential: PathOption;
    commercial: PathOption;
  };
  typicalFloor: {
    title: string;
    /** One line. The drawing is the section; the prose is a caption for it. */
    lede: string;
    image: string;
    alt: string;
    caption: string;
    units: FloorUnit[];
  };
  /** The three plans come from the project itself — this is only the section's
   *  own copy, which belongs to the brochure rather than to the site. */
  residences: { lede: string; cue: string };
  spec: { title: string; lede: string; rows: SpecRow[]; close: string };
  building: {
    title: string;
    lede: string;
    roof: RoofFrame[];
    inBuilding: { label: string; note: string; groups: AmenityGroup[] };
    acrossRoad: { label: string; note: string; items: string[] };
    serviced: { head: string; body: string };
  };
  builder: {
    title: string;
    lede: string;
    stats: BuilderStat[];
    projects: BuilderProject[];
    close: string;
  };
  film: {
    title: string;
    lede: string;
    src: string;
    poster: string;
    captionLeft: string;
    captionRight: string;
  };
  shopfront: {
    title: string;
    lede: string;
    floors: ShopFloor[];
    /**
     * Where each shop sits on its drawing, read off the plans themselves. If
     * either drawing is re-exported at a different crop, these move — which is
     * why the dashboard places them by clicking the plan rather than by typing
     * numbers.
     */
    platePos: Record<string, PlatePoint>;
    /** Shops that open directly onto the ten-foot arcade — confirmed by the
     *  door swings drawn on the ground-floor plate. */
    arcadeFronted: string[];
  };
  closing: { title: string; lines: string[]; marks: string[]; colophon: string };
};

/* ---------------------------------------------------------------- the shops */

/**
 * Ground floor, revised Nov 2026 to the client's 19-shop plan and its payment
 * sheet: 50,000 / sq ft flat, 20% down, 36 monthly, 6 bi-annual, the balance
 * at possession — no "on structure" payment on this floor. The sheet's 10%
 * factor on front and outer-facing shops is left out on purpose: the client
 * confirms it at booking, not in the brochure.
 */
const GROUND_UNITS: ShopUnit[] = [
  { id: "G1", type: "Shop", sqft: 285, rate: 50000, price: 14250000, down: 2850000, monthly: 142500, monthlyCount: 36, biAnnual: 600000, biAnnualCount: 6, structure: 0, possession: 2670000 },
  { id: "G2", type: "Shop", sqft: 285, rate: 50000, price: 14250000, down: 2850000, monthly: 142500, monthlyCount: 36, biAnnual: 600000, biAnnualCount: 6, structure: 0, possession: 2670000 },
  { id: "G3", type: "Shop", sqft: 230, rate: 50000, price: 11500000, down: 2300000, monthly: 115000, monthlyCount: 36, biAnnual: 530000, biAnnualCount: 6, structure: 0, possession: 1880000 },
  { id: "G4", type: "Shop", sqft: 165, rate: 50000, price: 8250000, down: 1650000, monthly: 82500, monthlyCount: 36, biAnnual: 380000, biAnnualCount: 6, structure: 0, possession: 1350000 },
  { id: "G5", type: "Shop", sqft: 165, rate: 50000, price: 8250000, down: 1650000, monthly: 82500, monthlyCount: 36, biAnnual: 380000, biAnnualCount: 6, structure: 0, possession: 1350000 },
  { id: "G6", type: "Shop", sqft: 145, rate: 50000, price: 7250000, down: 1450000, monthly: 72500, monthlyCount: 36, biAnnual: 335000, biAnnualCount: 6, structure: 0, possession: 1180000 },
  { id: "G7", type: "Shop", sqft: 145, rate: 50000, price: 7250000, down: 1450000, monthly: 72500, monthlyCount: 36, biAnnual: 335000, biAnnualCount: 6, structure: 0, possession: 1180000 },
  { id: "G8", type: "Shop", sqft: 145, rate: 50000, price: 7250000, down: 1450000, monthly: 72500, monthlyCount: 36, biAnnual: 335000, biAnnualCount: 6, structure: 0, possession: 1180000 },
  { id: "G9", type: "Shop", sqft: 135, rate: 50000, price: 6750000, down: 1350000, monthly: 67500, monthlyCount: 36, biAnnual: 300000, biAnnualCount: 6, structure: 0, possession: 1170000 },
  { id: "G10", type: "Shop", sqft: 135, rate: 50000, price: 6750000, down: 1350000, monthly: 67500, monthlyCount: 36, biAnnual: 300000, biAnnualCount: 6, structure: 0, possession: 1170000 },
  { id: "G11", type: "Shop", sqft: 135, rate: 50000, price: 6750000, down: 1350000, monthly: 67500, monthlyCount: 36, biAnnual: 300000, biAnnualCount: 6, structure: 0, possession: 1170000 },
  { id: "G12", type: "Shop", sqft: 135, rate: 50000, price: 6750000, down: 1350000, monthly: 67500, monthlyCount: 36, biAnnual: 300000, biAnnualCount: 6, structure: 0, possession: 1170000 },
  { id: "G13", type: "Shop", sqft: 135, rate: 50000, price: 6750000, down: 1350000, monthly: 67500, monthlyCount: 36, biAnnual: 300000, biAnnualCount: 6, structure: 0, possession: 1170000 },
  { id: "G14", type: "Shop", sqft: 135, rate: 50000, price: 6750000, down: 1350000, monthly: 67500, monthlyCount: 36, biAnnual: 300000, biAnnualCount: 6, structure: 0, possession: 1170000 },
  { id: "G15", type: "Shop", sqft: 135, rate: 50000, price: 6750000, down: 1350000, monthly: 67500, monthlyCount: 36, biAnnual: 300000, biAnnualCount: 6, structure: 0, possession: 1170000 },
  { id: "G16", type: "Shop", sqft: 135, rate: 50000, price: 6750000, down: 1350000, monthly: 67500, monthlyCount: 36, biAnnual: 300000, biAnnualCount: 6, structure: 0, possession: 1170000 },
  { id: "G17", type: "Shop", sqft: 135, rate: 50000, price: 6750000, down: 1350000, monthly: 67500, monthlyCount: 36, biAnnual: 300000, biAnnualCount: 6, structure: 0, possession: 1170000 },
  { id: "G18", type: "Shop", sqft: 135, rate: 50000, price: 6750000, down: 1350000, monthly: 67500, monthlyCount: 36, biAnnual: 300000, biAnnualCount: 6, structure: 0, possession: 1170000 },
  { id: "G19", type: "Shop", sqft: 120, rate: 50000, price: 6000000, down: 1200000, monthly: 60000, monthlyCount: 36, biAnnual: 250000, biAnnualCount: 6, structure: 0, possession: 1140000 },
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

/* ------------------------------------------------------------ the document */

export const BROCHURE_DEFAULTS: BrochureDoc = {
  /**
   * The fork. Two thirds of this document is only ever relevant to one of two
   * readers — someone buying a home and someone buying a shop — and printing
   * both at full length in front of both is how a brochure gets closed. So the
   * plans, the schedules and the specification arrive folded behind a choice,
   * and everything either reader needs regardless (the film, the amenities, the
   * address, the builder, the questions) stays open below it.
   *
   * The copy here is the whole of the ask, and it is deliberately almost
   * nothing: a label, a name and three facts on each card. A reader already
   * knows which of the two they are, so the cards only have to be recognisable,
   * and a card that argues its case is a card nobody finishes before clicking
   * the other one.
   *
   * The page does not continue past this section until one of them is open.
   * Everything below the fork is written for a reader who has already said
   * which half of the building they came for, and a document that lets you
   * scroll past the question answers it for you — badly, by showing you the
   * other half's prices first.
   */
  paths: {
    title: "One building. *Two ways to own it.*",
    lede: "Choose one to open its plans, prices and payment schedules. You can switch at any time.",
    note: "Choose one to carry on",
    residential: {
      label: "Residential",
      title: "Apartments",
      meta: ["3 plans", "380 – 800 sq ft", "6 floors"],
    },
    commercial: {
      label: "Commercial",
      title: "Shops",
      meta: ["23 units", "70 – 486 sq ft", "2 floors"],
    },
  },

  /**
   * The plate every one of the six residential floors is. Carried over from the
   * light brochure's `floor` block; the eight apartments are its floor-1 units,
   * which is the exemplar it used for the same reason.
   *
   * One line of copy and no more. The drawing letters every apartment with its
   * own area and the two counts beside it say the one thing the drawing does
   * not — three paragraphs in front of it were three paragraphs nobody read on
   * the way to the plans.
   *
   * `units` is not printed as a list, for the same reason. It is there so the
   * two facing counts are a count of the file rather than a sentence someone
   * typed, which is what stops an edit in the dashboard leaving the copy
   * contradicting the plate beside it.
   */
  typicalFloor: {
    title: "Eight homes to a floor. *One five-foot corridor.*",
    lede: "A corner plot gives the building two good faces: four apartments on every floor look out at the sports complex and four at the residences behind.",
    image: `${DIR}/residential-typical-floor-plan.webp`,
    alt: "Typical residential floor plan. Eight apartments around a central lift and staircase, on a five-foot corridor. Apartments 01, 02, 03, 05, 06 and 07 are 500 sq ft one-bedrooms; apartment 04 is an 800 sq ft two-bedroom; apartment 08 is a 380 sq ft studio.",
    caption: "Typical floor, levels 1 to 6. Corridor lettered 5'-0\" wide on the drawing.",
    units: [
      { id: "01", facing: "Sports complex" },
      { id: "02", facing: "Sports complex" },
      { id: "03", facing: "Sports complex" },
      { id: "04", facing: "Sports complex" },
      { id: "05", facing: "Residence" },
      { id: "06", facing: "Residence" },
      { id: "07", facing: "Residence" },
      { id: "08", facing: "Residence" },
    ],
  },

  /**
   * The residences section's own words. The three plans, their areas and every
   * figure on them are the project's — edited under Payment, and the same on
   * this page as on the site. Only the lede and the cue are the brochure's,
   * because only they are about this document rather than about the building.
   */
  residences: {
    lede: "Open any residence for the interiors, the floor plan and the full payment schedule — every figure exactly as it is issued at booking.",
    cue: "a plan for its renders, its drawing and its schedule",
  },

  /**
   * Verbatim from the light brochure's `spec.rows`, which took it from the
   * client's own facts sheet. `note` is new: the rows expand on this page, and
   * a row that opens to nothing more than what was already on its face is a
   * disclosure control with nothing to disclose.
   */
  spec: {
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
    ],
    close: "Every line names its brands. A substitution would be visible.",
  },

  building: {
    title: "Experience *every evening.*",
    lede: "A cinema on the roof. A BBQ lounge beside it. Solar above both.",
    /* Captions describe what is in each frame, not what the amenity list says.
       The renders carried over from the light brochure were labelled cinema /
       BBQ / terrace; only the second one actually shows what it was called. */
    roof: [
      {
        image: `${DIR}/rooftop-1.webp`,
        alt: "Rooftop fire pit with sunken seating in a planted terrace at dusk, the sports complex courts below.",
        caption: "The fire lounge",
      },
      {
        image: `${DIR}/rooftop-2.webp`,
        alt: "Rooftop BBQ kitchen and dining table under a planted pergola at dusk, solar panels above and the sports complex beyond.",
        caption: "The BBQ kitchen",
      },
      {
        image: `${DIR}/rooftop-3.webp`,
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
  },

  builder: {
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
  },

  film: {
    title: "Then walk it, *floor by floor.*",
    lede: "Two minutes through the finished building: the corner elevation, the terraces, the rooftop, and one of each plan as it will be handed over.",
    src: "/media/full-tour-video.mp4",
    poster: "/media/full-tour-poster.jpg",
    captionLeft: "Zee99 Lifestyle — full tour",
    captionRight: "2:15 · Render",
  },

  shopfront: {
    title: "Two floors of *shopfront.*",
    lede: "The footfall is not speculative. The sports complex is across the road, Safari Mall is next door, and forty-eight households live directly upstairs. Tap any unit on a plan to see what it costs.",
    floors: [
      {
        id: "ground",
        name: "Ground",
        sub: "Nineteen shops behind a ten-foot arcade.",
        body: "The arcade runs the length of the frontage: shade in June, cover in monsoon, and enough depth to put a display outside the door. Shops 14 to 19 open directly onto it. This is the floor you take if the street is your customer.",
        rate: 50000,
        image: `${DIR}/commercial-ground-plate-19.webp`,
        alt: "Ground floor plan — nineteen shops from 120 to 285 sq ft on two five-foot corridors, with a ten-foot arcade along the frontage, a lift, a staircase and an accessible bathroom.",
        caption:
          "Ground floor. Ten-foot arcade along the frontage.",
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
        caption:
          "Lower ground. Six-foot corridors, a patio, lift and accessible bath. The kiosk is 70 sq ft.",
        ledgerLabel: "Price of every lower-ground unit",
        units: LOWER_UNITS,
      },
    ],
    platePos: {
      // Ground: nineteen shops, arcade along the bottom edge. Markers sit
      // just above each shop's own lettering on the client's rendered plan.
      G1: { x: 0.239, y: 0.186 },
      G2: { x: 0.239, y: 0.319 },
      G3: { x: 0.410, y: 0.299 },
      G4: { x: 0.543, y: 0.299 },
      G5: { x: 0.663, y: 0.299 },
      G6: { x: 0.870, y: 0.238 },
      G7: { x: 0.870, y: 0.369 },
      G8: { x: 0.823, y: 0.539 },
      G9: { x: 0.680, y: 0.539 },
      G10: { x: 0.555, y: 0.539 },
      G11: { x: 0.433, y: 0.540 },
      G12: { x: 0.312, y: 0.540 },
      G13: { x: 0.191, y: 0.540 },
      G14: { x: 0.191, y: 0.679 },
      G15: { x: 0.312, y: 0.679 },
      G16: { x: 0.435, y: 0.679 },
      G17: { x: 0.555, y: 0.679 },
      G18: { x: 0.680, y: 0.679 },
      G19: { x: 0.806, y: 0.681 },

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
    },
    arcadeFronted: ["G14", "G15", "G16", "G17", "G18", "G19"],
  },

  closing: {
    title: "Sector B, facing the *Safari Sports Complex.*",
    lines: ["Approved, registered, and under way.", "Prelaunch pricing, current on the date below."],
    marks: ["FBR", "LDA", "TMA"],
    colophon:
      "Figures on this page are the project's own prelaunch schedule. They move with construction progress, demand and supply.",
  },
};
