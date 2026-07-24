"use client";

import { useEffect, useState } from "react";
import { api, type SettingRow } from "../api";
import { AdminButton, useToast, useUnsavedFieldToast, useUnsavedGuard } from "../ui";
import JsonEditor, { type Json } from "../JsonEditor";
import { cn } from "@/lib/utils";

const LABELS: Record<string, { title: string; hint: string }> = {
  site: {
    title: "Site & contact",
    hint: "Name, phone, WhatsApp number and message templates, email, address. Used across the whole site.",
  },
  stats: { title: "Stat band", hint: "The four counters on the home page." },
  rates: {
    title: "FX rates",
    hint: "PKR per unit of each currency — update monthly; drives the overseas pricing.",
  },
  seo: {
    title: "Global SEO",
    hint: "Default title/description/OG image; per-page rows can override under SEO.",
  },
};

export default function SettingsView() {
  const [rows, setRows] = useState<SettingRow[] | null>(null);
  const [active, setActive] = useState("site");
  const [draft, setDraft] = useState<Json | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api
      .get<SettingRow[]>("/admin/settings")
      .then(setRows)
      .catch((e) => toast("err", e.message));
  }, [toast]);

  const row = rows?.find((r) => r.key === active);
  const value = draft ?? (row ? JSON.parse(row.data || "{}") : null);
  useUnsavedGuard(draft !== null);
  const onFieldBlur = useUnsavedFieldToast(draft !== null);

  const save = async () => {
    if (draft === null || !row) return;
    setSaving(true);
    try {
      await api.put(`/admin/settings/${row.key}`, { data: draft });
      setRows((prev) =>
        prev ? prev.map((r) => (r.key === row.key ? { ...r, data: JSON.stringify(draft) } : r)) : prev,
      );
      setDraft(null);
      toast("ok", `${LABELS[row.key]?.title ?? row.key} saved. Publish to rebuild the site.`);
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onBlur={onFieldBlur}>
      <h2 className="mb-6 font-display text-[1.8rem] font-[400] text-ink">Settings</h2>
      <div className="mb-6 flex flex-wrap gap-2">
        {(rows ?? []).map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => {
              if (draft !== null && !window.confirm("Discard unsaved changes?")) return;
              setDraft(null);
              setActive(r.key);
            }}
            className={cn(
              "rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
              active === r.key
                ? "border-ink bg-ink text-paper"
                : "border-ink/20 text-ink-2 hover:border-ink/50",
            )}
          >
            {LABELS[r.key]?.title ?? r.key}
          </button>
        ))}
      </div>

      {row && value !== null ? (
        <div className="max-w-3xl">
          <p className="mb-4 text-[12.5px] text-ink-2">{LABELS[row.key]?.hint}</p>
          <div className="border border-ink/15 p-5">
            <JsonEditor value={value} onChange={setDraft} />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            {draft !== null && (
              <AdminButton variant="ghost" onClick={() => setDraft(null)}>
                Discard
              </AdminButton>
            )}
            <AdminButton variant="gold" disabled={draft === null} busy={saving} onClick={() => void save()}>
              Save settings
            </AdminButton>
          </div>
        </div>
      ) : (
        <p className="text-[13px] text-ink-2">Loading…</p>
      )}
    </div>
  );
}
