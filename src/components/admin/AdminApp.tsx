"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { setUnauthorizedHandler } from "./api";
import { ToastProvider } from "./ui";
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

function View({ hash, nav }: { hash: string; nav: (h: string) => void }) {
  const parts = hash.replace(/^#\//, "").split("/").filter(Boolean);
  switch (parts[0]) {
    case undefined:
      return <Dashboard nav={nav} />;
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
      return <Dashboard nav={nav} />;
  }
}

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export default function AdminApp() {
  // authed: null = checking, false = login, true = app
  const [authed, setAuthed] = useState<boolean | null>(null);
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

  const nav = useCallback((h: string) => {
    window.location.hash = h;
  }, []);

  const logout = async () => {
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

  return (
    <ToastProvider>
      <div className="min-h-svh bg-paper text-ink">
        <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3">
            <button type="button" onClick={() => nav("#/")} className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.34em] text-ink">
                Zee99 · Admin
              </span>
            </button>
            <nav className="flex flex-wrap items-center gap-1">
              {NAV.map(([h, label]) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => nav(h)}
                  className={cn(
                    "px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                    (h === "#/" ? hash === "#/" || hash === "" : section === h.slice(2))
                      ? "bg-ink text-paper"
                      : "text-ink-2 hover:text-ink",
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
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-10">
          <View hash={hash} nav={nav} />
        </main>
      </div>
    </ToastProvider>
  );
}
