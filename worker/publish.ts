import { Hono } from "hono";
import type { AppContext } from "./types";

const GH_API = "https://api.github.com";

function ghHeaders(pat: string): HeadersInit {
  return {
    Authorization: `Bearer ${pat}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "zee99-worker",
  };
}

export const publish = new Hono<AppContext>();

/** Dashboard "Publish": record the event, then fire repository_dispatch. */
publish.post("/publish", async (c) => {
  if (!c.env.GITHUB_PAT) {
    return c.json(
      { error: "GITHUB_PAT secret is not configured yet — deploys can't be triggered." },
      501,
    );
  }
  const { note = "" } = await c.req.json<{ note?: string }>().catch(() => ({ note: "" }));
  await c.env.DB.prepare("INSERT INTO builds (note) VALUES (?)").bind(note.slice(0, 200)).run();

  const res = await fetch(`${GH_API}/repos/${c.env.GITHUB_REPO}/dispatches`, {
    method: "POST",
    headers: { ...ghHeaders(c.env.GITHUB_PAT), "Content-Type": "application/json" },
    body: JSON.stringify({ event_type: "publish", client_payload: { note } }),
  });
  if (res.status !== 204) {
    const text = await res.text();
    return c.json({ error: `GitHub dispatch failed (${res.status}): ${text.slice(0, 300)}` }, 502);
  }
  return c.json({ ok: true }, 202);
});

/** Build status for the dashboard — the PAT never reaches the browser. */
publish.get("/build-status", async (c) => {
  if (!c.env.GITHUB_PAT) return c.json({ configured: false, runs: [] });
  const res = await fetch(
    `${GH_API}/repos/${c.env.GITHUB_REPO}/actions/workflows/${c.env.GITHUB_WORKFLOW}/runs?per_page=6`,
    { headers: ghHeaders(c.env.GITHUB_PAT) },
  );
  if (!res.ok) {
    return c.json({ configured: true, error: `GitHub API ${res.status}`, runs: [] }, 502);
  }
  const data = (await res.json()) as {
    workflow_runs?: {
      id: number;
      status: string;
      conclusion: string | null;
      event: string;
      created_at: string;
      updated_at: string;
      html_url: string;
      run_number: number;
    }[];
  };
  return c.json({
    configured: true,
    runs: (data.workflow_runs ?? []).map((r) => ({
      id: r.id,
      runNumber: r.run_number,
      status: r.status,
      conclusion: r.conclusion,
      event: r.event,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      url: r.html_url,
    })),
  });
});
