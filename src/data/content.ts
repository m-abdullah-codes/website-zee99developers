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

/**
 * Like {@link section}, but returns `fallback` when the block is absent instead
 * of throwing. Use for pages that must render even before their D1 row exists
 * (e.g. a page added in code ahead of the matching sections/page_seo rows).
 */
export function sectionOr<T>(page: string, key: string, fallback: T): T {
  const block = sections[page]?.[key];
  return (block === undefined ? fallback : block) as T;
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

/**
 * Per-path SEO row → Next metadata (empty fields fall back to global).
 * `fallback` supplies title/description/ogImage for pages whose page_seo row
 * may not exist yet, so SEO is correct even before the D1 row is added.
 */
export function pageMeta(path: string, fallback: Partial<PageSeo> = {}): Metadata {
  const row = (pageSeoJson as Record<string, PageSeo>)[path] as PageSeo | undefined;
  const title = row?.title || fallback.title;
  const description = row?.description || fallback.description;
  const ogImage = row?.ogImage || fallback.ogImage;
  const images = ogImage ? [ogImage] : undefined;
  // Every page gets a self-referencing canonical unless one is set explicitly.
  const canonical = row?.canonical || path;

  const meta: Metadata = { alternates: { canonical } };
  // The home title is already the full brand line — bypass the "%s — Zee99" template.
  if (title) meta.title = path === "/" ? { absolute: title } : title;
  if (description) meta.description = description;
  meta.openGraph = {
    type: "website",
    url: canonical,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(images ? { images } : {}),
  };
  meta.twitter = {
    card: "summary_large_image",
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(images ? { images } : {}),
  };
  return meta;
}
