"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { api, setUnauthorizedHandler, type PublishStatus } from "./api";
import { ToastProvider, isDirty } from "./ui";
import { cn } from "@/lib/utils";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import { PostsList, PostEdit } from "./views/Posts";
import { ProjectsList, ProjectEdit } from "./views/Projects";
import SectionsView from "./views/Sections";
import SettingsView from "./views/Settings";
import SeoView from "./views/Seo";
import MediaView from "./views/Media";

const NAV = [
  ["#/", "Dashboard"],
  ["#/posts", "Posts"],
  ["#/projects", "Projects"],
  ["#/sections", "Sections"],
  ["#/media", "Media"],
  ["#/seo", "SEO"],
  ["#/settings", "Settings"],
] as const;

function View({
  hash,
  nav,
  publishStatus,
  onPublished,
}: {
  hash: string;
  nav: (h: string) => void;
  publishStatus: PublishStatus | null;
  onPublished: () => void;
}) {
  const parts = hash.replace(/^#\//, "").split("/").filter(Boolean);
  switch (parts[0]) {
    case undefined:
      return <Dashboard nav={nav} publishStatus={publishStatus} onPublished={onPublished} />;
    case "posts":
      return parts[1] ? <PostEdit id={parts[1]} nav={nav} /> : <PostsList nav={nav} />;
    case "projects":
      return parts[1] ? <ProjectEdit id={parts[1]} nav={nav} /> : <ProjectsList nav={nav} />;
    case "sections":
      return <SectionsView />;
    case "media":
      return <MediaView />;
    case "seo":
      return <SeoView />;
    case "settings":
      return <SettingsView />;
    default:
      return <Dashboard nav={nav} publishStatus={publishStatus} onPublished={onPublished} />;
  }
}

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export default function AdminApp() {
  // authed: null = checking, false = login, true = app
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [statusEpoch, setStatusEpoch] = useState(0);
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash || "#/",
    () => "#/",
  );

  useEffect(() => {
    setUnauthorizedHandler(() => setAuthed(false));
    fetch("/api/admin/me", {
      credentials: "same-origin",
      headers: { "x-requested-with": "zee99-admin" },
    })
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  // Unpublished-changes badge: poll while the app is open, refresh immediately
  // after a publish (bump statusEpoch) so the badge clears without a 25s wait.
  useEffect(() => {
    if (!authed) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await api.get<PublishStatus>("/admin/publish-status");
        if (!cancelled) setPublishStatus(r);
      } catch {
        // Badge just skips this refresh; never blocks editing.
      }
      if (!cancelled) timer = setTimeout(() => void tick(), 25000);
    };
    void tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [authed, statusEpoch]);

  // Close the mobile menu on navigation — a standard route-change reset, not a render loop.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMobileOpen(false), [hash]);

  const nav = useCallback((h: string) => {
    if (h === window.location.hash) return;
    if (isDirty() && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    window.location.hash = h;
  }, []);

  const logout = async () => {
    if (isDirty() && !window.confirm("You have unsaved changes. Log out without saving?")) return;
    await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin",
      headers: { "x-requested-with": "zee99-admin" },
    }).catch(() => {});
    setAuthed(false);
  };

  if (authed === null) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-paper">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-2">Loading…</p>
      </div>
    );
  }

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  const section = hash.replace(/^#\//, "").split("/")[0];
  const isActive = (h: (typeof NAV)[number][0]) =>
    h === "#/" ? hash === "#/" || hash === "" : section === h.slice(2);

  const badge = publishStatus?.dirty && (
    <button
      type="button"
      onClick={() => nav("#/")}
      className="flex items-center gap-1.5 rounded-full border border-gold-2/50 bg-gold/10 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold/20"
      title="Unpublished changes — go to Dashboard to publish"
    >
      <span className="h-[6px] w-[6px] rounded-full bg-gold-2" />
      {publishStatus.changes.length}
    </button>
  );

  return (
    <ToastProvider>
      <div className="min-h-svh bg-paper text-ink">
        <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
            <button type="button" onClick={() => nav("#/")} className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.34em] text-ink">
                Zee99 · Admin
              </span>
            </button>

            <div className="flex items-center gap-2">
              {badge}
              <nav className="hidden items-center gap-1 sm:flex">
                {NAV.map(([h, label]) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => nav(h)}
                    className={cn(
                      "px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                      isActive(h) ? "bg-ink text-paper" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {label}
                  </button>
                ))}
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2 hover:text-gold"
                >
                  View site ↗
                </a>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2 hover:text-ink"
                >
                  Log out
                </button>
              </nav>

              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className="flex h-8 w-8 items-center justify-center border border-ink/15 text-ink sm:hidden"
              >
                <span className="relative block h-[9px] w-[16px]">
                  <span
                    className={cn(
                      "absolute left-0 top-0 h-px w-full bg-ink transition-transform duration-200",
                      mobileOpen && "top-1/2 rotate-45",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 h-px w-full bg-ink transition-transform duration-200",
                      mobileOpen && "bottom-1/2 -rotate-45",
                    )}
                  />
                </span>
              </button>
            </div>
          </div>

          {mobileOpen && (
            <nav className="flex flex-col border-t border-ink/10 px-5 py-2 sm:hidden">
              {NAV.map(([h, label]) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => nav(h)}
                  className={cn(
                    "px-1 py-2.5 text-left font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                    isActive(h) ? "text-gold" : "text-ink-2 hover:text-ink",
                  )}
                >
                  {label}
                </button>
              ))}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="border-t border-ink/10 px-1 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2 hover:text-gold"
              >
                View site ↗
              </a>
              <button
                type="button"
                onClick={() => void logout()}
                className="px-1 py-2.5 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2 hover:text-ink"
              >
                Log out
              </button>
            </nav>
          )}
        </header>
        <main className="mx-auto max-w-6xl px-5 py-10">
          <View
            hash={hash}
            nav={nav}
            publishStatus={publishStatus}
            onPublished={() => setStatusEpoch((n) => n + 1)}
          />
        </main>
      </div>
    </ToastProvider>
  );
}
