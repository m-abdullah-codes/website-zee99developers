"use client";

/**
 * The two retail floors: a drawing with a marker per shop, and the ledger those
 * markers point at.
 *
 * The markers are placed by clicking the plan, never by typing coordinates.
 * They are fractions of the drawing's width and height, so the moment anyone
 * re-exports a plate at a different crop all twenty-three of them are wrong —
 * and the only way to know a marker is wrong is to look at it sitting in the
 * wrong room. Typing 0.586 into a box cannot tell you that; clicking the room
 * can.
 *
 * The ledger checks two sums on every unit — price against size × rate, and the
 * five payment streams against the price — and offers to fix either. The
 * brochure's whole argument is that its figures are the client's own schedule;
 * a row that does not add up destroys that in one screenshot.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AdminButton, Field, MoneyInput, NumberInput, Select, useConfirm } from "../../ui";
import { AddRow, EmField, Line, MediaField, Panel, Para, RowCard } from "./parts";
import { moved } from "./sections";
import { cn } from "@/lib/utils";
import { fmtInt, pkrCompact } from "@/lib/format";
import { COMMERCIAL } from "@/data/commercial";
import type { BrochureDoc, ShopFloor, ShopUnit } from "@/data/brochureDefaults";

type Shopfront = BrochureDoc["shopfront"];
type Patch = (fn: (s: Shopfront) => Shopfront) => void;

/**
 * The split every commercial unit is sold on, mirrored from the shipped
 * `COMMERCIAL.split` so the rebuild below can only ever produce a schedule the
 * page will also print. Percentages are edited under Projects → commercial.
 */
const SPLIT = {
  down: COMMERCIAL.split[0]?.pct ?? 20,
  monthly: COMMERCIAL.split[1]?.pct ?? 30,
  biAnnual: COMMERCIAL.split[2]?.pct ?? 20,
  structure: COMMERCIAL.split[3]?.pct ?? 10,
};

const NEW_UNIT = (id: string): ShopUnit => ({
  id,
  type: "Shop",
  sqft: 0,
  rate: 0,
  price: 0,
  down: 0,
  monthly: 0,
  monthlyCount: 36,
  biAnnual: 0,
  biAnnualCount: 6,
  structure: 0,
  possession: 0,
});

export const scheduleTotal = (u: ShopUnit) =>
  u.down + u.monthly * u.monthlyCount + u.biAnnual * u.biAnnualCount + u.structure + u.possession;

/**
 * Every stream from the headline price, with the rounding remainder pushed onto
 * the possession cheque — which is exactly how the client's own sheet resolves
 * it, and why the shipped figures end in numbers like 4,179,986.
 */
export function rebuildSchedule(u: ShopUnit): ShopUnit {
  const price = u.price || u.sqft * u.rate;
  const down = Math.round((price * SPLIT.down) / 100);
  const structure = Math.round((price * SPLIT.structure) / 100);
  const monthlyCount = u.monthlyCount || 36;
  const biAnnualCount = u.biAnnualCount || 6;
  const monthly = Math.round((price * SPLIT.monthly) / 100 / monthlyCount);
  const biAnnual = Math.round((price * SPLIT.biAnnual) / 100 / biAnnualCount);
  const possession =
    price - down - monthly * monthlyCount - biAnnual * biAnnualCount - structure;
  return { ...u, price, down, structure, monthly, monthlyCount, biAnnual, biAnnualCount, possession };
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function ShopsTab({
  value,
  patch,
  onPickImage,
}: {
  value: Shopfront;
  patch: Patch;
  onPickImage: (set: (url: string) => void) => void;
}) {
  const [floorIndex, setFloorIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const confirm = useConfirm();

  const floors = value.floors;
  const floor = floors[Math.min(floorIndex, floors.length - 1)];

  const setFloor = useCallback(
    (fn: (f: ShopFloor) => ShopFloor) =>
      patch((s) => ({
        ...s,
        floors: s.floors.map((f, i) => (i === Math.min(floorIndex, s.floors.length - 1) ? fn(f) : f)),
      })),
    [patch, floorIndex],
  );

  const setUnits = useCallback(
    (fn: (u: ShopUnit[]) => ShopUnit[]) => setFloor((f) => ({ ...f, units: fn(f.units) })),
    [setFloor],
  );

  const setPos = useCallback(
    (id: string, x: number, y: number) =>
      patch((s) => ({
        ...s,
        platePos: { ...s.platePos, [id]: { x: clamp01(x), y: clamp01(y) } },
      })),
    [patch],
  );

  if (!floor) {
    return (
      <Panel title="Floors" hint="Every retail floor has been removed.">
        <AddRow
          label="Add a floor"
          onClick={() =>
            patch((s) => ({
              ...s,
              floors: [
                {
                  id: "ground",
                  name: "Ground",
                  sub: "",
                  body: "",
                  rate: 0,
                  image: "",
                  alt: "",
                  caption: "",
                  ledgerLabel: "",
                  units: [],
                },
              ],
            }))
          }
        />
      </Panel>
    );
  }

  const unplaced = floor.units.filter((u) => !value.platePos[u.id]);
  const offPrice = floor.units.filter((u) => u.price !== u.sqft * u.rate).length;
  const offSchedule = floor.units.filter((u) => scheduleTotal(u) !== u.price).length;

  return (
    <div className="grid gap-6">
      <Panel title="Section head" hint="Folio 04. Not folded — this is the section the brochure is sent for.">
        <div className="grid gap-4">
          <EmField label="Title" value={value.title} onChange={(v) => patch((s) => ({ ...s, title: v }))} />
          <Para label="Lede" value={value.lede} onChange={(v) => patch((s) => ({ ...s, lede: v }))} />
        </div>
      </Panel>

      {/* Floor switcher — the whole rest of the tab follows it. */}
      <div className="flex flex-wrap items-center gap-2">
        {floors.map((f, i) => (
          <button
            key={f.id || i}
            type="button"
            onClick={() => {
              setFloorIndex(i);
              setSelected(null);
            }}
            className={cn(
              "border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
              i === floorIndex
                ? "border-ink bg-ink text-paper"
                : "border-ink/20 text-ink-2 hover:border-ink/50 hover:text-ink",
            )}
          >
            {f.name || `Floor ${i + 1}`}
            <span className="ml-2 opacity-60">{f.units.length}</span>
          </button>
        ))}
        <AddRow
          label="Add a floor"
          onClick={() => {
            patch((s) => ({
              ...s,
              floors: [
                ...s.floors,
                {
                  id: `floor-${s.floors.length + 1}`,
                  name: "New floor",
                  sub: "",
                  body: "",
                  rate: 0,
                  image: "",
                  alt: "",
                  caption: "",
                  ledgerLabel: "",
                  units: [],
                },
              ],
            }));
            setFloorIndex(floors.length);
          }}
        />
        {floors.length > 1 && (
          <AdminButton
            variant="danger"
            onClick={() => {
              if (!confirm(`Remove the ${floor.name} floor and its ${floor.units.length} units?`)) return;
              patch((s) => ({ ...s, floors: s.floors.filter((_, i) => i !== floorIndex) }));
              setFloorIndex(0);
              setSelected(null);
            }}
          >
            Remove {floor.name}
          </AdminButton>
        )}
      </div>

      <Panel title={`${floor.name || "Floor"} · copy`}>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Line label="Name" value={floor.name} onChange={(v) => setFloor((f) => ({ ...f, name: v }))} />
            <Line
              label="ID"
              mono
              hint="Used in links only."
              value={floor.id}
              onChange={(v) => setFloor((f) => ({ ...f, id: v }))}
            />
            <Field label="Headline rate" hint="PKR per sq ft, shown in the floor's facts.">
              <MoneyInput value={floor.rate} onChange={(v) => setFloor((f) => ({ ...f, rate: v }))} />
            </Field>
          </div>
          <Line label="Sub-line" value={floor.sub} onChange={(v) => setFloor((f) => ({ ...f, sub: v }))} />
          <Para label="Body" value={floor.body} onChange={(v) => setFloor((f) => ({ ...f, body: v }))} />
          <Line
            label="Ledger heading"
            hint="The line on the folded price list, e.g. “Price of every ground-floor shop”."
            value={floor.ledgerLabel}
            onChange={(v) => setFloor((f) => ({ ...f, ledgerLabel: v }))}
          />
        </div>
      </Panel>

      <Panel
        title="The drawing"
        hint="Replacing this plate moves every marker on it — they are fractions of the image, not points on the building. Re-place them below after a swap."
      >
        <div className="grid gap-4">
          <MediaField
            label="Plan"
            value={floor.image}
            onChange={(v) => setFloor((f) => ({ ...f, image: v }))}
            onPick={() => onPickImage((url) => setFloor((f) => ({ ...f, image: url })))}
          />
          <Line
            label="Caption"
            value={floor.caption}
            onChange={(v) => setFloor((f) => ({ ...f, caption: v }))}
          />
          <Para
            label="Alt text"
            value={floor.alt}
            onChange={(v) => setFloor((f) => ({ ...f, alt: v }))}
          />
        </div>
      </Panel>

      <Panel
        title="Where each unit sits"
        hint="Click a marker to pick it up, then click the room it belongs in — or drag it. Arrow keys nudge the selected marker; hold Shift for bigger steps."
        aside={
          unplaced.length > 0 ? (
            <span className="border border-gold-2/60 bg-gold/10 px-3 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold">
              {unplaced.length} not placed
            </span>
          ) : (
            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-2">
              All {floor.units.length} placed
            </span>
          )
        }
      >
        <PlanPlacer
          floor={floor}
          platePos={value.platePos}
          selected={selected}
          onSelect={setSelected}
          onMove={setPos}
        />
      </Panel>

      <Panel
        title={`Units · ${floor.units.length}`}
        hint={`Price should equal size × rate; the five payment streams should add up to the price. Split in use: ${SPLIT.down}% down, ${SPLIT.monthly}% monthly, ${SPLIT.biAnnual}% bi-annual, ${SPLIT.structure}% on structure, the rest at possession.`}
        aside={
          <div className="flex flex-wrap items-center gap-2">
            {(offPrice > 0 || offSchedule > 0) && (
              <span className="border border-gold-2/60 bg-gold/10 px-3 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold">
                {offPrice > 0 && `${offPrice} priced off`}
                {offPrice > 0 && offSchedule > 0 && " · "}
                {offSchedule > 0 && `${offSchedule} don't add up`}
              </span>
            )}
            <AdminButton
              variant="outline"
              onClick={() => {
                if (!confirm(`Rebuild the schedule on all ${floor.units.length} units from their size and rate?`))
                  return;
                setUnits((us) => us.map((u) => rebuildSchedule({ ...u, price: u.sqft * u.rate })));
              }}
            >
              Rebuild every schedule
            </AdminButton>
            <AddRow
              label="Add a unit"
              onClick={() =>
                setUnits((us) => [
                  ...us,
                  { ...NEW_UNIT(`${floor.id === "ground" ? "G" : "L"}${us.length + 1}`), rate: floor.rate },
                ])
              }
            />
          </div>
        }
      >
        <div className="grid gap-3">
          {floor.units.map((u, i) => (
            <UnitRow
              key={i}
              unit={u}
              index={i}
              count={floor.units.length}
              placed={!!value.platePos[u.id]}
              arcade={value.arcadeFronted.includes(u.id)}
              selected={selected === u.id}
              onSelect={() => setSelected(u.id)}
              onChange={(next) => setUnits((us) => us.map((x, j) => (j === i ? next : x)))}
              onToggleArcade={() =>
                patch((s) => ({
                  ...s,
                  arcadeFronted: s.arcadeFronted.includes(u.id)
                    ? s.arcadeFronted.filter((x) => x !== u.id)
                    : [...s.arcadeFronted, u.id],
                }))
              }
              onMove={(d) => setUnits((us) => moved(us, i, d))}
              onDuplicate={() =>
                setUnits((us) => [
                  ...us.slice(0, i + 1),
                  { ...u, id: `${u.id}-copy` },
                  ...us.slice(i + 1),
                ])
              }
              onRemove={() => {
                setUnits((us) => us.filter((_, j) => j !== i));
                patch((s) => {
                  const platePos = { ...s.platePos };
                  delete platePos[u.id];
                  return { ...s, platePos, arcadeFronted: s.arcadeFronted.filter((x) => x !== u.id) };
                });
              }}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------- the placer */

function PlanPlacer({
  floor,
  platePos,
  selected,
  onSelect,
  onMove,
}: {
  floor: ShopFloor;
  platePos: Record<string, { x: number; y: number }>;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
}) {
  const plate = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const fractionAt = useCallback((clientX: number, clientY: number) => {
    const box = plate.current?.getBoundingClientRect();
    if (!box) return null;
    return { x: clamp01((clientX - box.left) / box.width), y: clamp01((clientY - box.top) / box.height) };
  }, []);

  // Drag lives on the window so the pointer can leave the drawing mid-move and
  // still be carrying the marker when it comes back.
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      const p = fractionAt(e.clientX, e.clientY);
      if (p) onMove(dragging, p.x, p.y);
    };
    const up = () => setDragging(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, fractionAt, onMove]);

  const nudge = (id: string, dx: number, dy: number) => {
    const at = platePos[id] ?? { x: 0.5, y: 0.5 };
    onMove(id, at.x + dx, at.y + dy);
  };

  const here = selected ? platePos[selected] : undefined;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
      <div>
        <div
          ref={plate}
          onClick={(e) => {
            if (!selected) return;
            const p = fractionAt(e.clientX, e.clientY);
            if (p) onMove(selected, p.x, p.y);
          }}
          className={cn(
            "relative aspect-square w-full select-none overflow-hidden border border-ink/15 bg-white",
            selected ? "cursor-crosshair" : "cursor-default",
          )}
        >
          {floor.image ? (
            <Image
              src={floor.image}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="pointer-events-none object-contain"
              unoptimized
              draggable={false}
            />
          ) : (
            <span className="flex h-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2/60">
              No drawing yet
            </span>
          )}

          {floor.units.map((u) => {
            const at = platePos[u.id];
            if (!at) return null;
            const on = selected === u.id;
            return (
              <button
                key={u.id}
                type="button"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelect(u.id);
                  setDragging(u.id);
                }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  const step = e.shiftKey ? 0.01 : 0.002;
                  const map: Record<string, [number, number]> = {
                    ArrowLeft: [-step, 0],
                    ArrowRight: [step, 0],
                    ArrowUp: [0, -step],
                    ArrowDown: [0, step],
                  };
                  const d = map[e.key];
                  if (!d) return;
                  e.preventDefault();
                  onSelect(u.id);
                  nudge(u.id, d[0], d[1]);
                }}
                style={{ left: `${at.x * 100}%`, top: `${at.y * 100}%` }}
                aria-label={`${u.id} marker`}
                aria-pressed={on}
                className={cn(
                  "absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full",
                  dragging === u.id ? "cursor-grabbing" : "cursor-grab",
                )}
              >
                <span
                  className={cn(
                    "grid h-[26px] min-w-[26px] place-items-center rounded-full px-1.5 font-mono text-[10.5px] font-medium leading-none transition-transform duration-200",
                    on
                      ? "scale-125 border border-ink bg-ink text-paper shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-ink)_16%,transparent)]"
                      : "border border-gold bg-gold-3 text-ink shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-gold-3)_45%,transparent)]",
                  )}
                >
                  {u.type === "Kiosk" ? "K" : u.id.replace(/^[A-Z]+/, "")}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-2">
          {selected
            ? `${selected} picked up — click the plan to drop it${here ? ` · now at ${pct(here.x)} / ${pct(here.y)}` : ""}`
            : "Pick a unit on the right, or click a marker"}
        </p>
      </div>

      <div>
        <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">Units</p>
        <div className="max-h-[26rem] overflow-y-auto border border-ink/12">
          {floor.units.map((u) => {
            const at = platePos[u.id];
            const on = selected === u.id;
            return (
              <div
                key={u.id}
                className={cn(
                  "flex items-center justify-between gap-2 border-b border-ink/10 px-3 py-2 last:border-b-0",
                  on && "bg-gold/10",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(on ? null : u.id)}
                  className="flex min-w-0 flex-1 items-baseline gap-2 text-left"
                >
                  <span
                    className={cn(
                      "font-mono text-[11px] font-semibold tracking-[0.08em]",
                      on ? "text-gold" : "text-ink",
                    )}
                  >
                    {u.id}
                  </span>
                  <span className="truncate font-mono text-[10px] text-ink-2">
                    {at ? `${pct(at.x)} / ${pct(at.y)}` : "not placed"}
                  </span>
                </button>
                {at && (
                  <button
                    type="button"
                    onClick={() => onMove(u.id, 0.5, 0.5)}
                    title="Send to the middle"
                    className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-2/70 hover:text-ink"
                  >
                    centre
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-ink-2">
          A unit with no marker is still in the price list — it just has nothing to tap on the plan.
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- one unit */

function UnitRow({
  unit,
  index,
  count,
  placed,
  arcade,
  selected,
  onSelect,
  onChange,
  onToggleArcade,
  onMove,
  onDuplicate,
  onRemove,
}: {
  unit: ShopUnit;
  index: number;
  count: number;
  placed: boolean;
  arcade: boolean;
  selected: boolean;
  onSelect: () => void;
  onChange: (u: ShopUnit) => void;
  onToggleArcade: () => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const expected = unit.sqft * unit.rate;
  const total = scheduleTotal(unit);
  const priceOff = unit.price !== expected;
  const scheduleOff = total !== unit.price;
  const set = (patch: Partial<ShopUnit>) => onChange({ ...unit, ...patch });

  return (
    <RowCard
      index={index}
      count={count}
      title={
        <span className="flex flex-wrap items-baseline gap-2">
          <span className="font-mono">{unit.id || "—"}</span>
          <span className="text-ink-2">
            {fmtInt(unit.sqft)} sq ft · {pkrCompact(unit.price)}
          </span>
          {(priceOff || scheduleOff) && (
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-gold">
              check the figures
            </span>
          )}
          {arcade && (
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-2/70">arcade</span>
          )}
          {!placed && (
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-2/70">
              not on the plan
            </span>
          )}
        </span>
      }
      onMove={onMove}
      onDuplicate={onDuplicate}
      onRemove={onRemove}
      removeLabel={`Remove unit ${unit.id} from the ledger and the plan?`}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="ID" hint="Also the marker's label.">
          <input
            value={unit.id}
            onChange={(e) => set({ id: e.target.value })}
            className="w-full border border-ink/20 bg-white/60 px-3 py-2 font-mono text-[13px] text-ink outline-none focus:border-gold-2"
          />
        </Field>
        <Field label="Type">
          <Select value={unit.type} onChange={(e) => set({ type: e.target.value as ShopUnit["type"] })}>
            <option value="Shop">Shop</option>
            <option value="Kiosk">Kiosk</option>
          </Select>
        </Field>
        <Field label="Size">
          <NumberInput value={unit.sqft} suffix="sq ft" onChange={(v) => set({ sqft: v })} />
        </Field>
        <Field label="Rate / sq ft">
          <MoneyInput value={unit.rate} onChange={(v) => set({ rate: v })} />
        </Field>
      </div>

      <div className="grid gap-3 border border-ink/12 bg-paper-2/40 p-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Field label="Price" className="w-full max-w-[16rem]">
            <MoneyInput value={unit.price} onChange={(v) => set({ price: v })} />
          </Field>
          {priceOff && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10.5px] text-gold">
                size × rate = {fmtInt(expected)}
              </span>
              <AdminButton variant="outline" className="px-3 py-1.5" onClick={() => set({ price: expected })}>
                Use it
              </AdminButton>
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Down">
            <MoneyInput value={unit.down} onChange={(v) => set({ down: v })} />
          </Field>
          <Field label="Monthly">
            <MoneyInput value={unit.monthly} onChange={(v) => set({ monthly: v })} />
          </Field>
          <Field label="Number of monthlies">
            <NumberInput value={unit.monthlyCount} onChange={(v) => set({ monthlyCount: v })} />
          </Field>
          <Field label="Bi-annual">
            <MoneyInput value={unit.biAnnual} onChange={(v) => set({ biAnnual: v })} />
          </Field>
          <Field label="Number of bi-annuals">
            <NumberInput value={unit.biAnnualCount} onChange={(v) => set({ biAnnualCount: v })} />
          </Field>
          <Field label="On structure">
            <MoneyInput value={unit.structure} onChange={(v) => set({ structure: v })} />
          </Field>
          <Field label="At possession">
            <MoneyInput value={unit.possession} onChange={(v) => set({ possession: v })} />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-3">
          <p
            className={cn(
              "font-mono text-[10.5px]",
              scheduleOff ? "text-gold" : "text-ink-2",
            )}
          >
            {scheduleOff
              ? `The streams add up to ${fmtInt(total)} — ${total > unit.price ? "over" : "under"} the price by ${fmtInt(Math.abs(total - unit.price))}`
              : `The streams add up to the price exactly.`}
          </p>
          <AdminButton variant={scheduleOff ? "gold" : "outline"} className="px-3 py-1.5" onClick={() => onChange(rebuildSchedule(unit))}>
            Rebuild from price
          </AdminButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-[12.5px] text-ink">
          <input type="checkbox" checked={arcade} onChange={onToggleArcade} className="accent-[var(--color-gold)]" />
          Opens onto the arcade
        </label>
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.16em]",
            selected ? "text-gold" : "text-ink-2 hover:text-ink",
          )}
        >
          {placed ? "Show on the plan" : "Place on the plan"} ↑
        </button>
      </div>
    </RowCard>
  );
}
