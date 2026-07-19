import { Hono } from "hono";
import type { AppContext } from "./types";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const POST_STATUSES = new Set(["draft", "published"]);
const PROJECT_STATUSES = new Set(["booking", "construction", "delivered"]);
const MEDIA_MAX_BYTES = 25 * 1024 * 1024;
const MEDIA_TYPES = /^(image\/|video\/mp4|application\/pdf)/;

const asJson = (v: unknown, fallback: string) =>
  v === undefined ? fallback : JSON.stringify(v);

export const admin = new Hono<AppContext>();

// ---------------------------------------------------------------- session
admin.get("/me", (c) => c.json({ ok: true }));

// ---------------------------------------------------------------- publish status
// "Dirty" = any content row edited after the last time Publish was pressed.
// This is a proxy for "last publish requested", not "last build succeeded" —
// close enough for a status indicator, and avoids needing a completion callback.
admin.get("/publish-status", async (c) => {
  const last = await c.env.DB.prepare(
    "SELECT triggered_at FROM builds ORDER BY triggered_at DESC LIMIT 1",
  ).first<{ triggered_at: string }>();
  const since = last?.triggered_at ?? "1970-01-01 00:00:00";

  const { results } = await c.env.DB.prepare(
    `SELECT 'post' AS type, CASE WHEN title = '' THEN slug ELSE title END AS label, id, updated_at AS updatedAt
       FROM posts WHERE updated_at > ?
     UNION ALL
     SELECT 'project', COALESCE(NULLIF(json_extract(data, '$.name'), ''), slug), id, updated_at
       FROM projects WHERE updated_at > ?
     UNION ALL
     SELECT 'section', page || ' / ' || key, id, updated_at
       FROM sections WHERE updated_at > ?
     UNION ALL
     SELECT 'setting', key, NULL, updated_at
       FROM settings WHERE updated_at > ?
     UNION ALL
     SELECT 'page_seo', path, NULL, updated_at
       FROM page_seo WHERE updated_at > ?
     ORDER BY updatedAt DESC
     LIMIT 40`,
  )
    .bind(since, since, since, since, since)
    .all();

  return c.json({
    lastPublishAt: last?.triggered_at ?? null,
    dirty: results.length > 0,
    changes: results,
  });
});

// ---------------------------------------------------------------- posts
admin.get("/posts", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, slug, title, category, status, featured, date_iso, updated_at
     FROM posts ORDER BY updated_at DESC`,
  ).all();
  return c.json(results);
});

admin.get("/posts/:id", async (c) => {
  const row = await c.env.DB.prepare("SELECT * FROM posts WHERE id = ?")
    .bind(c.req.param("id"))
    .first();
  return row ? c.json(row) : c.json({ error: "not found" }, 404);
});

type PostBody = {
  slug?: string;
  title?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  read_time?: number;
  date_iso?: string;
  cover?: string;
  thumb?: string;
  cover_alt?: string;
  featured?: boolean | number;
  status?: string;
  body_md?: string;
  seo?: Record<string, string>;
};

function postErrors(b: PostBody, partial: boolean): string | null {
  if (!partial || b.slug !== undefined) {
    if (!b.slug || !SLUG_RE.test(b.slug)) return "slug must be kebab-case (a-z, 0-9, dashes)";
  }
  if (b.status !== undefined && !POST_STATUSES.has(b.status)) return "invalid status";
  if (b.date_iso !== undefined && b.date_iso !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(b.date_iso))
    return "date_iso must be YYYY-MM-DD";
  return null;
}

admin.post("/posts", async (c) => {
  const b = await c.req.json<PostBody>();
  const err = postErrors(b, false);
  if (err) return c.json({ error: err }, 400);
  try {
    const r = await c.env.DB.prepare(
      `INSERT INTO posts (slug, title, excerpt, category, tags, read_time, date_iso,
         cover, thumb, cover_alt, featured, status, body_md, seo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    )
      .bind(
        b.slug,
        b.title ?? "",
        b.excerpt ?? "",
        b.category ?? "",
        asJson(b.tags, "[]"),
        b.read_time ?? 3,
        b.date_iso ?? new Date().toISOString().slice(0, 10),
        b.cover ?? "",
        b.thumb ?? "",
        b.cover_alt ?? "",
        b.featured ? 1 : 0,
        b.status ?? "draft",
        b.body_md ?? "",
        asJson(b.seo, "{}"),
      )
      .first<{ id: number }>();
    return c.json({ id: r!.id }, 201);
  } catch (e) {
    if (String(e).includes("UNIQUE")) return c.json({ error: "slug already exists" }, 409);
    throw e;
  }
});

admin.put("/posts/:id", async (c) => {
  const b = await c.req.json<PostBody>();
  const err = postErrors(b, false);
  if (err) return c.json({ error: err }, 400);
  try {
    const r = await c.env.DB.prepare(
      `UPDATE posts SET slug=?, title=?, excerpt=?, category=?, tags=?, read_time=?,
         date_iso=?, cover=?, thumb=?, cover_alt=?, featured=?, status=?, body_md=?, seo=?,
         updated_at=datetime('now')
       WHERE id=?`,
    )
      .bind(
        b.slug,
        b.title ?? "",
        b.excerpt ?? "",
        b.category ?? "",
        asJson(b.tags, "[]"),
        b.read_time ?? 3,
        b.date_iso ?? "",
        b.cover ?? "",
        b.thumb ?? "",
        b.cover_alt ?? "",
        b.featured ? 1 : 0,
        b.status ?? "draft",
        b.body_md ?? "",
        asJson(b.seo, "{}"),
        c.req.param("id"),
      )
      .run();
    return r.meta.changes ? c.json({ ok: true }) : c.json({ error: "not found" }, 404);
  } catch (e) {
    if (String(e).includes("UNIQUE")) return c.json({ error: "slug already exists" }, 409);
    throw e;
  }
});

admin.delete("/posts/:id", async (c) => {
  const r = await c.env.DB.prepare("DELETE FROM posts WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return r.meta.changes ? c.json({ ok: true }) : c.json({ error: "not found" }, 404);
});

// ---------------------------------------------------------------- projects
admin.get("/projects", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, slug, sort_order, status, json_extract(data, '$.name') AS name, updated_at
     FROM projects ORDER BY sort_order`,
  ).all();
  return c.json(results);
});

admin.get("/projects/:id", async (c) => {
  const row = await c.env.DB.prepare("SELECT * FROM projects WHERE id = ?")
    .bind(c.req.param("id"))
    .first();
  return row ? c.json(row) : c.json({ error: "not found" }, 404);
});

type ProjectBody = {
  slug?: string;
  sort_order?: number;
  status?: string;
  data?: Record<string, unknown>;
  seo?: Record<string, string>;
};

function projectErrors(b: ProjectBody): string | null {
  if (!b.slug || !SLUG_RE.test(b.slug)) return "slug must be kebab-case (a-z, 0-9, dashes)";
  if (b.status !== undefined && !PROJECT_STATUSES.has(b.status)) return "invalid status";
  return null;
}

admin.post("/projects", async (c) => {
  const b = await c.req.json<ProjectBody>();
  const err = projectErrors(b);
  if (err) return c.json({ error: err }, 400);
  try {
    const r = await c.env.DB.prepare(
      `INSERT INTO projects (slug, sort_order, status, data, seo)
       VALUES (?, ?, ?, ?, ?) RETURNING id`,
    )
      .bind(b.slug, b.sort_order ?? 99, b.status ?? "booking", asJson(b.data, "{}"), asJson(b.seo, "{}"))
      .first<{ id: number }>();
    return c.json({ id: r!.id }, 201);
  } catch (e) {
    if (String(e).includes("UNIQUE")) return c.json({ error: "slug already exists" }, 409);
    throw e;
  }
});

admin.put("/projects/:id", async (c) => {
  const b = await c.req.json<ProjectBody>();
  const err = projectErrors(b);
  if (err) return c.json({ error: err }, 400);
  try {
    const r = await c.env.DB.prepare(
      `UPDATE projects SET slug=?, sort_order=?, status=?, data=?, seo=?, updated_at=datetime('now')
       WHERE id=?`,
    )
      .bind(
        b.slug,
        b.sort_order ?? 99,
        b.status ?? "booking",
        asJson(b.data, "{}"),
        asJson(b.seo, "{}"),
        c.req.param("id"),
      )
      .run();
    return r.meta.changes ? c.json({ ok: true }) : c.json({ error: "not found" }, 404);
  } catch (e) {
    if (String(e).includes("UNIQUE")) return c.json({ error: "slug already exists" }, 409);
    throw e;
  }
});

admin.delete("/projects/:id", async (c) => {
  const r = await c.env.DB.prepare("DELETE FROM projects WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return r.meta.changes ? c.json({ ok: true }) : c.json({ error: "not found" }, 404);
});

// ---------------------------------------------------------------- sections
admin.get("/sections", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, page, key, sort_order, data, updated_at FROM sections ORDER BY sort_order",
  ).all();
  return c.json(results);
});

admin.put("/sections/:id", async (c) => {
  const b = await c.req.json<{ data?: unknown }>();
  if (b.data === undefined) return c.json({ error: "data required" }, 400);
  const r = await c.env.DB.prepare(
    "UPDATE sections SET data=?, updated_at=datetime('now') WHERE id=?",
  )
    .bind(JSON.stringify(b.data), c.req.param("id"))
    .run();
  return r.meta.changes ? c.json({ ok: true }) : c.json({ error: "not found" }, 404);
});

// ---------------------------------------------------------------- settings
admin.get("/settings", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT key, data, updated_at FROM settings ORDER BY key",
  ).all();
  return c.json(results);
});

admin.put("/settings/:key", async (c) => {
  const b = await c.req.json<{ data?: unknown }>();
  if (b.data === undefined) return c.json({ error: "data required" }, 400);
  await c.env.DB.prepare(
    `INSERT INTO settings (key, data) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET data=excluded.data, updated_at=datetime('now')`,
  )
    .bind(c.req.param("key"), JSON.stringify(b.data))
    .run();
  return c.json({ ok: true });
});

// ---------------------------------------------------------------- page seo
admin.get("/page-seo", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM page_seo ORDER BY path").all();
  return c.json(results);
});

admin.put("/page-seo", async (c) => {
  const b = await c.req.json<{
    path?: string;
    title?: string;
    description?: string;
    og_image?: string;
    canonical?: string;
  }>();
  if (!b.path?.startsWith("/")) return c.json({ error: "path must start with /" }, 400);
  await c.env.DB.prepare(
    `INSERT INTO page_seo (path, title, description, og_image, canonical) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(path) DO UPDATE SET title=excluded.title, description=excluded.description,
       og_image=excluded.og_image, canonical=excluded.canonical, updated_at=datetime('now')`,
  )
    .bind(b.path, b.title ?? "", b.description ?? "", b.og_image ?? "", b.canonical ?? "")
    .run();
  return c.json({ ok: true });
});

// ---------------------------------------------------------------- media
admin.get("/media", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") ?? 60), 200);
  const offset = Math.max(Number(c.req.query("offset") ?? 0), 0);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM media ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?",
  )
    .bind(limit + 1, offset)
    .all();
  const hasMore = results.length > limit;
  return c.json({
    items: results.slice(0, limit).map((m) => ({ ...m, url: `${c.env.MEDIA_BASE_URL}/${m.key}` })),
    hasMore,
  });
});

admin.post("/media", async (c) => {
  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return c.json({ error: "file required" }, 400);
  if (file.size > MEDIA_MAX_BYTES) return c.json({ error: "file too large (max 25 MB)" }, 413);
  const type = file.type || "application/octet-stream";
  if (!MEDIA_TYPES.test(type)) return c.json({ error: `unsupported type ${type}` }, 415);

  const safeName = (file.name || "upload")
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-80);
  const now = new Date();
  const key = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto
    .randomUUID()
    .slice(0, 8)}-${safeName}`;

  await c.env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" },
  });
  const r = await c.env.DB.prepare(
    `INSERT INTO media (key, filename, content_type, size, alt) VALUES (?, ?, ?, ?, ?) RETURNING id`,
  )
    .bind(key, file.name ?? "", type, file.size, String(form.get("alt") ?? ""))
    .first<{ id: number }>();
  return c.json({ id: r!.id, key, url: `${c.env.MEDIA_BASE_URL}/${key}` }, 201);
});

admin.put("/media/:id", async (c) => {
  const b = await c.req.json<{ alt?: string }>();
  const r = await c.env.DB.prepare("UPDATE media SET alt=? WHERE id=?")
    .bind(b.alt ?? "", c.req.param("id"))
    .run();
  return r.meta.changes ? c.json({ ok: true }) : c.json({ error: "not found" }, 404);
});

admin.delete("/media/:id", async (c) => {
  const row = await c.env.DB.prepare("SELECT key FROM media WHERE id=?")
    .bind(c.req.param("id"))
    .first<{ key: string }>();
  if (!row) return c.json({ error: "not found" }, 404);
  await c.env.MEDIA.delete(row.key);
  await c.env.DB.prepare("DELETE FROM media WHERE id=?").bind(c.req.param("id")).run();
  return c.json({ ok: true });
});
