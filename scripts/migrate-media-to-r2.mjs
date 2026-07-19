// One-time migration: uploads public/images + public/media to R2 (stable keys
// mirroring their public/ path), registers them in the D1 `media` table, then
// rewrites every existing content reference (posts/projects/sections/settings/
// page_seo) from the old /public path to the new R2 URL, and adds R2 URLs for
// a handful of section fields that were previously hardcoded in JSX (hero
// video/poster, section background images).
//
// Idempotent: media inserts use INSERT OR IGNORE (key is UNIQUE); URL rewrites
// are plain string REPLACE, a no-op once already applied. Safe to re-run.
//
// Run: node scripts/migrate-media-to-r2.mjs
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const root = join(fileURLToPath(import.meta.url), "..", "..");
// Invoke wrangler's JS entry directly via `node` — avoids Windows cmd.exe
// re-splitting argv on spaces/commas when spawning npx.cmd (paths under
// "Contour Systems" and values like "public, max-age=..." both break that).
const wranglerBin = join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const wrangler = (args) => execFileSync(process.execPath, [wranglerBin, ...args], { stdio: "inherit" });
const PUBLIC_DIR = join(root, "public");
const BUCKET = "zee99-media";
const MEDIA_BASE_URL = "https://pub-0dc6556a273e45f5a42c3978056f5cf9.r2.dev";
const DB = "zee99-db";

// The logo is a brand mark, not editorial content — left as a static asset.
const EXCLUDE = new Set(["images/logo.jpeg", "images/logo.svg"]);

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
};

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = [...walk(join(PUBLIC_DIR, "images")), ...walk(join(PUBLIC_DIR, "media"))]
  .map((full) => ({ full, key: relative(PUBLIC_DIR, full).replaceAll("\\", "/") }))
  .filter((f) => !EXCLUDE.has(f.key));

const q = (v) => `'${String(v).replaceAll("'", "''")}'`;

console.log(`Uploading ${files.length} files to R2 bucket ${BUCKET}...`);
const mappings = [];
for (const f of files) {
  const ext = extname(f.full).toLowerCase();
  const mime = MIME[ext] ?? "application/octet-stream";
  const size = statSync(f.full).size;
  wrangler([
    "r2",
    "object",
    "put",
    `${BUCKET}/${f.key}`,
    "--file",
    f.full,
    "--content-type",
    mime,
    "--cache-control",
    "public, max-age=31536000, immutable",
    "--remote",
  ]);
  const alt = basename(f.key, ext).replaceAll(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  mappings.push({ key: f.key, mime, size, alt, oldPath: `/${f.key}`, newUrl: `${MEDIA_BASE_URL}/${f.key}` });
  console.log(`  ${f.key} (${mime}, ${size}b)`);
}

const sql = [];

// 1. Register in the media table (idempotent).
for (const m of mappings) {
  sql.push(
    `INSERT OR IGNORE INTO media (key, filename, content_type, size, alt) VALUES (${q(m.key)}, ${q(basename(m.key))}, ${q(m.mime)}, ${m.size}, ${q(m.alt)});`,
  );
}

// 2. Rewrite every existing reference to the old /public path.
for (const m of mappings) {
  const old = q(m.oldPath);
  const next = q(m.newUrl);
  const like = q(`%${m.oldPath}%`);
  sql.push(
    `UPDATE posts SET cover = REPLACE(cover, ${old}, ${next}), thumb = REPLACE(thumb, ${old}, ${next}) WHERE cover LIKE ${like} OR thumb LIKE ${like};`,
    `UPDATE projects SET data = REPLACE(data, ${old}, ${next}) WHERE data LIKE ${like};`,
    `UPDATE sections SET data = REPLACE(data, ${old}, ${next}) WHERE data LIKE ${like};`,
    `UPDATE settings SET data = REPLACE(data, ${old}, ${next}) WHERE data LIKE ${like};`,
    `UPDATE page_seo SET og_image = REPLACE(og_image, ${old}, ${next}) WHERE og_image LIKE ${like};`,
  );
}

// 3. Fields that were hardcoded in JSX (not in D1 at all) — add them now that
// components read from section data instead.
const urlFor = (path) => q(`${MEDIA_BASE_URL}${path}`);
const NEW_FIELDS = [
  { page: "home", key: "hero", set: `'$.heroVideo', ${urlFor("/media/hero.mp4")}, '$.heroPoster', ${urlFor("/images/home/featured-lifestyle.jpg")}` },
  { page: "home", key: "statement", set: `'$.bgImage', ${urlFor("/images/home/opening-bg.jpg")}` },
  { page: "home", key: "featured", set: `'$.image', ${urlFor("/images/home/featured-lifestyle.jpg")}` },
  { page: "home", key: "overseas", set: `'$.image', ${urlFor("/images/home/overseas.jpg")}` },
  { page: "home", key: "track-record", set: `'$.bgImage', ${urlFor("/images/home/arcade-structure.jpg")}` },
  { page: "home", key: "closing", set: `'$.bgImage', ${urlFor("/images/home/featured-lifestyle.jpg")}` },
];
for (const f of NEW_FIELDS) {
  sql.push(
    `UPDATE sections SET data = json_set(data, ${f.set}), updated_at = datetime('now') WHERE page = ${q(f.page)} AND key = ${q(f.key)};`,
  );
}

const sqlPath = join(os.tmpdir(), `zee99-media-migration-${Date.now()}.sql`);
writeFileSync(sqlPath, sql.join("\n"), "utf8");
console.log(`\n${sql.length} SQL statements written to ${sqlPath}`);

console.log("Applying to remote D1...");
wrangler(["d1", "execute", DB, "--remote", "--file", sqlPath]);

console.log(`\nDone. ${mappings.length} files migrated to R2 and referenced from D1.`);
