/**
 * Single source of truth for both interactive tools and every project page.
 * Sales updates this file; the calculator and visualizer stay in sync.
 *
 * PLACEHOLDERS to reconcile with the official price list before launch:
 * unit areas, rent estimates, appreciation band, transfer threshold (25%),
 * delivered-project records, distances.
 */

export type ProjectStatus = "booking" | "construction" | "delivered";
export type UnitId = "studio" | "one-bed" | "two-bed";

export type Unit = {
  id: UnitId;
  name: string;
  /** Indicative area in sq ft — client to confirm. */
  area: number;
  /** Official listed plan (poster figures). */
  down: number;
  monthly: number;
  months: number;
  /** Current Bahria Town rent estimate, PKR/month — client to confirm. */
  rentEst: number;
  blurb: string;
};

export type PricePoint = { label: string; twoBed: number; oneBed: number };

export type Update = { date: string; title: string; body: string; img?: string };

export type Project = {
  slug: string;
  name: string;
  status: ProjectStatus;
  statusLabel: string;
  location: string;
  short: string;
  figures: [string, string];
  cardImage: string;
  cardRatio?: string;
  heroImage: string;
  heroLine: string;
  overview?: string;
  overviewImage?: string;
  facts?: { k: string; v: string }[];
  units?: Unit[];
  appreciation?: { low: number; high: number };
  amenities?: { id: string; label: string }[];
  locationSec?: {
    title: string;
    body: string;
    embed?: string;
    distances: { t: string; d: string }[];
  };
  updates?: Update[];
  faqs?: { q: string; a: string }[];
  history?: PricePoint[];
  /** Delivered collective card links elsewhere. */
  href?: string;
};

export const DOWN_OPTIONS = [10, 15, 20] as const;
export type DownPct = (typeof DOWN_OPTIONS)[number];

export const LIFESTYLE: Project = {
  slug: "zee99-lifestyle",
  name: "Zee99 Lifestyle",
  status: "booking",
  statusLabel: "Now Booking",
  location: "Sector B, Safari Block, Bahria Town Lahore",
  short: "Terrace apartments facing the Safari Sports Complex. Owned in 36 months.",
  figures: ["From 550,000 down", "Sector B, Bahria Town"],
  cardImage: "/images/projects/lifestyle-card.jpg",
  heroImage: "/images/projects/lifestyle-hero.jpg",
  heroLine: "Live the luxury. Own the future — in 36 months.",
  overview:
    "Eight storeys on a corner plot, directly facing the Safari Sports Complex. Retail at street level, residences above, a pool and gym on top. Every apartment opens onto its own terrace — a rare thing in Bahria Town, and the reason these won't stay available long.",
  overviewImage: "/images/home/featured-lifestyle.jpg",
  facts: [
    { k: "Floors", v: "8" },
    { k: "Unit types", v: "Studio / 1 Bed / 2 Bed" },
    { k: "Ownership", v: "36 months" },
    { k: "Plot", v: "Corner, main road" },
    { k: "Facing", v: "Safari Sports Complex" },
    { k: "Status", v: "Booking open" },
  ],
  units: [
    {
      id: "studio",
      name: "Studio",
      area: 450,
      down: 550_000,
      monthly: 65_000,
      months: 36,
      rentEst: 20_000,
      blurb: "Compact, rentable, and the fastest to appreciate. The right first asset.",
    },
    {
      id: "one-bed",
      name: "1 Bed",
      area: 745,
      down: 850_000,
      monthly: 90_000,
      months: 36,
      rentEst: 30_000,
      blurb: "A terrace of your own and room to live. The most requested plan.",
    },
    {
      id: "two-bed",
      name: "2 Bed",
      area: 1_160,
      down: 1_350_000,
      monthly: 135_000,
      months: 36,
      rentEst: 45_000,
      blurb: "Corner-facing family homes. At Arcade, the two-beds moved first.",
    },
  ],
  /** Annualized appreciation band derived from Arcade actuals (~20%), conservative low bound. */
  appreciation: { low: 0.12, high: 0.2 },
  amenities: [
    { id: "terrace", label: "Private terraces" },
    { id: "pool", label: "Rooftop pool" },
    { id: "gym", label: "Gym" },
    { id: "parking", label: "Dedicated parking" },
    { id: "security", label: "24/7 security" },
    { id: "retail", label: "Street-level retail" },
    { id: "power", label: "Backup power" },
    { id: "lift", label: "Lifts" },
    { id: "lobby", label: "Family lobby" },
  ],
  locationSec: {
    title: "The corner that faces the Sports Complex.",
    body: "Safari Block is one of Bahria Town's most established communities — and this plot fronts its busiest landmark. Frontage like this doesn't get built twice.",
    embed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3406.0004951085602!2d74.19218470998294!3d31.38654987416819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3918ff5168796cfd%3A0xfd01b0db836fb6fc!2sZee99%20Lifestyle%20%7C%20apartments%20Bahria%20town!5e0!3m2!1sen!2s!4v1784367660527!5m2!1sen!2s",
    distances: [
      { t: "Safari Sports Complex", d: "2 min" },
      { t: "Eiffel Tower", d: "6 min" },
      { t: "Main Boulevard", d: "4 min" },
      { t: "Ring Road", d: "12 min" },
    ],
  },
  updates: [
    {
      date: "Jul 2026",
      title: "Booking open",
      body: "Site office live on the corner. First allocations underway — floor choice still open on most stacks.",
      img: "/images/projects/construction-1.jpg",
    },
    {
      date: "Jun 2026",
      title: "Ground broken",
      body: "Demarcation done, excavation started on schedule. Machinery on site within three weeks of approval.",
      img: "/images/projects/construction-2.jpg",
    },
    {
      date: "May 2026",
      title: "Drawings finalized",
      body: "Structural package issued. The same team that took Arcade's grey structure up in eight months is mobilized here.",
      img: "/images/projects/construction-3.jpg",
    },
  ],
  faqs: [
    {
      q: "Is the payment plan fixed once I book?",
      a: "Yes. Your installment schedule is issued in writing at booking and doesn't change.",
    },
    {
      q: "Can I buy from overseas?",
      a: "Yes — booking, payments, and documentation are all handled remotely. Most of our overseas buyers never visit until handover. Read the overseas guide on our blog for the step-by-step.",
    },
    {
      q: "What happens if I miss an installment?",
      a: "Talk to us before the due date. We build grace into every plan; we'd rather adjust than penalize.",
    },
    {
      q: "Is the land and approval in place?",
      a: "The plot is owned outright and the building plan is approved. We share the approval references with every buyer at booking — message us on WhatsApp and we'll send them the same day.",
    },
    {
      q: "Can I sell my unit before handover?",
      a: "Yes — transfers are allowed after 25% of the plan is paid. Arcade buyers who resold early are the reason our price chart exists.",
    },
  ],
};

export const ARCADE: Project = {
  slug: "zee99-arcade",
  name: "Zee99 Arcade",
  status: "construction",
  statusLabel: "Under Construction · Handover 2026",
  location: "Plot R-102–109, Tauheed Block, Bahria Town Lahore",
  short: "The corner near the Eiffel Tower. Grey structure in 8 months — value up 34% since launch.",
  figures: ["2 Bed now 1.61 Cr", "Tauheed Block"],
  cardImage: "/images/projects/arcade-card.jpg",
  heroImage: "/images/projects/arcade-hero.jpg",
  heroLine: "Launched December 2024. Grey structure in eight months. Up 34% before handover.",
  overview:
    "A corner plaza on the main road of Tauheed Block, minutes from the Eiffel Tower — retail at street level, one- and two-bed apartments above. It booked out at launch prices in late 2024, and every published construction milestone since has shown up in the resale price.",
  facts: [
    { k: "Plot", v: "Corner, R-102–109" },
    { k: "Block", v: "Tauheed, main road" },
    { k: "Launched", v: "Dec 2024 — sold out" },
    { k: "Grey structure", v: "8 months" },
    { k: "Handover", v: "2026" },
    { k: "Availability", v: "Transfers only" },
  ],
  history: [
    { label: "Dec 2024", twoBed: 12_000_000, oneBed: 7_200_000 },
    { label: "Jun 2025", twoBed: 13_500_000, oneBed: 8_400_000 },
    { label: "Dec 2025", twoBed: 14_400_000, oneBed: 9_000_000 },
    { label: "Now", twoBed: 16_100_000, oneBed: 10_700_000 },
  ],
  updates: [
    {
      date: "Jul 2026",
      title: "Finishes underway",
      body: "Facade and internal finishes progressing floor by floor. Handover approaching.",
      img: "/images/projects/construction-3.jpg",
    },
    {
      date: "Feb 2026",
      title: "Brickwork complete",
      body: "Masonry and plaster closed out across all floors.",
      img: "/images/projects/construction-2.jpg",
    },
    {
      date: "Aug 2025",
      title: "Grey structure topped out — month 8",
      body: "A stage this market routinely takes 18 to 24 months to reach. On record, with dates.",
      img: "/images/home/arcade-structure.jpg",
    },
    {
      date: "Mar 2025",
      title: "Floors rising",
      body: "A slab roughly every three weeks — photographed, dated, published.",
      img: "/images/projects/construction-1.jpg",
    },
    {
      date: "Dec 2024",
      title: "Launch",
      body: "Booked at 1.20 Cr (2 bed) and 72 Lacs (1 bed). The chart starts here.",
    },
  ],
};

/** Collective card for the delivered record — individual delivered projects to be supplied by client. */
export const DELIVERED_CARD: Project = {
  slug: "delivered-record",
  name: "The First Fifteen Years",
  status: "delivered",
  statusLabel: "Delivered",
  location: "Across Bahria Town Lahore",
  short: "Homes, then plazas — built, finished, handed over across Bahria Town since 2010.",
  figures: ["180+ homes handed over", "2010 – 2024"],
  cardImage: "/images/home/dated-site.jpg",
  heroImage: "/images/home/dated-site.jpg",
  heroLine: "",
  href: "/about",
};

export const PROJECTS: Project[] = [LIFESTYLE, ARCADE, DELIVERED_CARD];

export const getProject = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug && !p.href);
