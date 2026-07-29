"use client";

// Purpose-built editor for the numbers behind the payment planner, the payment
// visualizer and the residences cards. Everything here writes back into the
// booking project's `data` blob through the normal projects API — the raw JSON
// editor under Projects still works, this is just the safe way in.

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type ProjectRow } from "../api";
import {
  AdminButton,
  Field,
  MoneyInput,
  NumberInput,
  Select,
  TextArea,
  TextInput,
  useConfirm,
  useToast,
  useUnsavedGuard,
} from "../ui";
import { MediaPickerModal, type MediaAccept } from "./Media";
import { cn } from "@/lib/utils";
import type { Milestone, PlanConfig, Unit } from "@/data/projects";
import {
  listedStop,
  milestonesTotal,
  planConfig,
  planFor,
  reconcile,
  scheduleTotal,
  unitTotal,
} from "@/lib/pricing";
import { fmtInt, pkrCompact } from "@/lib/format";

type ProjectListRow = { id: number; slug: string; status: string; name: string | null };

type PlanData = {
  name?: string;
  units?: Unit[];
  plan?: PlanConfig;
  appreciation?: { low: number; high: number };
  [k: string]: unknown;
};

/** What the media picker hands back — url plus the metadata we want to keep. */
type PickRequest = {
  accept: MediaAccept;
  onPick: (m: { url: string; size: number; filename: string }) => void;
};

const MILESTONE_PRESETS: { label: string; make: () => Milestone }[] = [
  { label: "On structure", make: () => ({ label: "On structure", amount: 0, count: 1, atMonth: 18 }) },
  {
    label: "Half-yearly ×6",
    make: () => ({ label: "Half-yearly", amount: 0, count: 6, atMonth: 6, everyMonths: 6 }),
  },
  { label: "At possession", make: () => ({ label: "At possession", amount: 0, count: 1, atMonth: 30 }) },
  { label: "Custom", make: () => ({ label: "", amount: 0, count: 1 }) },
];

const NEW_UNIT = (): Unit => ({
  id: "",
  name: "",
  area: 0,
  price: 0,
  down: 0,
  monthly: 0,
  months: 36,
  milestones: [],
  rentEst: 0,
  blurb: "",
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function PaymentPlansView({ nav }: { nav: (hash: string) => void }) {
  const [projects, setProjects] = useState<ProjectListRow[] | null>(null);
  const [id, setId] = useState<number | null>(null);
  const [row, setRow] = useState<ProjectRow | null>(null);
  const [data, setData] = useState<PlanData | null>(null);
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
        const d = JSON.parse(r.data || "{}") as PlanData;
        setRow(r);
        setData(d);
        setInitial(JSON.stringify(d));
      })
      .catch((e) => !cancelled && toast("err", e.message));
    return () => {
      cancelled = true;
    };
  }, [id, toast]);

  // Switching projects keeps the old data on screen until the new row lands.
  const loaded = data !== null && row?.id === id;
  const dirty = loaded && JSON.stringify(data) !== initial;
  useUnsavedGuard(dirty);

  const patch = useCallback((fn: (d: PlanData) => PlanData) => {
    setData((d) => (d === null ? d : fn(structuredClone(d))));
  }, []);

  const setUnits = useCallback(
    (fn: (units: Unit[]) => Unit[]) => patch((d) => ({ ...d, units: fn(d.units ?? []) })),
    [patch],
  );

  const save = async () => {
    if (!row || !data) return;
    const units = data.units ?? [];
    const missingId = units.find((u) => !u.id.trim());
    if (missingId) return toast("err", `“${missingId.name || "Untitled"}” needs an ID.`);
    const ids = units.map((u) => u.id);
    const dupe = ids.find((v, i) => ids.indexOf(v) !== i);
    if (dupe) return toast("err", `Two units share the ID “${dupe}”. IDs must be unique.`);

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
      toast("ok", "Payment plans saved. Publish from the dashboard to push them live.");
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const units = data?.units ?? [];
  const cfg = useMemo(() => planConfig({ plan: data?.plan }), [data?.plan]);
  const offBalance = units.filter((u) => Math.abs(reconcile(u)) > 0.5).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="font-display text-[1.8rem] font-[400] text-ink">Payment plans</h2>
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
            Save plans
          </AdminButton>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border border-ink/15 bg-paper-2/40 px-5 py-3.5">
        <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-2">
          These figures drive the payment planner, the payment visualizer on the project
          page, the residences cards, and the WhatsApp messages buyers send you. The price
          is fixed — the down-payment stops below only shift money between the booking
          cheque and the monthly run, never onto the total.
        </p>
        <AdminButton variant="outline" onClick={() => nav("#/planner")}>
          Planner display
        </AdminButton>
      </div>

      {!loaded || data === null ? (
        <p className="text-[13px] text-ink-2">Loading…</p>
      ) : (
        <div className="space-y-10">
          <PlanBasics cfg={cfg} data={data} patch={patch} />

          <PosterTable units={units} />

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-[1.3rem] font-[420] text-ink">
                Units{" "}
                <span className="ml-1 font-mono text-[10px] tracking-[0.16em] text-ink-2">
                  {units.length}
                </span>
              </h3>
              {offBalance > 0 && (
                <span className="rounded-full border border-gold-2/60 bg-gold/10 px-3 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold">
                  {offBalance} unit{offBalance > 1 ? "s" : ""} don&rsquo;t add up
                </span>
              )}
            </div>

            <div className="space-y-4">
              {units.map((u, i) => (
                <UnitCard
                  key={i}
                  unit={u}
                  index={i}
                  count={units.length}
                  cfg={cfg}
                  onChange={(next) => setUnits((us) => us.map((x, j) => (j === i ? next : x)))}
                  onMove={(dir) =>
                    setUnits((us) => {
                      const next = [...us];
                      const j = i + dir;
                      if (j < 0 || j >= next.length) return us;
                      [next[i], next[j]] = [next[j], next[i]];
                      return next;
                    })
                  }
                  onDuplicate={() =>
                    setUnits((us) => [
                      ...us.slice(0, i + 1),
                      { ...structuredClone(u), id: `${u.id}-copy`, name: `${u.name} (copy)` },
                      ...us.slice(i + 1),
                    ])
                  }
                  onRemove={() => {
                    if (!confirm(`Remove “${u.name || u.id}” from the plans?`)) return;
                    setUnits((us) => us.filter((_, j) => j !== i));
                  }}
                  onPickImage={(cb) => setPicker({ accept: "image", onPick: (m) => cb(m.url) })}
                />
              ))}
            </div>

            <AdminButton
              variant="outline"
              className="mt-4"
              onClick={() => setUnits((us) => [...us, NEW_UNIT()])}
            >
              + Add a unit type
            </AdminButton>
          </section>
        </div>
      )}

      {/* Sticky save rail — this page is long; the header button scrolls away. */}
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
                setData(JSON.parse(initial) as PlanData);
              }}
            >
              Discard
            </AdminButton>
            <AdminButton variant="gold" busy={saving} onClick={() => void save()}>
              Save plans
            </AdminButton>
          </div>
        </div>
      )}

      <MediaPickerModal
        open={picker !== null}
        accept={picker?.accept ?? "image"}
        onClose={() => setPicker(null)}
        onPick={(m) => picker?.onPick(m)}
      />
    </div>
  );
}

/* ------------------------------------------------------------ plan basics */

function PlanBasics({
  cfg,
  data,
  patch,
}: {
  cfg: ReturnType<typeof planConfig>;
  data: PlanData;
  patch: (fn: (d: PlanData) => PlanData) => void;
}) {
  const [newStop, setNewStop] = useState("");
  const plan = data.plan ?? {};
  const setPlan = (p: Partial<PlanConfig>) =>
    patch((d) => ({ ...d, plan: { ...(d.plan ?? {}), ...p } }));
  const app = data.appreciation ?? { low: 0.12, high: 0.2 };

  const addStop = () => {
    const n = Math.round(Number(newStop));
    if (!Number.isFinite(n) || n <= 0 || n >= 100) return;
    setPlan({ downOptions: Array.from(new Set([...cfg.downOptions, n])).sort((a, b) => a - b) });
    setNewStop("");
  };

  return (
    <section className="border border-ink/15">
      <p className="border-b border-ink/10 bg-paper-2/60 px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
        Plan basics
      </p>
      <div className="grid gap-5 p-5 md:grid-cols-2">
        <div>
          <span className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
            Down-payment stops
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {cfg.downOptions.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-2 border border-ink/20 bg-white/60 px-3 py-1.5 font-mono text-[11px] text-ink"
              >
                {p}%
                <button
                  type="button"
                  title="Remove this stop"
                  disabled={cfg.downOptions.length <= 1}
                  onClick={() =>
                    setPlan({ downOptions: cfg.downOptions.filter((x) => x !== p) })
                  }
                  className="text-red-900/60 hover:text-red-900 disabled:opacity-25"
                >
                  ×
                </button>
              </span>
            ))}
            <span className="inline-flex items-center">
              <TextInput
                value={newStop}
                placeholder="add %"
                onChange={(e) => setNewStop(e.target.value.replace(/[^\d]/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addStop();
                  }
                }}
                className="w-24 font-mono"
              />
            </span>
          </div>
          <span className="mt-2 block text-[11px] text-ink-2/80">
            The stops buyers can slide between. The one closest to a unit&rsquo;s listed
            down payment shows the poster figures exactly; the rest are derived.
          </span>
        </div>

        <Field label="Rounding step" hint="Derived monthlies land on a multiple of this.">
          <MoneyInput value={cfg.roundTo} onChange={(v) => setPlan({ roundTo: v || 1 })} />
        </Field>

        <Field label="Handover month" hint="When keys are handed over — may precede the last instalment.">
          <NumberInput
            value={plan.handoverMonths ?? 0}
            suffix="mo"
            onChange={(v) => setPlan({ handoverMonths: v })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tenure label">
            <TextInput
              value={plan.tenureLabel ?? ""}
              placeholder="3 Years Payment Plan"
              onChange={(e) => setPlan({ tenureLabel: e.target.value })}
            />
          </Field>
          <Field label="Handover label">
            <TextInput
              value={plan.handoverLabel ?? ""}
              placeholder="2.5 Years Handover"
              onChange={(e) => setPlan({ handoverLabel: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Appreciation low" hint="Per year, used for the projected value.">
            <NumberInput
              value={Math.round(app.low * 100)}
              suffix="%"
              onChange={(v) =>
                patch((d) => ({ ...d, appreciation: { ...app, low: v / 100 } }))
              }
            />
          </Field>
          <Field label="Appreciation high">
            <NumberInput
              value={Math.round(app.high * 100)}
              suffix="%"
              onChange={(v) =>
                patch((d) => ({ ...d, appreciation: { ...app, high: v / 100 } }))
              }
            />
          </Field>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- poster table */

/** The plans side by side, laid out like the printed payment-plan poster. */
function PosterTable({ units }: { units: Unit[] }) {
  if (!units.length) return null;
  const labels: string[] = [];
  units.forEach((u) =>
    (u.milestones ?? []).forEach((m) => {
      const l = m.label || "Milestone";
      if (!labels.includes(l)) labels.push(l);
    }),
  );

  return (
    <section className="border border-ink/15">
      <p className="border-b border-ink/10 bg-paper-2/60 px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
        The plan, as buyers see it
      </p>
      <div className="overflow-x-auto p-5">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink/15 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-2">
              <th className="py-2.5 pr-4 font-normal">Payments</th>
              {units.map((u, i) => (
                <th key={i} className="py-2.5 pl-4 text-right font-normal text-ink">
                  {u.name || "Untitled"}
                  {u.area > 0 && <span className="text-ink-2"> ({u.area} sqft)</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-[12px] tabular-nums">
            <Row label="Total price" units={units} pick={(u) => unitTotal(u)} strong />
            <Row label="Down payment" units={units} pick={(u) => u.down} />
            <Row
              label="Monthly instalments"
              units={units}
              cell={(u) => `${u.months} × ${fmtInt(u.monthly)}`}
            />
            {labels.map((l) => (
              <Row
                key={l}
                label={l}
                units={units}
                cell={(u) => {
                  const m = (u.milestones ?? []).find((x) => (x.label || "Milestone") === l);
                  if (!m) return "—";
                  return m.count > 1 ? `${m.count} × ${fmtInt(m.amount)}` : fmtInt(m.amount);
                }}
              />
            ))}
            <Row
              label="Schedule adds up to"
              units={units}
              cell={(u) => {
                const off = reconcile(u);
                return off === 0 ? `${fmtInt(scheduleTotal(u))} ✓` : `${fmtInt(scheduleTotal(u))} ⚠`;
              }}
              tone={(u) => (reconcile(u) === 0 ? "ok" : "warn")}
            />
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Row({
  label,
  units,
  pick,
  cell,
  strong,
  tone,
}: {
  label: string;
  units: Unit[];
  pick?: (u: Unit) => number;
  cell?: (u: Unit) => string;
  strong?: boolean;
  tone?: (u: Unit) => "ok" | "warn";
}) {
  return (
    <tr className="border-b border-ink/10">
      <td className="py-2.5 pr-4 font-sans text-[12.5px] text-ink-2">{label}</td>
      {units.map((u, i) => (
        <td
          key={i}
          className={cn(
            "py-2.5 pl-4 text-right",
            strong ? "text-ink" : "text-ink-2",
            tone?.(u) === "ok" && "text-green-900",
            tone?.(u) === "warn" && "text-red-900",
          )}
        >
          {cell ? cell(u) : fmtInt(pick!(u))}
        </td>
      ))}
    </tr>
  );
}

/* ------------------------------------------------------------- unit card */

function UnitCard({
  unit,
  index,
  count,
  cfg,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
  onPickImage,
}: {
  unit: Unit;
  index: number;
  count: number;
  cfg: ReturnType<typeof planConfig>;
  onChange: (u: Unit) => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onPickImage: (cb: (url: string) => void) => void;
}) {
  const [open, setOpen] = useState(index === 0);
  const set = <K extends keyof Unit>(k: K, v: Unit[K]) => onChange({ ...unit, [k]: v });
  const setMilestones = (fn: (m: Milestone[]) => Milestone[]) =>
    onChange({ ...unit, milestones: fn(unit.milestones ?? []) });

  const total = unitTotal(unit);
  const sched = scheduleTotal(unit);
  const off = reconcile(unit);
  const balanced = off === 0;
  const milestones = unit.milestones ?? [];
  const lastMs = milestones.length ? milestones[milestones.length - 1] : null;

  /** Absorb the gap into the closing payment (or the booking cheque). */
  const balanceIntoSchedule = () => {
    if (lastMs) {
      const per = Math.max(0, lastMs.amount - off / Math.max(1, lastMs.count));
      setMilestones((ms) => ms.map((m, i) => (i === ms.length - 1 ? { ...m, amount: per } : m)));
    } else {
      set("down", Math.max(0, unit.down - off));
    }
  };

  return (
    <section
      className={cn(
        "border bg-white/40",
        balanced ? "border-ink/15" : "border-gold-2/60 bg-gold/[0.04]",
      )}
    >
      {/* summary strip — collapsed cards still show whether the numbers work */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink/10 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span
            className={cn(
              "font-mono text-[11px] text-ink-2 transition-transform",
              open && "rotate-90",
            )}
          >
            ▸
          </span>
          <span className="truncate font-display text-[1.15rem] text-ink">
            {unit.name || "Untitled unit"}
          </span>
          <span className="shrink-0 font-mono text-[10px] tracking-[0.12em] text-ink-2">
            {unit.area > 0 ? `${unit.area} sqft` : "—"}
          </span>
          <span className="shrink-0 font-mono text-[10px] tracking-[0.12em] text-gold">
            ₨ {pkrCompact(total)}
          </span>
        </button>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em]",
            balanced
              ? "border-green-800/25 bg-green-800/5 text-green-900"
              : "border-red-800/30 bg-red-900/5 text-red-900",
          )}
        >
          {balanced ? "Balanced" : `${off > 0 ? "Over" : "Under"} by ₨ ${fmtInt(Math.abs(off))}`}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <IconBtn label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
            ↑
          </IconBtn>
          <IconBtn label="Move down" disabled={index === count - 1} onClick={() => onMove(1)}>
            ↓
          </IconBtn>
          <IconBtn label="Duplicate" onClick={onDuplicate}>
            ⧉
          </IconBtn>
          <IconBtn label="Remove" danger onClick={onRemove}>
            ×
          </IconBtn>
        </span>
      </div>

      {open && (
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1fr]">
          {/* identity */}
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" hint="Shown on the tabs and cards.">
                <TextInput
                  value={unit.name}
                  placeholder="Convertible"
                  onChange={(e) => {
                    const name = e.target.value;
                    onChange({
                      ...unit,
                      name,
                      id: unit.id || slugify(name),
                    });
                  }}
                />
              </Field>
              <Field label="ID" hint="Stable key — changing it breaks saved links.">
                <TextInput
                  value={unit.id}
                  placeholder="studio"
                  onChange={(e) => set("id", slugify(e.target.value))}
                  className="font-mono"
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Area">
                <NumberInput value={unit.area} suffix="sqft" onChange={(v) => set("area", v)} />
              </Field>
              <Field label="Rent estimate" hint="Drives the rental-yield line.">
                <MoneyInput value={unit.rentEst} onChange={(v) => set("rentEst", v)} />
              </Field>
            </div>
            <Field label="Blurb" hint="One or two lines on the residences card.">
              <TextArea rows={3} value={unit.blurb} onChange={(e) => set("blurb", e.target.value)} />
            </Field>
            <Field label="Floor plan">
              <div className="flex gap-2">
                <TextInput
                  value={unit.floorPlan ?? ""}
                  placeholder="R2 image URL"
                  onChange={(e) => set("floorPlan", e.target.value)}
                  className="flex-1"
                />
                <AdminButton
                  variant="outline"
                  onClick={() => onPickImage((url) => set("floorPlan", url))}
                >
                  Pick
                </AdminButton>
              </div>
              {unit.floorPlan && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={unit.floorPlan}
                  alt=""
                  className="mt-2 h-24 w-full border border-ink/10 object-cover"
                />
              )}
            </Field>
          </div>

          {/* money */}
          <div className="space-y-4">
            <Field label="Total price" hint="The headline figure. Everything reconciles to it.">
              <MoneyInput value={unit.price ?? 0} onChange={(v) => set("price", v)} />
            </Field>

            <div className="border border-ink/15">
              <p className="border-b border-ink/10 bg-paper-2/60 px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
                The schedule
              </p>
              <div className="space-y-3 p-3">
                <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                  <Field label="Down payment, at booking">
                    <MoneyInput value={unit.down} onChange={(v) => set("down", v)} />
                  </Field>
                  <p className="pb-2.5 font-mono text-[10px] text-ink-2">
                    {total > 0 ? `${((unit.down / total) * 100).toFixed(1)}%` : "—"}
                  </p>
                </div>

                <div className="grid grid-cols-[1fr_5.5rem_auto] items-end gap-3">
                  <Field label="Monthly instalment">
                    <MoneyInput value={unit.monthly} onChange={(v) => set("monthly", v)} />
                  </Field>
                  <Field label="Months">
                    <NumberInput value={unit.months} onChange={(v) => set("months", v)} />
                  </Field>
                  <p className="pb-2.5 font-mono text-[10px] text-ink-2">
                    = {fmtInt(unit.monthly * unit.months)}
                  </p>
                </div>

                {milestones.map((m, i) => (
                  <MilestoneRow
                    key={i}
                    m={m}
                    onChange={(next) =>
                      setMilestones((ms) => ms.map((x, j) => (j === i ? next : x)))
                    }
                    onRemove={() => setMilestones((ms) => ms.filter((_, j) => j !== i))}
                  />
                ))}

                <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-2">
                    Add
                  </span>
                  {MILESTONE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setMilestones((ms) => [...ms, p.make()])}
                      className="border border-ink/20 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-2 transition-colors hover:border-gold-2 hover:text-gold"
                    >
                      + {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* reconciliation */}
            <div
              className={cn(
                "border p-3",
                balanced ? "border-green-800/25 bg-green-800/5" : "border-red-800/30 bg-red-900/5",
              )}
            >
              <div className="flex items-baseline justify-between gap-3 font-mono text-[11px]">
                <span className="text-ink-2">Schedule</span>
                <span className="text-ink">₨ {fmtInt(sched)}</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-3 font-mono text-[11px]">
                <span className="text-ink-2">Total price</span>
                <span className="text-ink">₨ {fmtInt(total)}</span>
              </div>
              {balanced ? (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-green-900">
                  ✓ Adds up exactly
                </p>
              ) : (
                <div className="mt-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-red-900">
                    {off > 0 ? "Over" : "Under"} by ₨ {fmtInt(Math.abs(off))}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <AdminButton variant="outline" onClick={() => set("price", sched)}>
                      Set price to ₨ {fmtInt(sched)}
                    </AdminButton>
                    <AdminButton variant="outline" onClick={balanceIntoSchedule}>
                      Fix “{lastMs?.label || "Down payment"}”
                    </AdminButton>
                  </div>
                </div>
              )}
            </div>

            <DerivedPlans unit={unit} cfg={cfg} />
          </div>
        </div>
      )}
    </section>
  );
}

function MilestoneRow({
  m,
  onChange,
  onRemove,
}: {
  m: Milestone;
  onChange: (m: Milestone) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof Milestone>(k: K, v: Milestone[K]) => onChange({ ...m, [k]: v });
  return (
    <div className="border-t border-ink/10 pt-3">
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <Field label="Payment">
          <TextInput
            value={m.label}
            placeholder="On structure"
            onChange={(e) => set("label", e.target.value)}
          />
        </Field>
        <button
          type="button"
          title="Remove this payment"
          onClick={onRemove}
          className="mt-6 h-9 w-9 border border-ink/15 text-red-900/70 transition-colors hover:border-red-800/40 hover:text-red-900"
        >
          ×
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Each">
          <MoneyInput value={m.amount} onChange={(v) => set("amount", v)} />
        </Field>
        <Field label="How many">
          <NumberInput value={m.count} suffix="×" onChange={(v) => set("count", Math.max(1, v))} />
        </Field>
        <Field label="First at">
          <NumberInput value={m.atMonth ?? 0} suffix="mo" onChange={(v) => set("atMonth", v)} />
        </Field>
        <Field label="Every">
          <NumberInput
            value={m.everyMonths ?? 0}
            suffix="mo"
            onChange={(v) => set("everyMonths", v)}
          />
        </Field>
      </div>
      <p className="mt-1.5 text-right font-mono text-[10px] text-ink-2">
        = {fmtInt(m.amount * Math.max(1, m.count))}
      </p>
    </div>
  );
}

/** Exactly what the site will compute at each stop — no surprises after publish. */
function DerivedPlans({ unit, cfg }: { unit: Unit; cfg: ReturnType<typeof planConfig> }) {
  const listed = listedStop(unit, cfg.downOptions);
  return (
    <div className="border border-ink/15">
      <p className="border-b border-ink/10 bg-paper-2/60 px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
        What the site will show
      </p>
      <table className="w-full border-collapse text-left font-mono text-[11px] tabular-nums">
        <thead>
          <tr className="border-b border-ink/10 text-[9px] uppercase tracking-[0.14em] text-ink-2">
            <th className="px-3 py-2 font-normal">Stop</th>
            <th className="px-3 py-2 text-right font-normal">Down</th>
            <th className="px-3 py-2 text-right font-normal">Monthly</th>
            <th className="px-3 py-2 text-right font-normal">Fixed</th>
          </tr>
        </thead>
        <tbody>
          {cfg.downOptions.map((p) => {
            const plan = planFor(unit, p, { ...cfg });
            return (
              <tr key={p} className="border-b border-ink/10 last:border-0">
                <td className="px-3 py-2 text-ink">
                  {p}%
                  {p === listed && (
                    <span className="ml-2 text-[8.5px] uppercase tracking-[0.14em] text-gold">
                      listed
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right text-ink-2">{fmtInt(plan.down)}</td>
                <td className="px-3 py-2 text-right text-ink-2">
                  {plan.months} × {fmtInt(plan.monthly)}
                </td>
                <td className="px-3 py-2 text-right text-ink-2">
                  {fmtInt(milestonesTotal(unit))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-7 w-7 border border-ink/15 font-mono text-[11px] transition-colors disabled:opacity-25",
        danger
          ? "text-red-900/70 hover:border-red-800/40 hover:text-red-900"
          : "text-ink-2 hover:border-ink/40 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
