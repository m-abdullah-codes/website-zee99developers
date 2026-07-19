"use client";

import { useEffect, useState } from "react";
import { api, type BuildRun, type PublishStatus } from "../api";
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

const TYPE_LABEL: Record<string, string> = {
  post: "Post",
  project: "Project",
  section: "Section",
  setting: "Setting",
  page_seo: "SEO",
};

const changeHref = (type: string, id: number | null): string => {
  switch (type) {
    case "post":
      return `#/posts/${id}`;
    case "project":
      return `#/projects/${id}`;
    case "section":
      return "#/sections";
    case "page_seo":
      return "#/seo";
    default:
      return "#/settings";
  }
};

// GitHub timestamps are already ISO ("...T...Z"); D1's datetime('now') is
// "YYYY-MM-DD HH:MM:SS" (UTC, no zone) and needs converting before parsing.
const ago = (input: string) => {
  const iso = input.includes("T") ? input : `${input.replace(" ", "T")}Z`;
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return `${Math.round(s)}s ago`;
  if (s < 5400) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
};

export default function Dashboard({
  nav,
  publishStatus,
  onPublished,
}: {
  nav: (hash: string) => void;
  publishStatus: PublishStatus | null;
  onPublished: () => void;
}) {
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
      onPublished();
      setTimeout(() => setPollEpoch((n) => n + 1), 2500);
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  const latest = status?.runs[0];
  const dirty = publishStatus?.dirty ?? false;

  return (
    <div>
      <h2 className="mb-6 font-display text-[1.8rem] font-[400] text-ink">Dashboard</h2>

      {/* publish band */}
      <div
        className={
          dirty
            ? "mb-8 border border-gold-2/50 bg-gold/5 p-6"
            : "mb-8 border border-ink/15 bg-white/40 p-6"
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-[1.25rem] text-ink">
              {dirty
                ? `${publishStatus!.changes.length} unpublished change${publishStatus!.changes.length === 1 ? "" : "s"}`
                : "Publish to the live site"}
            </p>
            <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-ink-2">
              {dirty
                ? "Saving content updates the database only. Publish to rebuild the static site and deploy it — one to two minutes end to end."
                : publishStatus
                  ? "Everything saved is already published. Nothing is waiting to go out."
                  : "Saving content updates the database only. Publishing rebuilds the static site from the database and deploys it."}
            </p>
          </div>
          <AdminButton variant="gold" busy={publishing} onClick={() => void doPublish()}>
            {dirty ? "Publish now" : "Publish site"}
          </AdminButton>
        </div>

        {dirty && (
          <div className="mt-5 divide-y divide-gold-2/20 border-t border-gold-2/30">
            {publishStatus!.changes.slice(0, 12).map((c, i) => (
              <button
                key={`${c.type}-${c.id}-${i}`}
                type="button"
                onClick={() => nav(changeHref(c.type, c.id))}
                className="flex w-full items-center justify-between gap-3 py-2.5 text-left font-mono text-[11px] transition-colors hover:text-gold"
              >
                <span className="flex items-center gap-3 truncate">
                  <span className="shrink-0 rounded-full border border-ink/15 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-ink-2">
                    {TYPE_LABEL[c.type] ?? c.type}
                  </span>
                  <span className="truncate text-ink">{c.label}</span>
                </span>
                <span className="shrink-0 text-ink-2/60">{ago(c.updatedAt)}</span>
              </button>
            ))}
            {publishStatus!.changes.length > 12 && (
              <p className="pt-2.5 text-[11px] text-ink-2/70">
                +{publishStatus!.changes.length - 12} more
              </p>
            )}
          </div>
        )}

        <div className="mt-5 border-t border-ink/10 pt-4">
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
