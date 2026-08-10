"use client";

// Controls how the payment planner *presents* the numbers — which result rows
// buyers see, what opens first, the wording, and the downloadable PDF. The
// figures themselves live under Payment; this view never touches them.

import { useCallback, useEffect, useState } from "react";
import { api, type ProjectRow } from "../api";
import {
  AdminButton,
  Field,
  Select,
  TextArea,
  TextInput,
  useConfirm,
  useToast,
  useUnsavedGuard,
} from "../ui";
import { MediaPickerModal, type MediaAccept } from "./Media";
import { cn } from "@/lib/utils";
import type { Brochure, PlannerConfig, Unit } from "@/data/projects";
import {
  planConfig,
  planFor,
  plannerRows,
  projectedRange,
  rowVisible,
  unitTotal,
  yieldPct,
} from "@/lib/pricing";
import { fmtInt, pkrCompact, pkrRange } from "@/lib/format";

type ProjectListRow = { id: number; slug: string; status: string; name: string | null };

type PlannerData = {
  units?: Unit[];
  planner?: PlannerConfig;
  brochure?: Brochure;
  plan?: { downOptions?: number[]; handoverMonths?: number };
  appreciation?: { low: number; high: number };
  [k: string]: unknown;
};

type PickRequest = {
  accept: MediaAccept;
  onPick: (m: { url: string; size: number; filename: string }) => void;
};

export default function PlannerView({ nav }: { nav: (hash: string) => void }) {
  const [projects, setProjects] = useState<ProjectListRow[] | null>(null);
  const [id, setId] = useState<number | null>(null);
  const [row, setRow] = useState<ProjectRow | null>(null);
  const [data, setData] = useState<PlannerData | null>(null);
  const [initial, setInitial] = useState("");
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<PickRequest | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    api
      .get<ProjectListRow[]>("/admin/projects")
      .then((rows) => {
        setProjects(rows);
        const booking = rows.find((r) => r.status === "booking") ?? rows[0];
        if (booking) setId(booking.id);
      })
      .catch((e) => toast("err", e.message));
  }, [toast]);

  useEffect(() => {
    if (id === null) return;
    let cancelled = false;
    api
      .get<ProjectRow>(`/admin/projects/${id}`)
      .then((r) => {
        if (cancelled) return;
        const d = JSON.parse(r.data || "{}") as PlannerData;
        setRow(r);
        setData(d);
        setInitial(JSON.stringify(d));
      })
      .catch((e) => !cancelled && toast("err", e.message));
    return () => {
      cancelled = true;
    };
  }, [id, toast]);

  const loaded = data !== null && row?.id === id;
  const dirty = loaded && JSON.stringify(data) !== initial;
  useUnsavedGuard(dirty);

  const patch = useCallback((fn: (d: PlannerData) => PlannerData) => {
    setData((d) => (d === null ? d : fn(structuredClone(d))));
  }, []);

  const setPlanner = useCallback(
    (p: Partial<PlannerConfig>) =>
      patch((d) => ({ ...d, planner: { ...(d.planner ?? {}), ...p } })),
    [patch],
  );

  const save = async () => {
    if (!row || !data) return;
    setSaving(true);
    try {
      await api.put(`/admin/projects/${row.id}`, {
        slug: row.slug,
        status: row.status,
        sort_order: row.sort_order,
        data,
        seo: JSON.parse(row.seo || "{}"),
      });
      setInitial(JSON.stringify(data));
      toast("ok", "Planner saved. Publish from the dashboard to push it live.");
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const units = data?.units ?? [];
  const ui = data?.planner ?? {};
  const rows = plannerRows(units);
  const hidden = new Set(ui.hiddenRows ?? []);

  // Derived inside the updater, not from the render closure — two toggles in
  // the same tick must not collapse into one.
  const toggleRow = (key: string) =>
    patch((d) => {
      const next = new Set(d.planner?.hiddenRows ?? []);
      if (!next.delete(key)) next.add(key);
      return { ...d, planner: { ...(d.planner ?? {}), hiddenRows: [...next] } };
    });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="font-display text-[1.8rem] font-[400] text-ink">Planner</h2>
          {dirty && (
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold">
              Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {projects && projects.length > 1 && (
            <Select
              value={id ?? ""}
              onChange={(e) => {
                if (dirty && !confirm("Discard unsaved changes?")) return;
                setId(Number(e.target.value));
              }}
              className="w-auto"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name ?? p.slug}
                </option>
              ))}
            </Select>
          )}
          <AdminButton variant="gold" busy={saving} disabled={!dirty} onClick={() => void save()}>
            Save planner
          </AdminButton>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border border-ink/15 bg-paper-2/40 px-5 py-3.5">
        <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-2">
          This page controls what the{" "}
          <a
            href="/payment-planner"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline decoration-gold/40 underline-offset-4"
          >
            payment planner
          </a>{" "}
          shows buyers. The prices, instalments and rent figures behind it are edited under
          Payment.
        </p>
        <AdminButton variant="outline" onClick={() => nav("#/payment")}>
          Edit the numbers
        </AdminButton>
      </div>

      {!loaded || data === null ? (
        <p className="text-[13px] text-ink-2">Loading…</p>
      ) : (
        <div className="space-y-10">
          {/* ---------------------------------------------- row visibility */}
          <section className="border border-ink/15">
            <p className="border-b border-ink/10 bg-paper-2/60 px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
              What the results show
            </p>
            <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1fr]">
              <div>
                <p className="mb-3 text-[12.5px] leading-relaxed text-ink-2">
                  Switch a line off to hide it from every buyer. The monthly instalment
                  headline always shows — it is the answer the tool exists to give. On the
                  project page, where the plans are already printed above it, the tool leads
                  with the projection instead and that line is never repeated below.
                </p>
                <ul className="divide-y divide-ink/10 border border-ink/15">
                  {rows.map((r) => {
                    const on = !hidden.has(r.key);
                    return (
                      <li key={r.key} className="flex items-center justify-between gap-4 px-4 py-3">
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-[0.9rem]",
                            on ? "text-ink" : "text-ink-2/60 line-through",
                          )}
                        >
                          {r.label}
                        </span>
                        <Toggle on={on} label={r.label} onChange={() => toggleRow(r.key)} />
                      </li>
                    );
                  })}
                </ul>
                {hidden.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setPlanner({ hiddenRows: [] })}
                    className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-2 underline decoration-ink/25 underline-offset-4 hover:text-ink"
                  >
                    Show every line again
                  </button>
                )}
              </div>

              <PlannerPreview data={data} />
            </div>
          </section>

          {/* ------------------------------------------------------ wording */}
          <section className="border border-ink/15">
            <p className="border-b border-ink/10 bg-paper-2/60 px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
              Behaviour &amp; wording
            </p>
            <div className="grid gap-5 p-5 md:grid-cols-2">
              <Field label="Opens on" hint="Which side of the tool a visitor lands on.">
                <Select
                  value={ui.defaultMode ?? "budget"}
                  onChange={(e) =>
                    setPlanner({ defaultMode: e.target.value as "unit" | "budget" })
                  }
                >
                  <option value="budget">Start from budget</option>
                  <option value="unit">Pick a unit</option>
                </Select>
              </Field>
              <Field label="Unit shown first">
                <Select
                  value={ui.defaultUnit ?? ""}
                  onChange={(e) => setPlanner({ defaultUnit: e.target.value })}
                >
                  <option value="">First in the list</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.id}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Rental yield label"
                hint="The client&rsquo;s rents are for furnished units — say so here."
              >
                <TextInput
                  value={ui.yieldLabel ?? ""}
                  placeholder="Est. rental yield (furnished)"
                  onChange={(e) => setPlanner({ yieldLabel: e.target.value })}
                />
              </Field>
              <Field label="Small print" hint="Leave empty for the standard disclaimer.">
                <TextArea
                  rows={3}
                  value={ui.disclaimer ?? ""}
                  placeholder="Projections are based on Zee99 Arcade’s actual price history…"
                  onChange={(e) => setPlanner({ disclaimer: e.target.value })}
                />
              </Field>
            </div>
          </section>

          {/* ------------------------------------------------------- rents */}
          <RentPanel units={units} patch={patch} />

          {/* ---------------------------------------------------- brochure */}
          <BrochurePanel
            brochure={data.brochure}
            patch={patch}
            onPickPdf={(cb) => setPicker({ accept: "pdf", onPick: cb })}
          />
        </div>
      )}

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
                setData(JSON.parse(initial) as PlannerData);
              }}
            >
              Discard
            </AdminButton>
            <AdminButton variant="gold" busy={saving} onClick={() => void save()}>
              Save planner
            </AdminButton>
          </div>
        </div>
      )}

      <MediaPickerModal
        open={picker !== null}
        accept={picker?.accept ?? "pdf"}
        onClose={() => setPicker(null)}
        onPick={(m) => picker?.onPick(m)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ atoms */

function Toggle({
  on,
  label,
  onChange,
}: {
  on: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`Show “${label}” on the planner`}
      onClick={onChange}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200",
        on ? "border-gold-2 bg-gold/70" : "border-ink/25 bg-ink/10",
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] h-[14px] w-[14px] rounded-full bg-paper shadow-sm transition-[left] duration-200",
          on ? "left-[18px]" : "left-[2px]",
        )}
      />
    </button>
  );
}

/* ---------------------------------------------------------------- preview */

/** A faithful miniature of the planner's results panel, live as you toggle. */
function PlannerPreview({ data }: { data: PlannerData }) {
  const units = data.units ?? [];
  const ui = data.planner ?? {};
  const cfg = planConfig({ plan: data.plan });
  const unit =
    units.find((u) => u.id === ui.defaultUnit) ?? units[0] ?? null;
  if (!unit) return null;

  const pct = cfg.downOptions[cfg.downOptions.length - 1];
  const plan = planFor(unit, pct, data.plan);
  const band = data.appreciation ?? { low: 0.12, high: 0.2 };
  const range = projectedRange(plan.total, plan.handoverMonths, band);
  const show = (k: string) => rowVisible(ui, k);

  const lines: [string, string][] = [];
  if (show("down")) lines.push(["Down payment, at booking", `₨ ${fmtInt(plan.down)}`]);
  plan.milestones.forEach((m) => {
    const label = m.label || "Milestone payment";
    if (!show(`milestone:${label}`)) return;
    lines.push([
      m.count > 1 ? `${label} (×${m.count})` : label,
      `₨ ${fmtInt(m.amount * Math.max(1, m.count))}`,
    ]);
  });
  if (show("total")) lines.push(["Total investment", `₨ ${pkrCompact(plan.total)}`]);
  if (show("projected"))
    lines.push(["Projected value at handover", `₨ ${pkrRange(range.low, range.high)}`]);
  if (show("yield"))
    lines.push([
      ui.yieldLabel || "Est. rental yield",
      `${yieldPct(unit.rentEst, unitTotal(unit)).toFixed(1)}% · ₨ ${fmtInt(unit.rentEst)}/mo`,
    ]);

  return (
    <div className="border border-ink/15 bg-paper-2/45 p-5">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-2">
        Live preview · {unit.name} at {pct}% down
      </p>
      <p className="mt-4 font-display text-[2rem] font-[380] leading-none text-ink">
        ₨ {fmtInt(plan.monthly)}
        <span className="ml-2 font-sans text-[0.8rem] font-normal text-ink-2">
          / month × {plan.months}
        </span>
      </p>
      <dl className="mt-5 border-t border-ink/10">
        {lines.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 border-b border-ink/10 py-2.5">
            <dt className="text-[0.82rem] text-ink-2">{k}</dt>
            <dd className="shrink-0 font-mono text-[11.5px] text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      {lines.length === 0 && (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-red-900">
          Every line is hidden — buyers see only the monthly figure.
        </p>
      )}
      {show("schedule") && (
        <p className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-2">
          See the full schedule +
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ rents */

/** Rent per unit, with the yield it produces — the two always agree. */
function RentPanel({
  units,
  patch,
}: {
  units: Unit[];
  patch: (fn: (d: PlannerData) => PlannerData) => void;
}) {
  const setRent = (i: number, v: number) =>
    patch((d) => ({
      ...d,
      units: (d.units ?? []).map((u, j) => (j === i ? { ...u, rentEst: v } : u)),
    }));

  return (
    <section className="border border-ink/15">
      <p className="border-b border-ink/10 bg-paper-2/60 px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
        Rents &amp; yields
      </p>
      <div className="p-5">
        <p className="mb-4 max-w-2xl text-[12.5px] leading-relaxed text-ink-2">
          Set the monthly rent you expect each unit to fetch. The yield is worked out from
          it against the total price, so the percentage and the rupee figure on the planner
          can never disagree.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink/15 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-2">
                <th className="py-2.5 pr-4 font-normal">Unit</th>
                <th className="py-2.5 pr-4 font-normal">Total price</th>
                <th className="py-2.5 pr-4 font-normal">Rent / month</th>
                <th className="py-2.5 text-right font-normal">Gross yield</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u, i) => {
                const total = unitTotal(u);
                const y = yieldPct(u.rentEst, total);
                return (
                  <tr key={i} className="border-b border-ink/10">
                    <td className="py-3 pr-4 text-[0.9rem] text-ink">
                      {u.name || u.id}
                      {u.area > 0 && (
                        <span className="ml-2 font-mono text-[9.5px] text-ink-2">
                          {u.area} sqft
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-mono text-[12px] text-ink-2">
                      ₨ {pkrCompact(total)}
                    </td>
                    <td className="w-44 py-3 pr-4">
                      <span className="relative block">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-ink-2/70">
                          ₨
                        </span>
                        <input
                          inputMode="numeric"
                          value={u.rentEst ? u.rentEst.toLocaleString("en-US") : ""}
                          onChange={(e) =>
                            setRent(i, Number(e.target.value.replace(/[^\d]/g, "")) || 0)
                          }
                          className="w-full border border-ink/20 bg-white/60 py-2 pl-8 pr-3 text-right font-mono text-[13px] tabular-nums text-ink outline-none transition-colors focus:border-gold-2"
                        />
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-[13px] text-gold">
                      {y.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- brochure */

/**
 * The downloadable PDF behind the planner page. Picking from the media library
 * records the file size too, so the site can show "PDF · 13.7 MB" without ever
 * touching the file at build time.
 */
function BrochurePanel({
  brochure,
  patch,
  onPickPdf,
}: {
  brochure?: Brochure;
  patch: (fn: (d: PlannerData) => PlannerData) => void;
  onPickPdf: (cb: (m: { url: string; size: number; filename: string }) => void) => void;
}) {
  const b = brochure ?? { url: "" };
  const set = (next: Partial<Brochure>) =>
    patch((d) => ({ ...d, brochure: { ...(d.brochure ?? { url: "" }), ...next } }));

  return (
    <section className="border border-ink/15">
      <p className="border-b border-ink/10 bg-paper-2/60 px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
        Downloadable payment plan (PDF)
      </p>
      <div className="grid gap-5 p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <span className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
            File
          </span>
          <div className="flex flex-wrap gap-2">
            <TextInput
              value={b.url}
              placeholder="R2 URL, or /media/plan.pdf"
              onChange={(e) => set({ url: e.target.value })}
              className="min-w-0 flex-1 font-mono text-[12px]"
            />
            <AdminButton
              variant="outline"
              onClick={() =>
                onPickPdf((m) =>
                  set({
                    url: m.url,
                    bytes: m.size,
                    label: b.label || m.filename.replace(/\.pdf$/i, ""),
                  }),
                )
              }
            >
              Pick PDF
            </AdminButton>
            {b.url && (
              <AdminButton
                variant="danger"
                onClick={() => patch((d) => ({ ...d, brochure: undefined }))}
              >
                Remove
              </AdminButton>
            )}
          </div>
          <span className="mt-2 block text-[11px] leading-relaxed text-ink-2/80">
            Upload the PDF under Media first (max 25 MB), then pick it here. Visitors only
            download it when they click — it never slows the site down. Leave this empty to
            hide the download link entirely.
          </span>
        </div>

        <Field label="Link text">
          <TextInput
            value={b.label ?? ""}
            placeholder="Payment plan & brochure"
            onChange={(e) => set({ label: e.target.value })}
          />
        </Field>
        <Field label="Dated" hint="Shown next to the file size, e.g. “Jul 2026”.">
          <TextInput
            value={b.updated ?? ""}
            placeholder="Jul 2026"
            onChange={(e) => set({ updated: e.target.value })}
          />
        </Field>

        {b.url && (
          <div className="border border-ink/15 bg-white/50 p-4 md:col-span-2">
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-2">
              On the planner page
            </p>
            <div className="flex items-center justify-between gap-6 border-t border-ink/15 pt-4">
              <span className="min-w-0">
                <span className="block truncate text-[0.95rem] text-ink">
                  {b.label || "Payment plan & brochure"}
                </span>
                <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-2/80">
                  {["PDF", b.bytes ? `${(b.bytes / 1e6).toFixed(1)} MB` : null, b.updated || null]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">
                Download ↓
              </span>
            </div>
            <a
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold underline decoration-gold/40 underline-offset-4"
            >
              Open the file to check it ↗
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
