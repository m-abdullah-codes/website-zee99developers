// Zee99 Worker — serves only /api/* (assets.run_worker_first); the public site
// is a static export served directly from Worker assets and never runs this code.
import { Hono } from "hono";
import type { AppContext } from "./types";
import {
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  requireSession,
  clientIp,
  loginRateLimited,
  recordFailedLogin,
} from "./auth";
import { admin } from "./admin";
import { publish } from "./publish";

const app = new Hono<AppContext>().basePath("/api");

app.get("/health", (c) => c.json({ ok: true }));

app.post("/login", async (c) => {
  const ip = clientIp(c);
  if (await loginRateLimited(c.env, ip)) {
    return c.json({ error: "Too many attempts — try again in 15 minutes." }, 429);
  }
  const { password } = await c.req.json<{ password?: string }>().catch(() => ({ password: "" }));
  if (!password || !(await verifyPassword(password, c.env.ADMIN_PASSWORD_HASH))) {
    await recordFailedLogin(c.env, ip);
    return c.json({ error: "Wrong password." }, 401);
  }
  setSessionCookie(c, await createSession(c.env));
  return c.json({ ok: true });
});

app.post("/logout", (c) => {
  clearSessionCookie(c);
  return c.json({ ok: true });
});

app.use("/admin/*", requireSession);
app.route("/admin", admin);
app.route("/admin", publish);

app.notFound((c) => c.json({ error: "not found" }, 404));

app.onError((err, c) => {
  console.error("api error:", err);
  return c.json({ error: "internal error" }, 500);
});

export default app;
