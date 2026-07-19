"use client";

import { useEffect, useState } from "react";
import { api, type BuildRun } from "../api";
import { AdminButton, StatusBadge, useToast } from "../ui";

type StatusResp = { configured: boolean; error?: string; runs: BuildRun[] };

const NAV_CARDS: { hash: string; title: string; desc: string }[] = [
  { hash: "#/posts", title: "Blog posts", desc: "Write, edit, preview drafts" },
  { hash: "#/projects", title: "Projects", desc: "Pricing, units, updates, FAQs" },
  { hash: "#/sections", title: "Page sections", desc: "Hero, about, pillars & co" },
  { hash: "#/media", title: "Media", desc: "Upload to R2, copy URLs" },
  { hash: "#/seo", title: "SEO", desc: "Titles, descriptions, OG images" },
  { hash: "#/settings", title: "Settings", desc: "Contact, stats, FX rates" },
];

const ago = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return `${Math.round(s)}s ago`;
  if (s < 5400) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
};

export default function Dashboard({ nav }: { nav: (hash: string) => void }) {
  const [status, setStatus] = useState<StatusResp | null>(null);
  const [publishing, setPublishing] = useState(false);
  // Bumping this restarts the poll loop immediately (used after publishing).
  const [pollEpoch, setPollEpoch] = useState(0);
  const toast = useToast();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    const tick = async () => {
      let delay = 60000;
      try {
        const r = await api.get<StatusResp>("/admin/build-status");
        if (cancelled) return;
        setStatus(r);
        if (r.runs.some((x) => x.status === "in_progress" || x.status === "queued")) delay = 8000;
      } catch {
        // Status polling failing should never block editing.
      }
      if (!cancelled) timer = setTimeout(() => void tick(), delay);
    };
    void tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [pollEpoch]);

  const doPublish = async () => {
    setPublishing(true);
    try {
      await api.post("/admin/publish", { note: "dashboard" });
      toast("ok", "Publish triggered — the site rebuilds from D1 in a couple of minutes.");
      setTimeout(() => setPollEpoch((n) => n + 1), 2500);
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  const latest = status?.runs[0];

  return (
    <div>
      <h2 className="mb-6 font-display text-[1.8rem] font-[400] text-ink">Dashboard</h2>

      {/* publish band */}
      <div className="mb-8 border border-gold-2/40 bg-gold/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-[1.25rem] text-ink">Publish to the live site</p>
            <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-ink-2">
              Saving content updates the database only. Publishing rebuilds the static site from
              the database and deploys it — one to two minutes end to end.
            </p>
          </div>
          <AdminButton variant="gold" busy={publishing} onClick={() => void doPublish()}>
            Publish site
          </AdminButton>
        </div>

        <div className="mt-5 border-t border-gold-2/30 pt-4">
          {status === null ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">
              Checking build status…
            </p>
          ) : !status.configured ? (
            <p className="text-[12px] text-ink-2">
              Build status unavailable: the GITHUB_PAT secret isn&rsquo;t configured on the Worker
              yet.
            </p>
          ) : status.error ? (
            <p className="text-[12px] text-red-900">{status.error}</p>
          ) : latest ? (
            <div className="grid gap-2">
              {status.runs.slice(0, 4).map((r) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-ink-2 hover:text-ink"
                >
                  <StatusBadge status={r.status === "completed" ? (r.conclusion ?? "queued") : r.status} />
                  <span>#{r.runNumber}</span>
                  <span className="uppercase tracking-[0.12em]">{r.event.replace("_", " ")}</span>
                  <span className="text-ink-2/60">{ago(r.createdAt)}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-ink-2">No builds yet.</p>
          )}
        </div>
      </div>

      {/* nav cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NAV_CARDS.map((c) => (
          <button
            key={c.hash}
            type="button"
            onClick={() => nav(c.hash)}
            className="border border-ink/15 bg-white/40 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-gold-2/60 hover:shadow-md"
          >
            <p className="font-display text-[1.2rem] text-ink">{c.title}</p>
            <p className="mt-1 text-[12px] text-ink-2">{c.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
