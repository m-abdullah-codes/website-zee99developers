-- Zee99 content schema. Content lives in D1; the site is built from a
-- point-in-time pull of these tables (scripts/pull-content.mjs).

CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  read_time INTEGER NOT NULL DEFAULT 3,
  date_iso TEXT NOT NULL DEFAULT '',
  cover TEXT NOT NULL DEFAULT '',
  thumb TEXT NOT NULL DEFAULT '',
  cover_alt TEXT NOT NULL DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  body_md TEXT NOT NULL DEFAULT '',
  seo TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_posts_status ON posts (status);
CREATE INDEX idx_posts_updated_at ON posts (updated_at DESC);
CREATE INDEX idx_posts_date_iso ON posts (date_iso DESC);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'booking' CHECK (status IN ('booking', 'construction', 'delivered')),
  data TEXT NOT NULL DEFAULT '{}',
  seo TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_updated_at ON projects (updated_at DESC);

-- Structured JSON blocks per page (hero/statement/pillars/...).
CREATE TABLE sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  key TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  data TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (page, key)
);
CREATE INDEX idx_sections_page ON sections (page);

-- Global singletons: site, stats, rates, seo.
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  data TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Per-path SEO for static pages; posts/projects carry their own seo column.
CREATE TABLE page_seo (
  path TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  og_image TEXT NOT NULL DEFAULT '',
  canonical TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- R2 object metadata; objects are served from R2 public access, not the Worker.
CREATE TABLE media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT '',
  size INTEGER NOT NULL DEFAULT 0,
  alt TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_media_created_at ON media (created_at DESC);

-- Login rate limiting (sliding window per IP).
CREATE TABLE login_attempts (
  ip TEXT NOT NULL,
  ts INTEGER NOT NULL
);
CREATE INDEX idx_login_attempts_ip_ts ON login_attempts (ip, ts);

-- Publish events fired from the dashboard.
CREATE TABLE builds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note TEXT NOT NULL DEFAULT '',
  triggered_at TEXT NOT NULL DEFAULT (datetime('now'))
);
