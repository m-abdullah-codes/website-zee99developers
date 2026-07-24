"use client";

import { useEffect, useState } from "react";
import { api, type PageSeoRow } from "../api";
import {
  AdminButton,
  Field,
  TextArea,
  TextInput,
  useToast,
  useUnsavedFieldToast,
  useUnsavedGuard,
} from "../ui";

type Draft = Omit<PageSeoRow, "updated_at">;

export default function SeoView() {
  const [rows, setRows] = useState<PageSeoRow[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingPath, setSavingPath] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    api
      .get<PageSeoRow[]>("/admin/page-seo")
      .then(setRows)
      .catch((e) => toast("err", e.message));
  }, [toast]);

  useUnsavedGuard(Object.keys(drafts).length > 0);
  const onFieldBlur = useUnsavedFieldToast(Object.keys(drafts).length > 0);

  const get = (r: PageSeoRow): Draft => drafts[r.path] ?? r;
  const edit = (r: PageSeoRow, patch: Partial<Draft>) =>
    setDrafts((d) => ({ ...d, [r.path]: { ...get(r), ...patch } }));

  const save = async (r: PageSeoRow) => {
    const d = drafts[r.path];
    if (!d) return;
    setSavingPath(r.path);
    try {
      await api.put("/admin/page-seo", d);
      setRows((prev) =>
        prev ? prev.map((x) => (x.path === r.path ? { ...x, ...d } : x)) : prev,
      );
      setDrafts((d) => {
        const next = { ...d };
        delete next[r.path];
        return next;
      });
      toast("ok", `${r.path} saved. Publish to rebuild.`);
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setSavingPath(null);
    }
  };

  return (
    <div onBlur={onFieldBlur}>
      <h2 className="mb-2 font-display text-[1.8rem] font-[400] text-ink">SEO</h2>
      <p className="mb-6 max-w-2xl text-[12.5px] leading-relaxed text-ink-2">
        Per-page meta for the static pages. Posts and projects carry their own SEO in their
        editors; global defaults live under Settings → Global SEO. Sitemap, robots.txt, and RSS
        regenerate automatically on publish.
      </p>
      {rows === null ? (
        <p className="text-[13px] text-ink-2">Loading…</p>
      ) : (
        <div className="grid gap-5">
          {rows.map((r) => {
            const d = get(r);
            const dirty = drafts[r.path] !== undefined;
            return (
              <fieldset key={r.path} className="border border-ink/15 p-5">
                <legend className="px-2 font-mono text-[11px] tracking-[0.14em] text-ink">
                  {r.path}
                  {dirty && <span className="ml-2 text-gold">● unsaved</span>}
                </legend>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="Title">
                    <TextInput value={d.title} onChange={(e) => edit(r, { title: e.target.value })} />
                  </Field>
                  <Field label="OG image">
                    <TextInput
                      value={d.og_image}
                      placeholder="(global default)"
                      onChange={(e) => edit(r, { og_image: e.target.value })}
                    />
                  </Field>
                  <Field label="Description" className="lg:col-span-2">
                    <TextArea
                      rows={2}
                      value={d.description}
                      onChange={(e) => edit(r, { description: e.target.value })}
                    />
                  </Field>
                  <Field label="Canonical URL">
                    <TextInput
                      value={d.canonical}
                      placeholder="(self)"
                      onChange={(e) => edit(r, { canonical: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="mt-4 flex justify-end">
                  <AdminButton
                    variant="gold"
                    disabled={!dirty}
                    busy={savingPath === r.path}
                    onClick={() => void save(r)}
                  >
                    Save {r.path}
                  </AdminButton>
                </div>
              </fieldset>
            );
          })}
        </div>
      )}
    </div>
  );
}
