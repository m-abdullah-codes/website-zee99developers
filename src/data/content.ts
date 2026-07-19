// Page sections + SEO sourced from D1 at build time.
import type { Metadata } from "next";
import sectionsJson from "../../content/sections.json";
import pageSeoJson from "../../content/page-seo.json";
import settingsJson from "../../content/settings.json";

const sections = sectionsJson as Record<string, Record<string, unknown>>;

/**
 * Structured JSON block for a page, as edited in the dashboard.
 * Throws at build time if the block is missing — a publish with a deleted
 * section should fail the build, not ship a half-empty page.
 */
export function section<T>(page: string, key: string): T {
  const block = sections[page]?.[key];
  if (block === undefined) {
    throw new Error(`Missing section ${page}/${key} — check the sections table in D1.`);
  }
  return block as T;
}

export type PageSeo = {
  title: string;
  description: string;
  ogImage: string;
  canonical: string;
};

export const GLOBAL_SEO = settingsJson.seo as {
  titleDefault: string;
  titleTemplate: string;
  description: string;
  ogImage: string;
  locale: string;
};

/** Per-path SEO row → Next metadata (empty fields fall back to global). */
export function pageMeta(path: string): Metadata {
  const row = (pageSeoJson as Record<string, PageSeo>)[path];
  if (!row) return {};
  const meta: Metadata = {};
  // The home title is already the full brand line — bypass the "%s — Zee99" template.
  if (row.title) meta.title = path === "/" ? { absolute: row.title } : row.title;
  if (row.description) meta.description = row.description;
  if (row.ogImage || row.title) {
    meta.openGraph = { ...(row.ogImage ? { images: [row.ogImage] } : {}) };
  }
  if (row.canonical) meta.alternates = { canonical: row.canonical };
  return meta;
}
