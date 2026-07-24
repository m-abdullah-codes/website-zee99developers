"use client";

import { useEffect, useState } from "react";
import { api, type ProjectRow } from "../api";
import {
  AdminButton,
  Field,
  Select,
  StatusBadge,
  TextInput,
  useConfirm,
  useToast,
  useUnsavedFieldToast,
  useUnsavedGuard,
} from "../ui";
import JsonEditor, { type Json } from "../JsonEditor";

type ProjectListRow = {
  id: number;
  slug: string;
  sort_order: number;
  status: string;
  name: string | null;
  updated_at: string;
};

export function ProjectsList({ nav }: { nav: (hash: string) => void }) {
  const [rows, setRows] = useState<ProjectListRow[] | null>(null);
  const toast = useToast();

  useEffect(() => {
    api
      .get<ProjectListRow[]>("/admin/projects")
      .then(setRows)
      .catch((e) => toast("err", e.message));
  }, [toast]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-[1.8rem] font-[400] text-ink">Projects</h2>
        <AdminButton variant="gold" onClick={() => nav("#/projects/new")}>
          + New project
        </AdminButton>
      </div>
      {rows === null ? (
        <p className="text-[13px] text-ink-2">Loading…</p>
      ) : (
        <div className="divide-y divide-ink/10 border border-ink/15">
          {rows.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => nav(`#/projects/${p.id}`)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gold/5"
            >
              <span>
                <span className="font-display text-[1.15rem] text-ink">{p.name ?? p.slug}</span>
                <span className="ml-3 font-mono text-[10px] text-ink-2/70">/{p.slug}</span>
              </span>
              <span className="flex items-center gap-4">
                <span className="font-mono text-[10px] text-ink-2/70">#{p.sort_order}</span>
                <StatusBadge status={p.status} />
              </span>
            </button>
          ))}
        </div>
      )}
      <p className="mt-4 text-[12px] leading-relaxed text-ink-2">
        The booking project powers the calculator, payment visualizer, and “now booking” CTAs.
        The construction project with a price history powers the track-record chart.
      </p>
    </div>
  );
}

const NEW_PROJECT_DATA = {
  name: "",
  statusLabel: "Now Booking",
  location: "",
  short: "",
  figures: ["", ""],
  cardImage: "",
  heroImage: "",
  heroLine: "",
  overview: "",
  facts: [{ k: "", v: "" }],
};

export function ProjectEdit({ id, nav }: { id: string; nav: (hash: string) => void }) {
  const isNew = id === "new";
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<ProjectRow["status"]>("booking");
  const [sortOrder, setSortOrder] = useState(99);
  const [data, setData] = useState<Json | null>(isNew ? NEW_PROJECT_DATA : null);
  const [seo, setSeo] = useState<Json>({});
  const [initial, setInitial] = useState(() =>
    isNew ? JSON.stringify([NEW_PROJECT_DATA, {}, "", "booking", 99]) : "",
  );
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    if (isNew) return;
    api
      .get<ProjectRow>(`/admin/projects/${id}`)
      .then((r) => {
        setSlug(r.slug);
        setStatus(r.status);
        setSortOrder(r.sort_order);
        const d = JSON.parse(r.data || "{}");
        const s = JSON.parse(r.seo || "{}");
        setData(d);
        setSeo(s);
        setInitial(JSON.stringify([d, s, r.slug, r.status, r.sort_order]));
      })
      .catch((e) => toast("err", e.message));
  }, [id, isNew, toast]);

  const dirty =
    data !== null && JSON.stringify([data, seo, slug, status, sortOrder]) !== initial;
  useUnsavedGuard(dirty);
  const onFieldBlur = useUnsavedFieldToast(dirty);

  if (data === null) return <p className="text-[13px] text-ink-2">Loading…</p>;

  const save = async () => {
    if (!slug) return toast("err", "Slug is required.");
    setSaving(true);
    const body = { slug, status, sort_order: sortOrder, data, seo };
    try {
      if (isNew) {
        const r = await api.post<{ id: number }>("/admin/projects", body);
        toast("ok", "Project created.");
        nav(`#/projects/${r.id}`);
      } else {
        await api.put(`/admin/projects/${id}`, body);
        setInitial(JSON.stringify([data, seo, slug, status, sortOrder]));
        toast("ok", "Saved. Publish from the dashboard to rebuild the site.");
      }
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!confirm("Delete this project permanently? Its detail page disappears on next publish."))
      return;
    try {
      await api.del(`/admin/projects/${id}`);
      toast("ok", "Project deleted.");
      nav("#/projects");
    } catch (e) {
      toast("err", (e as Error).message);
    }
  };

  return (
    <div onBlur={onFieldBlur}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (dirty && !confirm("Discard unsaved changes?")) return;
              nav("#/projects");
            }}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2 hover:text-ink"
          >
            ← Projects
          </button>
          <h2 className="font-display text-[1.5rem] font-[400] text-ink">
            {isNew ? "New project" : slug}
          </h2>
          {dirty && (
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold">
              Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <AdminButton variant="danger" onClick={() => void del()}>
              Delete
            </AdminButton>
          )}
          <AdminButton onClick={() => void save()} busy={saving} variant="gold">
            Save project
          </AdminButton>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Field label="Slug" hint="URL: /projects/<slug>">
          <TextInput value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as ProjectRow["status"])}>
            <option value="booking">booking</option>
            <option value="construction">construction</option>
            <option value="delivered">delivered</option>
          </Select>
        </Field>
        <Field label="Sort order" hint="Lower shows first">
          <TextInput
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
          />
        </Field>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
            Project content
          </p>
          <div className="border border-ink/15 p-5">
            <JsonEditor value={data} onChange={setData} />
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
            SEO overrides
          </p>
          <div className="border border-ink/15 p-5">
            <JsonEditor
              value={
                seo && typeof seo === "object" && !Array.isArray(seo) && Object.keys(seo).length
                  ? seo
                  : { title: "", description: "", ogImage: "", canonical: "" }
              }
              onChange={setSeo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
