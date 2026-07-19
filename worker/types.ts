export type Env = {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
  GITHUB_REPO: string;
  GITHUB_WORKFLOW: string;
  MEDIA_BASE_URL: string;
  // Secrets
  ADMIN_PASSWORD_HASH: string; // pbkdf2$<iterations>$<saltB64>$<hashB64>
  SESSION_SECRET: string;
  GITHUB_PAT?: string; // fine-grained PAT: Contents read/write + Actions read on this repo
};

export type AppContext = { Bindings: Env };
