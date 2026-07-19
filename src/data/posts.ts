// Published posts sourced from D1 at build time (npm run pull → content/posts.json).
// Bodies are markdown, rendered by src/lib/markdown.ts. Drafts never reach this
// file — they are previewable in the dashboard only.
import postsJson from "../../content/posts.json";

export type Category = string;

export type PostSeo = {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  tags: string[];
  readTime: number;
  /** Display form, e.g. "12 Jul 2026" (derived from dateISO at pull time). */
  date: string;
  dateISO: string;
  cover: string;
  thumb: string;
  coverAlt: string;
  featured?: boolean;
  bodyMd: string;
  seo?: PostSeo;
};

export const POSTS = postsJson as unknown as Post[];

/** Canonical order first, then anything new the dashboard introduces. */
const CANONICAL = ["Market Analysis", "Construction Updates", "Buying Guides", "Overseas Buyers"];
export const CATEGORIES: Category[] = [
  ...CANONICAL.filter((c) => POSTS.some((p) => p.category === c)),
  ...[...new Set(POSTS.map((p) => p.category))].filter((c) => c && !CANONICAL.includes(c)),
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

export const latestPosts = (n: number) =>
  [...POSTS].sort((a, b) => b.dateISO.localeCompare(a.dateISO)).slice(0, n);
