"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type SectionRow } from "../api";
import { AdminButton, useToast, useUnsavedFieldToast, useUnsavedGuard, useConfirm } from "../ui";
import JsonEditor, { type Json } from "../JsonEditor";
import { cn } from "@/lib/utils";

const PAGE_LABELS: Record<string, string> = {
  home: "Home",
  "payment-planner": "Payment Planner",
  about: "About",
  projects: "Projects index",
  blog: "Blog index",
  privacy: "Privacy",
};

export default function SectionsView() {
  const [rows, setRows] = useState<SectionRow[] | null>(null);
  const [page, setPage] = useState("home");
  const [openId, setOpenId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Json>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    api
      .get<SectionRow[]>("/admin/sections")
      .then(setRows)
      .catch((e) => toast("err", e.message));
  }, [toast]);

  const pages = useMemo(() => [...new Set((rows ?? []).map((r) => r.page))], [rows]);
  const visible = (rows ?? []).filter((r) => r.page === page);
  const dirtyIds = Object.keys(drafts).map(Number);
  useUnsavedGuard(dirtyIds.length > 0);
  const onFieldBlur = useUnsavedFieldToast(dirtyIds.length > 0);

  const save = async (row: SectionRow) => {
    const data = drafts[row.id];
    if (data === undefined) return;
    setSavingId(row.id);
    try {
      await api.put(`/admin/sections/${row.id}`, { data });
      setRows((prev) =>
        prev
          ? prev.map((r) => (r.id === row.id ? { ...r, data: JSON.stringify(data) } : r))
          : prev,
      );
      setDrafts((d) => {
        const next = { ...d };
        delete next[row.id];
        return next;
      });
      toast("ok", `${row.page}/${row.key} saved. Publish to rebuild the site.`);
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div onBlur={onFieldBlur}>
      <h2 className="mb-2 font-display text-[1.8rem] font-[400] text-ink">Page sections</h2>
      <p className="mb-6 max-w-2xl text-[12.5px] leading-relaxed text-ink-2">
        Structured blocks per page. In titles, wrap words in *asterisks* for the gold italic
        accent. Changes go live after the next publish.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              if (dirtyIds.length && !confirm("Discard unsaved section changes?")) return;
              setDrafts({});
              setOpenId(null);
              setPage(p);
            }}
            className={cn(
              "rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
              page === p
                ? "border-ink bg-ink text-paper"
                : "border-ink/20 text-ink-2 hover:border-ink/50",
            )}
          >
            {PAGE_LABELS[p] ?? p}
          </button>
        ))}
      </div>

      {rows === null ? (
        <p className="text-[13px] text-ink-2">Loading…</p>
      ) : (
        <div className="divide-y divide-ink/10 border border-ink/15">
          {visible.map((row) => {
            const open = openId === row.id;
            const value = drafts[row.id] ?? JSON.parse(row.data || "{}");
            const dirty = drafts[row.id] !== undefined;
            return (
              <div key={row.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : row.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gold/5"
                >
                  <span className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink">
                    {row.key}
                    {dirty && <span className="ml-2 text-gold">● unsaved</span>}
                  </span>
                  <span className="font-mono text-[10px] text-ink-2/60">{open ? "−" : "+"}</span>
                </button>
                {open && (
                  <div className="border-t border-ink/10 bg-white/40 p-5">
                    <JsonEditor
                      value={value}
                      onChange={(v) => setDrafts((d) => ({ ...d, [row.id]: v }))}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                      {dirty && (
                        <AdminButton
                          variant="ghost"
                          onClick={() =>
                            setDrafts((d) => {
                              const next = { ...d };
                              delete next[row.id];
                              return next;
                            })
                          }
                        >
                          Discard
                        </AdminButton>
                      )}
                      <AdminButton
                        variant="gold"
                        disabled={!dirty}
                        busy={savingId === row.id}
                        onClick={() => void save(row)}
                      >
                        Save section
                      </AdminButton>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
