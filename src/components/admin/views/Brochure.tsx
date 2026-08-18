"use client";

/**
 * The e-brochure editor — /admin#/brochure.
 *
 * Everything the full brochure says that is not already the project itself
 * lives in one `brochure` row in `settings`: the typical floor, the
 * specification, the roof and the amenity split, the builder's record, the
 * film, the shop ledger with its drawings and markers, and the closing page. The residences, the prices, the
 * amenities grid, the location and the FAQs come from the project, so this view
 * points at Projects rather than duplicating them — two editors writing the
 * same figure is how the two stop agreeing.
 *
 * There is no seed migration behind this. Until the client saves once, D1 holds
 * no `brochure` row and both the page and this editor fall back to the shipped
 * copy in `src/data/brochureDefaults.ts` — so the first save is what creates
 * the row, and "Restore this tab" simply puts the shipped block back.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type SettingRow } from "../api";
import { AdminButton, useConfirm, useToast, useUnsavedGuard } from "../ui";
import { MediaPickerModal, type MediaAccept } from "./Media";
import {
  BuilderTab,
  BuildingTab,
  ClosingTab,
  FilmTab,
  SpecTab,
  TypicalFloorTab,
} from "./brochure/sections";
import ShopsTab from "./brochure/shops";
import { BROCHURE_DEFAULTS, type BrochureDoc } from "@/data/brochureDefaults";
import { cn } from "@/lib/utils";

const KEY = "brochure";

/** Tabs in the order the reader meets them, carrying the folio they will see. */
const TABS = [
  { id: "typicalFloor", no: "02", label: "The floor" },
  { id: "shopfront", no: "04", label: "Shops" },
  { id: "film", no: "05", label: "The film" },
  { id: "spec", no: "06", label: "Specification" },
  { id: "building", no: "08", label: "The building" },
  { id: "builder", no: "11", label: "The builder" },
  { id: "closing", no: "—", label: "Closing" },
] as const;

type TabId = (typeof TABS)[number]["id"];

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
  const [initial, setInitial] = useState("");
  const [tab, setTab] = useState<TabId>("typicalFloor");
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
        const row = rows.find((r) => r.key === KEY);
        let stored: Partial<Record<keyof BrochureDoc, unknown>> = {};
        try {
          stored = row ? JSON.parse(row.data || "{}") : {};
        } catch {
          toast("err", "The saved brochure row is not valid JSON — showing the shipped copy.");
        }
        const next = hydrate(stored);
        setDoc(next);
        setInitial(JSON.stringify(next));
      })
      .catch((e) => !cancelled && toast("err", (e as Error).message));
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const dirty = doc !== null && JSON.stringify(doc) !== initial;
  useUnsavedGuard(dirty);

  /** Patch one block. Every tab gets this bound to its own key. */
  const patch = useCallback(
    <K extends keyof BrochureDoc>(key: K) =>
      (fn: (block: BrochureDoc[K]) => BrochureDoc[K]) =>
        setDoc((d) => (d === null ? d : { ...d, [key]: fn(structuredClone(d[key])) })),
    [],
  );

  const patches = useMemo(
    () => ({
      typicalFloor: patch("typicalFloor"),
      spec: patch("spec"),
      building: patch("building"),
      builder: patch("builder"),
      film: patch("film"),
      shopfront: patch("shopfront"),
      closing: patch("closing"),
    }),
    [patch],
  );

  const pickImage = useCallback(
    (set: (url: string) => void) => setPicker({ accept: "image", onPick: set }),
    [],
  );

  const save = async () => {
    if (!doc) return;
    const bad = doc.shopfront.floors.flatMap((f) => f.units.filter((u) => !u.id.trim()));
    if (bad.length) return toast("err", `${bad.length} unit${bad.length > 1 ? "s have" : " has"} no ID.`);
    const ids = doc.shopfront.floors.flatMap((f) => f.units.map((u) => u.id));
    const dupe = ids.find((v, i) => ids.indexOf(v) !== i);
    if (dupe) return toast("err", `Two units share the ID “${dupe}”. Markers key off the ID.`);

    setSaving(true);
    try {
      await api.put(`/admin/settings/${KEY}`, { data: doc });
      setInitial(JSON.stringify(doc));
      toast("ok", "Brochure saved. Publish from the dashboard to push it live.");
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const restore = () => {
    const key = tab as keyof BrochureDoc;
    const label = TABS.find((t) => t.id === tab)?.label ?? tab;
    if (!confirm(`Put the shipped copy back into “${label}”? Your edits to this tab are lost.`)) return;
    setDoc((d) => (d === null ? d : { ...d, [key]: structuredClone(BROCHURE_DEFAULTS[key]) }));
  };

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
          This edits the long e-brochure only — the sections that exist nowhere else. The
          residences and their payment plans, the amenity tiles, the location, the updates and
          the FAQs on that page are the project&rsquo;s own, so they are edited under Projects
          and Payment and change in both places at once.
        </p>
        <div className="flex flex-wrap gap-2">
          <AdminButton variant="outline" onClick={() => nav("#/projects")}>
            Projects
          </AdminButton>
          <AdminButton variant="outline" onClick={() => nav("#/payment")}>
            Payment
          </AdminButton>
        </div>
      </div>

      {/* Tabs. The folio is the number printed beside the section on the page,
          so "the client rang about section 08" lands somewhere. */}
      <div className="mb-6 flex flex-wrap items-stretch gap-2 border-b border-ink/12 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-baseline gap-2 border px-4 py-2.5 transition-colors",
              tab === t.id
                ? "border-ink bg-ink text-paper"
                : "border-ink/15 text-ink-2 hover:border-ink/40 hover:text-ink",
            )}
          >
            <span className={cn("font-mono text-[9px] tracking-[0.16em]", tab === t.id ? "text-gold-3" : "text-gold")}>
              {t.no}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em]">{t.label}</span>
          </button>
        ))}
        <AdminButton variant="ghost" className="ml-auto" onClick={restore}>
          Restore this tab
        </AdminButton>
      </div>

      {doc === null ? (
        <p className="text-[13px] text-ink-2">Loading…</p>
      ) : (
        <>
          {tab === "typicalFloor" && (
            <TypicalFloorTab
              value={doc.typicalFloor}
              patch={patches.typicalFloor}
              onPickImage={pickImage}
            />
          )}
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
          {tab === "spec" && <SpecTab value={doc.spec} patch={patches.spec} />}
          {tab === "building" && (
            <BuildingTab value={doc.building} patch={patches.building} onPickImage={pickImage} />
          )}
          {tab === "builder" && <BuilderTab value={doc.builder} patch={patches.builder} />}
          {tab === "closing" && <ClosingTab value={doc.closing} patch={patches.closing} />}
        </>
      )}

      {/* Sticky save rail — every tab here is longer than a screen. */}
      {dirty && (
        <div className="sticky bottom-4 z-40 mt-10 flex items-center justify-between gap-4 border border-gold-2/60 bg-paper/95 px-5 py-3 shadow-[0_10px_40px_rgba(23,20,16,0.12)] backdrop-blur">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2">
            Unsaved changes
          </p>
          <div className="flex items-center gap-2">
            <AdminButton
              variant="ghost"
              onClick={() => {
                if (!confirm("Discard every change since the last save?")) return;
                setDoc(JSON.parse(initial) as BrochureDoc);
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
