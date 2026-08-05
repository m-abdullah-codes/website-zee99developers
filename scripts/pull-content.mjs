// Pulls all site content from the remote D1 database into content/*.json,
// which pages consume during `next build`. Run before building:
//   npm run pull
// Locally this uses your wrangler OAuth login; in CI it uses
// CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID.
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DB = "zee99-db";
const OUT_DIR = join(process.cwd(), "content");

// One --command call: remote execution returns one result set per statement.
// (--file against remote D1 goes through the import path and returns only a summary.)
const QUERIES = [
  "SELECT key, data FROM settings;",
  "SELECT page, key, data, updated_at FROM sections ORDER BY sort_order;",
  "SELECT slug, status, data, seo, updated_at FROM projects ORDER BY sort_order;",
  "SELECT * FROM posts WHERE status='published' ORDER BY date_iso DESC;",
  "SELECT path, title, description, og_image, canonical, updated_at FROM page_seo;",
].join(" ");

const raw = execSync(`npx wrangler d1 execute ${DB} --remote --json --command "${QUERIES}"`, {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
  stdio: ["ignore", "pipe", "inherit"],
});

// Defensive: wrangler chatter belongs on stderr, but never trust a CLI.
const results = JSON.parse(raw.slice(raw.indexOf("[")));
if (!Array.isArray(results) || results.length !== 5 || results.some((r) => !r.success)) {
  console.error(raw);
  throw new Error("Unexpected D1 response shape");
}
const [settingsRows, sectionRows, projectRows, postRows, pageSeoRows] = results.map(
  (r) => r.results,
);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const displayDate = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
const parse = (s, fallback) => {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

const settings = Object.fromEntries(settingsRows.map((r) => [r.key, parse(r.data, {})]));

const sections = {};
for (const r of sectionRows) {
  (sections[r.page] ??= {})[r.key] = parse(r.data, {});
}

const projects = projectRows.map((r) => ({
  slug: r.slug,
  status: r.status,
  seo: parse(r.seo, {}),
  ...parse(r.data, {}),
}));

const posts = postRows.map((r) => ({
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  category: r.category,
  tags: parse(r.tags, []),
  readTime: r.read_time,
  date: displayDate(r.date_iso),
  dateISO: r.date_iso,
  cover: r.cover,
  thumb: r.thumb,
  coverAlt: r.cover_alt,
  featured: !!r.featured,
  bodyMd: r.body_md,
  seo: parse(r.seo, {}),
}));

const pageSeo = Object.fromEntries(
  pageSeoRows.map((r) => [
    r.path,
    { title: r.title, description: r.description, ogImage: r.og_image, canonical: r.canonical },
  ]),
);

// ---------------------------------------------------------------- lastmod
// Real per-route modification times for the sitemap. Without this every build
// would stamp `new Date()` on every URL, which tells Google the whole site
// changed on each deploy — and a lastmod that is always "now" is one search
// engines learn to ignore.
//
// Deliberately sourced from content tables only. `settings` is excluded: a
// phone number edit rerenders the footer everywhere, but it is not a
// significant change to any given page, which is the bar lastmod is meant to
// clear.
const SECTION_ROUTES = {
  home: "/",
  about: "/about",
  "payment-planner": "/payment-planner",
  projects: "/projects",
  blog: "/blog",
  privacy: "/privacy",
};

// SQLite's datetime('now') is UTC but unmarked — "YYYY-MM-DD HH:MM:SS".
const toIso = (ts) => (ts ? `${String(ts).replace(" ", "T")}Z` : null);

const lastmod = {};
const touch = (route, ts) => {
  const iso = toIso(ts);
  if (!route || !iso) return;
  if (!lastmod[route] || iso > lastmod[route]) lastmod[route] = iso;
};

for (const r of sectionRows) touch(SECTION_ROUTES[r.page], r.updated_at);
// A title/description edit changes the page as users and crawlers see it.
for (const r of pageSeoRows) touch(r.path, r.updated_at);
// Detail pages carry their own time; a changed item also freshens its index.
for (const r of projectRows) {
  if (parse(r.data, {}).href) continue; // off-site entry, never in the sitemap
  touch(`/projects/${r.slug}`, r.updated_at);
  touch("/projects", r.updated_at);
}
for (const r of postRows) {
  touch(`/blog/${r.slug}`, r.updated_at);
  touch("/blog", r.updated_at);
}

mkdirSync(OUT_DIR, { recursive: true });
const write = (name, data) =>
  writeFileSync(join(OUT_DIR, name), JSON.stringify(data, null, 2), "utf8");
write("settings.json", settings);
write("sections.json", sections);
write("projects.json", projects);
write("posts.json", posts);
write("page-seo.json", pageSeo);
write("lastmod.json", lastmod);

console.log(
  `content/ updated: ${posts.length} posts, ${projects.length} projects, ${sectionRows.length} sections, ${Object.keys(settings).length} settings, ${pageSeoRows.length} page-seo, ${Object.keys(lastmod).length} lastmod`,
);
