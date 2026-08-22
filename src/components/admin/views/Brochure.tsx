"use client";

/**
 * The e-brochure editor — /admin#/brochure.
 *
 * One page, every section of the brochure on it, in the order a reader meets
 * them. That is a change: this view used to hold only the seven sections that
 * exist nowhere but the brochure — the floor, the shops, the film, the
 * specification, the roof, the builder and the closing — and point at Projects
 * for the other six, which in practice meant a raw JSON box. An editor with a
 * hole in it where the overview, the amenities, the location, the updates and
 * the FAQs should be is not an editor for this document.
 *
 * So it now reads and writes **two** rows:
 *
 *   - `settings.brochure`, which is the brochure's own copy, merged over the
 *     shipped defaults in `src/data/brochureDefaults.ts`; and
 *   - the booking **project**, which is where the sections shared with
 *     /projects/zee99-lifestyle live.
 *
 * Both are behind one Save. Whichever of them is dirty is written, and the
 * shared ones say on their face that they are shared, because the failure mode
 * is someone editing the overview here and expecting the site to keep the old
 * one. The tabs sourced from the project are marked in the rail with a hollow
 * folio; "Restore this tab" only offers itself on the brochure's own, since
 * the project has no shipped defaults to put back.
 *
 * The rail is also grouped the way the page now branches — the shared spine
 * numbered 01 to 09, and the two lettered halves the reader chooses between —
 * so the client can see the shape of the document they are editing without
 * opening it.
 *
 * There is no seed migration behind the brochure row. Until the client saves
 * once, D1 holds none and both the page and this editor fall back to the
 * shipped copy — so the first save is what creates it.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type ProjectRow, type SettingRow } from "../api";
import { AdminButton, useConfirm, useToast, useUnsavedGuard } from "../ui";
import { MediaPickerModal, type MediaAccept } from "./Media";
import {
  BuilderTab,
  BuildingTab,
  ClosingTab,
  FilmTab,
  PathsTab,
  ResidencesTab,
  SpecTab,
  TypicalFloorTab,
} from "./brochure/sections";
import {
  AmenitiesTab,
  CoverTab,
  FaqsTab,
  LocationTab,
  OverviewTab,
  UpdatesTab,
  type ProjectData,
} from "./brochure/project";
import ShopsTab from "./brochure/shops";
import { BROCHURE_DEFAULTS, type BrochureDoc } from "@/data/brochureDefaults";
import { cn } from "@/lib/utils";

const KEY = "brochure";
const PROJECT_SLUG = "zee99-lifestyle";

/**
 * Tabs in the order the reader meets them, carrying the folio they will see.
 *
 * `group` is the shape of the page: the spine everybody reads, then the two
 * halves only one of which is open at a time. `src` says which row the tab
 * writes — `doc` is the brochure's own, `project` is shared with the site.
 */
const TABS = [
  { id: "cover", no: "—", label: "Cover", group: "spine", src: "project" },
  { id: "overview", no: "01", label: "Overview", group: "spine", src: "project" },
  { id: "paths", no: "02", label: "The choice", group: "spine", src: "doc" },

  { id: "typicalFloor", no: "R1", label: "The floor", group: "homes", src: "doc" },
  { id: "residences", no: "R2", label: "The plans", group: "homes", src: "doc" },
  { id: "spec", no: "R3", label: "Specification", group: "homes", src: "doc" },

  { id: "shopfront", no: "C1", label: "Shops", group: "shops", src: "doc" },

  { id: "film", no: "03", label: "The film", group: "rest", src: "doc" },
  { id: "amenities", no: "04", label: "Amenities", group: "rest", src: "project" },
  { id: "location", no: "05", label: "Location", group: "rest", src: "project" },
  { id: "updates", no: "06", label: "Updates", group: "rest", src: "project" },
  { id: "builder", no: "07", label: "The builder", group: "rest", src: "doc" },
  { id: "faqs", no: "08", label: "FAQs", group: "rest", src: "project" },
  { id: "building", no: "09", label: "The building", group: "rest", src: "doc" },
  { id: "closing", no: "—", label: "Closing", group: "rest", src: "doc" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type Group = (typeof TABS)[number]["group"];

const GROUPS: { id: Group; label: string }[] = [
  { id: "spine", label: "Everyone" },
  { id: "homes", label: "If they pick apartments" },
  { id: "shops", label: "If they pick shops" },
  { id: "rest", label: "Everyone, again" },
];

/** Which tabs "Restore this tab" can act on — the ones with shipped defaults. */
const DOC_KEYS = new Set<string>(Object.keys(BROCHURE_DEFAULTS));

type PickRequest = { accept: MediaAccept; onPick: (url: string) => void };

/** The stored row over the shipped defaults, block by block — the same merge
 *  `src/data/brochure.ts` does, so the editor shows what the page shows. */
function hydrate(stored: Partial<Record<keyof BrochureDoc, unknown>>): BrochureDoc {
  const out = {} as BrochureDoc;
  for (const key of Object.keys(BROCHURE_DEFAULTS) as (keyof BrochureDoc)[]) {
    Object.assign(out, {
      [key]: { ...BROCHURE_DEFAULTS[key], ...((stored[key] as object) ?? {}) },
    });
  }
  return out;
}

export default function BrochureView({ nav }: { nav: (hash: string) => void }) {
  const [doc, setDoc] = useState<BrochureDoc | null>(null);
  const [docInitial, setDocInitial] = useState("");

  // The project row is loaded whole and saved whole: this view only edits some
  // of its keys, and writing back a subset would drop the units.
  const [row, setRow] = useState<ProjectRow | null>(null);
  const [data, setData] = useState<ProjectData | null>(null);
  const [dataInitial, setDataInitial] = useState("");

  const [tab, setTab] = useState<TabId>("cover");
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<PickRequest | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    let cancelled = false;
    api
      .get<SettingRow[]>("/admin/settings")
      .then((rows) => {
        if (cancelled) return;
        const found = rows.find((r) => r.key === KEY);
        let stored: Partial<Record<keyof BrochureDoc, unknown>> = {};
        try {
          stored = found ? JSON.parse(found.data || "{}") : {};
        } catch {
          toast("err", "The saved brochure row is not valid JSON — showing the shipped copy.");
        }
        const next = hydrate(stored);
        setDoc(next);
        setDocInitial(JSON.stringify(next));
      })
      .catch((e) => !cancelled && toast("err", (e as Error).message));
    return () => {
      cancelled = true;
    };
  }, [toast]);

  // The brochure route names one building explicitly, so its editor must do
  // the same. Picking the first booking row would silently redirect these
  // shared edits if another project became bookable later.
  useEffect(() => {
    let cancelled = false;
    api
      .get<{ id: number; slug: string; status: string }[]>("/admin/projects")
      .then((rows) => {
        const project = rows.find((r) => r.slug === PROJECT_SLUG);
        if (!project) throw new Error(`The ${PROJECT_SLUG} project is missing.`);
        return api.get<ProjectRow>(`/admin/projects/${project.id}`);
      })
      .then((r) => {
        if (cancelled) return;
        const d = JSON.parse(r.data || "{}") as ProjectData;
        setRow(r);
        setData(d);
        setDataInitial(JSON.stringify(d));
      })
      .catch((e) => !cancelled && toast("err", (e as Error).message));
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const docDirty = doc !== null && JSON.stringify(doc) !== docInitial;
  const dataDirty = data !== null && JSON.stringify(data) !== dataInitial;
  const dirty = docDirty || dataDirty;
  useUnsavedGuard(dirty);

  /** Patch one block of the brochure row. Every tab gets this bound to its key. */
  const patch = useCallback(
    <K extends keyof BrochureDoc>(key: K) =>
      (fn: (block: BrochureDoc[K]) => BrochureDoc[K]) =>
        setDoc((d) => (d === null ? d : { ...d, [key]: fn(structuredClone(d[key])) })),
    [],
  );

  const patches = useMemo(
    () => ({
      paths: patch("paths"),
      typicalFloor: patch("typicalFloor"),
      residences: patch("residences"),
      spec: patch("spec"),
      building: patch("building"),
      builder: patch("builder"),
      film: patch("film"),
      shopfront: patch("shopfront"),
      closing: patch("closing"),
    }),
    [patch],
  );

  /** Patch the project row. One function for all six shared tabs. */
  const patchProject = useCallback(
    (fn: (d: ProjectData) => ProjectData) => setData((d) => (d === null ? d : fn(structuredClone(d)))),
    [],
  );

  const pickImage = useCallback(
    (set: (url: string) => void) => setPicker({ accept: "image", onPick: set }),
    [],
  );

  const save = async () => {
    if (doc) {
      const bad = doc.shopfront.floors.flatMap((f) => f.units.filter((u) => !u.id.trim()));
      if (bad.length)
        return toast("err", `${bad.length} unit${bad.length > 1 ? "s have" : " has"} no ID.`);
      const ids = doc.shopfront.floors.flatMap((f) => f.units.map((u) => u.id));
      const dupe = ids.find((v, i) => ids.indexOf(v) !== i);
      if (dupe) return toast("err", `Two units share the ID “${dupe}”. Markers key off the ID.`);
    }

    setSaving(true);
    try {
      // Sequential, not parallel: two writes that half-succeed are worse than
      // one that fails, and the second is only worth attempting if the first
      // landed.
      if (docDirty && doc) {
        await api.put(`/admin/settings/${KEY}`, { data: doc });
        setDocInitial(JSON.stringify(doc));
      }
      if (dataDirty && data && row) {
        await api.put(`/admin/projects/${row.id}`, {
          slug: row.slug,
          status: row.status,
          sort_order: row.sort_order,
          data,
          seo: JSON.parse(row.seo || "{}"),
        });
        setDataInitial(JSON.stringify(data));
      }
      toast("ok", "Brochure saved. Publish from the dashboard to push it live.");
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const current = TABS.find((t) => t.id === tab)!;
  const restorable = current.src === "doc" && DOC_KEYS.has(tab);

  const restore = () => {
    if (!restorable) return;
    const key = tab as keyof BrochureDoc;
    if (!confirm(`Put the shipped copy back into “${current.label}”? Your edits to this tab are lost.`))
      return;
    setDoc((d) => (d === null ? d : { ...d, [key]: structuredClone(BROCHURE_DEFAULTS[key]) }));
  };

  const loading = doc === null || data === null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="font-display text-[1.8rem] font-[400] text-ink">E-brochure</h2>
          {dirty && (
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold">Unsaved</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/zee99lifestyle-e-brochure"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-2 hover:text-gold"
          >
            Open the brochure ↗
          </a>
          <AdminButton variant="gold" busy={saving} disabled={!dirty} onClick={() => void save()}>
            Save brochure
          </AdminButton>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border border-ink/15 bg-paper-2/40 px-5 py-3.5">
        <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-2">
          Every section of the brochure is here, in the order it is read. Tabs marked{" "}
          <span className="font-mono text-[11px] text-gold">◇</span> are shared with the project
          page and change in both places at once; the prices and payment schedules behind the
          three plans and the shop ledger have their own editors.
        </p>
        <div className="flex flex-wrap gap-2">
          <AdminButton variant="outline" onClick={() => nav("#/payment")}>
            Payment
          </AdminButton>
          <AdminButton variant="outline" onClick={() => nav("#/projects")}>
            Projects
          </AdminButton>
        </div>
      </div>

      {/* Tabs, grouped the way the page branches. The folio is the number or
          letter printed beside the section, so "the client rang about R2" lands
          somewhere. */}
      <div className="mb-6 border-b border-ink/12 pb-3">
        <div className="flex flex-wrap items-start gap-x-5 gap-y-4">
          {GROUPS.map((g) => (
            <div key={g.id} className="flex flex-col gap-2">
              <p className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-ink-2/60">
                {g.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {TABS.filter((t) => t.group === g.id).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    title={t.src === "project" ? "Shared with the project page" : undefined}
                    className={cn(
                      "flex items-baseline gap-2 border px-3.5 py-2.5 transition-colors",
                      tab === t.id
                        ? "border-ink bg-ink text-paper"
                        : "border-ink/15 text-ink-2 hover:border-ink/40 hover:text-ink",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[9px] tracking-[0.16em]",
                        tab === t.id ? "text-gold-3" : "text-gold",
                      )}
                    >
                      {t.no}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em]">
                      {t.label}
                    </span>
                    {t.src === "project" && (
                      <span
                        aria-hidden
                        className={cn(
                          "font-mono text-[9px]",
                          tab === t.id ? "text-paper/50" : "text-ink-2/45",
                        )}
                      >
                        ◇
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <AdminButton
            variant="ghost"
            className="ml-auto self-end"
            disabled={!restorable}
            onClick={restore}
          >
            {restorable ? "Restore this tab" : "No shipped copy"}
          </AdminButton>
        </div>
      </div>

      {loading ? (
        <p className="text-[13px] text-ink-2">Loading…</p>
      ) : (
        <>
          {tab === "cover" && (
            <CoverTab value={data} patch={patchProject} onPickImage={pickImage} />
          )}
          {tab === "overview" && (
            <OverviewTab value={data} patch={patchProject} onPickImage={pickImage} />
          )}
          {tab === "paths" && <PathsTab value={doc.paths} patch={patches.paths} />}
          {tab === "typicalFloor" && (
            <TypicalFloorTab
              value={doc.typicalFloor}
              patch={patches.typicalFloor}
              onPickImage={pickImage}
            />
          )}
          {tab === "residences" && (
            <ResidencesTab value={doc.residences} patch={patches.residences} nav={nav} />
          )}
          {tab === "spec" && <SpecTab value={doc.spec} patch={patches.spec} />}
          {tab === "shopfront" && (
            <ShopsTab value={doc.shopfront} patch={patches.shopfront} onPickImage={pickImage} />
          )}
          {tab === "film" && (
            <FilmTab
              value={doc.film}
              patch={patches.film}
              onPick={(accept, set) => setPicker({ accept, onPick: set })}
            />
          )}
          {tab === "amenities" && (
            <AmenitiesTab value={data} patch={patchProject} onPickImage={pickImage} />
          )}
          {tab === "location" && <LocationTab value={data} patch={patchProject} />}
          {tab === "updates" && (
            <UpdatesTab value={data} patch={patchProject} onPickImage={pickImage} />
          )}
          {tab === "builder" && <BuilderTab value={doc.builder} patch={patches.builder} />}
          {tab === "faqs" && <FaqsTab value={data} patch={patchProject} />}
          {tab === "building" && (
            <BuildingTab value={doc.building} patch={patches.building} onPickImage={pickImage} />
          )}
          {tab === "closing" && <ClosingTab value={doc.closing} patch={patches.closing} />}
        </>
      )}

      {/* Sticky save rail — every tab here is longer than a screen. */}
      {dirty && (
        <div className="sticky bottom-4 z-40 mt-10 flex flex-wrap items-center justify-between gap-4 border border-gold-2/60 bg-paper/95 px-5 py-3 shadow-[0_10px_40px_rgba(23,20,16,0.12)] backdrop-blur">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2">
            Unsaved changes
            {docDirty && dataDirty && " · brochure and project"}
            {docDirty && !dataDirty && " · brochure"}
            {!docDirty && dataDirty && " · project"}
          </p>
          <div className="flex items-center gap-2">
            <AdminButton
              variant="ghost"
              onClick={() => {
                if (!confirm("Discard every change since the last save?")) return;
                setDoc(JSON.parse(docInitial) as BrochureDoc);
                setData(JSON.parse(dataInitial) as ProjectData);
              }}
            >
              Discard
            </AdminButton>
            <AdminButton variant="gold" busy={saving} onClick={() => void save()}>
              Save brochure
            </AdminButton>
          </div>
        </div>
      )}

      <MediaPickerModal
        open={picker !== null}
        accept={picker?.accept ?? "image"}
        onClose={() => setPicker(null)}
        onPick={(m) => picker?.onPick(m.url)}
      />
    </div>
  );
}
