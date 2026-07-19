# Zee99 — content system & operations

One Cloudflare Worker serves everything. The public site is a Next.js static
export served as Worker **assets** — public pages never invoke Worker code.
The Worker script runs only for `/api/*` (`run_worker_first`). Content lives
in **D1**; media lives in **R2** (served from R2 public access).

```
edit in /admin  ──►  /api/admin/* (Hono, session auth)  ──►  D1
                                                              │  "Publish"
                                                              ▼
GitHub Action (repository_dispatch) ── pulls D1 → content/*.json → next build → wrangler deploy
```

## Day-to-day

- Dashboard: `https://<worker-url>/admin` — password login.
- **Saving edits changes the database only.** Press **Publish site** on the
  dashboard to rebuild + deploy (~1–2 min); build status shows on the
  dashboard. Drafts are previewable in the dashboard without publishing.
- Media uploads go to R2 with immutable cache headers; copy the URL from the
  media library. Existing `/public` images are untouched.

## Local development

```sh
npm run pull      # pull content from remote D1 → content/*.json (gitignored)
npm run dev       # public site on :3000 (admin API not available here)
npm run build     # static export → out/
npx wrangler dev  # serve out/ + API on :8787 with LOCAL D1/R2 (.dev.vars secrets)
```

Local D1 is seeded separately from remote; apply migrations with
`npx wrangler d1 migrations apply zee99-db --local` (add `--remote` for prod).
`.dev.vars` holds local-only secrets (see below) and is gitignored.

## Secrets (never committed — public repo)

Worker secrets (`npx wrangler secret put NAME`):

| Name | What |
| --- | --- |
| `ADMIN_PASSWORD_HASH` | `pbkdf2$<iters>$<saltB64url>$<hashB64url>` of the admin password |
| `SESSION_SECRET` | random 32+ bytes, signs the session cookie |
| `GITHUB_PAT` | fine-grained PAT, this repo only: **Contents read/write** (repository_dispatch) + **Actions read** (build status) |

GitHub Actions repo secrets (`gh secret set NAME`):

| Name | What |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | API token with Workers Scripts:Edit, D1:Edit, R2:Edit on this account |
| `CLOUDFLARE_ACCOUNT_ID` | the Cloudflare account id |

To rotate the admin password, generate a new hash and re-put the secret:

```powershell
$pw="<new password>"; $salt=[byte[]]::new(16); [Security.Cryptography.RandomNumberGenerator]::Fill($salt)
$h=[Security.Cryptography.Rfc2898DeriveBytes]::Pbkdf2([Text.Encoding]::UTF8.GetBytes($pw),$salt,100000,[Security.Cryptography.HashAlgorithmName]::SHA256,32)
$b={param($b)[Convert]::ToBase64String($b).Replace('+','-').Replace('/','_').TrimEnd('=')}
"pbkdf2`$100000`$$(& $b $salt)`$$(& $b $h)" | npx wrangler secret put ADMIN_PASSWORD_HASH
```

## Auth model

Cloudflare Access was considered; it requires a custom domain in the zone, so
while the site runs on `*.workers.dev` the Worker uses minimal session auth
instead: PBKDF2 (WebCrypto) verify against the secret hash, HttpOnly
`SameSite=Strict` cookie (HMAC-signed, 7-day expiry), login rate-limited in D1
(8 failures / 15 min / IP), plus an `x-requested-with` header check on
mutations. Every `/api/admin/*` route is gated server-side. If the site moves
to a custom domain later, swap the middleware for `Cf-Access-Jwt-Assertion`
verification and put Access in front of `/admin*` and `/api/*`.

## Schema

D1 `zee99-db` (migrations in `migrations/`): `posts` (markdown bodies,
draft/published), `projects` (slug/status/sort + JSON document), `sections`
(page+key → JSON block), `settings` (`site`, `stats`, `rates`, `seo`),
`page_seo`, `media`, `login_attempts`, `builds`. Indexes on slug, status,
updated_at, date_iso.

SEO is emitted at build time: per-page meta from `page_seo` (posts/projects
override via their own `seo` JSON), plus `sitemap.xml`, `robots.txt`, and
`rss.xml`.
