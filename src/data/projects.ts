// Projects sourced from D1 at build time (npm run pull → content/projects.json).
// Shapes mirror the dashboard's project editor; the calculator and visualizer
// read the booking project so pricing stays in sync with the published plan.
import projectsJson from "../../content/projects.json";

export type ProjectStatus = "booking" | "construction" | "delivered";
export type UnitId = string;

export type Unit = {
  id: UnitId;
  name: string;
  area: number;
  /** Official listed plan (poster figures). */
  down: number;
  monthly: number;
  months: number;
  /** Current Bahria Town rent estimate, PKR/month. */
  rentEst: number;
  blurb: string;
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
  /** Card that links elsewhere (e.g. the delivered collective) — no detail page. */
  href?: string;
  seo?: ProjectSeo;
};

export const DOWN_OPTIONS = [10, 15, 20] as const;
export type DownPct = (typeof DOWN_OPTIONS)[number];

export const PROJECTS = projectsJson as unknown as Project[];

/** The project currently open for booking — anchors the tools and CTAs. */
export const LIFESTYLE =
  PROJECTS.find((p) => p.status === "booking" && !p.href && p.units?.length) ?? PROJECTS[0];

/** The under-construction project whose price history is the track record. */
export const ARCADE =
  PROJECTS.find((p) => p.status === "construction" && !p.href) ?? PROJECTS[0];

export const getProject = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug && !p.href);
