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
  "SELECT page, key, data FROM sections ORDER BY sort_order;",
  "SELECT slug, status, data, seo FROM projects ORDER BY sort_order;",
  "SELECT * FROM posts WHERE status='published' ORDER BY date_iso DESC;",
  "SELECT path, title, description, og_image, canonical FROM page_seo;",
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

mkdirSync(OUT_DIR, { recursive: true });
const write = (name, data) =>
  writeFileSync(join(OUT_DIR, name), JSON.stringify(data, null, 2), "utf8");
write("settings.json", settings);
write("sections.json", sections);
write("projects.json", projects);
write("posts.json", posts);
write("page-seo.json", pageSeo);

console.log(
  `content/ updated: ${posts.length} posts, ${projects.length} projects, ${sectionRows.length} sections, ${Object.keys(settings).length} settings, ${pageSeoRows.length} page-seo`,
);
