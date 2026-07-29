// Projects sourced from D1 at build time (npm run pull → content/projects.json).
// Shapes mirror the dashboard's project editor; the calculator and visualizer
// read the booking project so pricing stays in sync with the published plan.
import projectsJson from "../../content/projects.json";

export type ProjectStatus = "booking" | "construction" | "delivered";
export type UnitId = string;

/**
 * A construction-linked payment that sits outside the monthly run — the
 * structure cheque, the half-yearly instalments, the balance at possession.
 * `count` occurrences of `amount`, the first at `atMonth`, then every
 * `everyMonths`. Omitted timing is spread evenly across the plan.
 */
export type Milestone = {
  label: string;
  /** PKR per occurrence. */
  amount: number;
  /** How many times it is charged (1 for a one-off). */
  count: number;
  /** Month of the first charge. Defaults to an even spread over the term. */
  atMonth?: number;
  /** Gap between charges when count > 1. Defaults to an even spread. */
  everyMonths?: number;
};

export type Unit = {
  id: UnitId;
  name: string;
  area: number;
  /**
   * Headline total price. Authoritative when present — the schedule below is
   * reconciled against it in the dashboard. Legacy rows without it fall back
   * to the sum of the schedule.
   */
  price?: number;
  /** Official listed plan (poster figures). */
  down: number;
  monthly: number;
  months: number;
  /** Construction-linked payments on top of the monthly run. */
  milestones?: Milestone[];
  /** Current Bahria Town rent estimate, PKR/month. */
  rentEst: number;
  blurb: string;
  /** Floor-plan drawing shown in the residences modal (R2 URL). Optional. */
  floorPlan?: string;
};

/**
 * The downloadable payment-plan / brochure PDF. Held as a plain URL so the
 * file itself never enters the bundle — nothing is fetched until a visitor
 * actually clicks through.
 */
export type Brochure = {
  url: string;
  /** Link text, e.g. "Payment plan & brochure". */
  label?: string;
  /** File size in bytes, recorded when picked from the media library. */
  bytes?: number;
  /** Free-text currency note, e.g. "Jul 2026". */
  updated?: string;
};

/**
 * How the payment planner presents the numbers. Rows are opt-*out* so a
 * milestone added later shows up by default rather than silently hiding.
 */
export type PlannerConfig = {
  /** Result rows to hide, by key — see `plannerRows()` in lib/pricing. */
  hiddenRows?: string[];
  /** Which side of the tool opens first. */
  defaultMode?: "unit" | "budget";
  /** Unit id pre-selected in "Pick a unit" mode. */
  defaultUnit?: string;
  /** Label on the rental-yield row, e.g. "Est. rental yield (furnished)". */
  yieldLabel?: string;
  /** Small print under the results. Falls back to the built-in disclaimer. */
  disclaimer?: string;
};

/** Project-wide plan settings — the knobs behind the planner and visualizer. */
export type PlanConfig = {
  /** Down-payment stops offered by the tools, in percent. */
  downOptions?: number[];
  /** Derived figures are rounded to this step, in PKR. */
  roundTo?: number;
  /** Month the keys are handed over (may precede the last instalment). */
  handoverMonths?: number;
  /** Poster labels, e.g. "3 Years Payment Plan" / "2.5 Years Handover". */
  tenureLabel?: string;
  handoverLabel?: string;
};

/** A captioned image in the project's amenities gallery. */
export type AmenityMedia = {
  image: string;
  alt: string;
  captionLeft: string;
  captionRight: string;
};

export type PricePoint = { label: string; twoBed: number; oneBed: number };

export type Update = { date: string; title: string; body: string; img?: string };

export type ProjectSeo = {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
};

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
  plan?: PlanConfig;
  planner?: PlannerConfig;
  brochure?: Brochure;
  appreciation?: { low: number; high: number };
  amenities?: { id: string; label: string }[];
  amenityMedia?: AmenityMedia[];
  locationSec?: {
    title: string;
    body: string;
    embed?: string;
    distances: { t: string; d: string }[];
  };
  updates?: Update[];
  faqs?: { q: string; a: string }[];
  history?: PricePoint[];
  /** Card that links elsewhere (e.g. the delivered collective) — no detail page. */
  href?: string;
  seo?: ProjectSeo;
};

/** Fallback stops for projects without a `plan.downOptions` of their own. */
export const DOWN_OPTIONS = [10, 15, 20];
export type DownPct = number;

export const PROJECTS = projectsJson as unknown as Project[];

/** The project currently open for booking — anchors the tools and CTAs. */
export const LIFESTYLE =
  PROJECTS.find((p) => p.status === "booking" && !p.href && p.units?.length) ?? PROJECTS[0];

/** The under-construction project whose price history is the track record. */
export const ARCADE =
  PROJECTS.find((p) => p.status === "construction" && !p.href) ?? PROJECTS[0];

export const getProject = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug && !p.href);
