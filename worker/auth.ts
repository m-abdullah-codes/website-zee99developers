import type { Context, Next } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { AppContext, Env } from "./types";

const COOKIE = "z99_session";
const SESSION_TTL_S = 7 * 24 * 3600;
const RATE_WINDOW_S = 15 * 60;
const RATE_MAX_FAILURES = 8;

const enc = new TextEncoder();

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");

const fromB64 = (s: string) =>
  Uint8Array.from(atob(s.replaceAll("-", "+").replaceAll("_", "/")), (c) => c.charCodeAt(0));

function timingSafeEq(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Verify a password against pbkdf2$<iterations>$<saltB64>$<hashB64>. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations < 1000 || iterations > 1_000_000) return false;
  const salt = fromB64(parts[2]);
  const expected = fromB64(parts[3]);
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as unknown as ArrayBuffer, iterations },
    key,
    expected.length * 8,
  );
  return timingSafeEq(new Uint8Array(bits), expected);
}

async function hmac(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
}

async function makeSession(secret: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_S;
  return `${exp}.${await hmac(secret, `sess:${exp}`)}`;
}

async function checkSession(secret: string, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const expected = await hmac(secret, `sess:${expStr}`);
  return timingSafeEq(enc.encode(sig), enc.encode(expected));
}

export function clientIp(c: Context<AppContext>): string {
  return c.req.header("cf-connecting-ip") ?? "local";
}

export async function loginRateLimited(env: Env, ip: string): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const { results } = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ? AND ts > ?",
  )
    .bind(ip, now - RATE_WINDOW_S)
    .all<{ n: number }>();
  return (results[0]?.n ?? 0) >= RATE_MAX_FAILURES;
}

export async function recordFailedLogin(env: Env, ip: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.batch([
    env.DB.prepare("INSERT INTO login_attempts (ip, ts) VALUES (?, ?)").bind(ip, now),
    env.DB.prepare("DELETE FROM login_attempts WHERE ts < ?").bind(now - 4 * RATE_WINDOW_S),
  ]);
}

export function setSessionCookie(c: Context<AppContext>, token: string): void {
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
    maxAge: SESSION_TTL_S,
  });
}

export function clearSessionCookie(c: Context<AppContext>): void {
  deleteCookie(c, COOKIE, { path: "/" });
}

export async function createSession(env: Env): Promise<string> {
  return makeSession(env.SESSION_SECRET);
}

/** Server-side gate for every /api/admin/* route. */
export async function requireSession(c: Context<AppContext>, next: Next) {
  const ok = await checkSession(c.env.SESSION_SECRET, getCookie(c, COOKIE));
  if (!ok) return c.json({ error: "unauthorized" }, 401);
  // Light CSRF hardening on top of SameSite=Strict.
  if (c.req.method !== "GET" && c.req.header("x-requested-with") !== "zee99-admin") {
    return c.json({ error: "bad request origin" }, 403);
  }
  await next();
}
