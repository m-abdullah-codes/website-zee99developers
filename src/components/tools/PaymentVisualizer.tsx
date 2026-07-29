"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReduced } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { LIFESTYLE, type UnitId } from "@/data/projects";
import { planConfig, planFor, scheduleFor, type ScheduleRow } from "@/lib/pricing";
import { fmtInt, pkrCompact } from "@/lib/format";
import { useTweened } from "@/lib/hooks";
import { waLink } from "@/data/site";

/** Tonal ramp for the composition bar — booking first, possession last. */
const SEGMENT_COLORS = [
  "var(--color-ink)",
  "var(--color-gold)",
  "var(--color-gold-2)",
  "var(--color-gold-3)",
  "var(--color-ink-2)",
];
const segColor = (i: number) => SEGMENT_COLORS[i % SEGMENT_COLORS.length];

export default function PaymentVisualizer() {
  const units = LIFESTYLE.units!;
  const cfg = planConfig(LIFESTYLE);
  const [unitId, setUnitId] = useState<UnitId>(units[0]?.id ?? "studio");
  const [pct, setPct] = useState<number>(cfg.downOptions[cfg.downOptions.length - 1]);
  const [compare, setCompare] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const unit = units.find((u) => u.id === unitId) ?? units[0];
  const plan = planFor(unit, pct, LIFESTYLE.plan);
  const rows = scheduleFor(plan);
  const twDown = useTweened(plan.down);
  const twMonthly = useTweened(plan.monthly);
  const stopIdx = Math.max(0, cfg.downOptions.indexOf(pct));
  // Position along the track, 0–1. A single stop pins the thumb to the start.
  const at = cfg.downOptions.length > 1 ? stopIdx / (cfg.downOptions.length - 1) : 0;
  const handover = plan.handoverMonths;

  useGSAP(
    () => {
      if (prefersReduced()) return;
      gsap.fromTo(
        "[data-tick]",
        { scaleY: 0.2, opacity: 0.25 },
        { scaleY: 1, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.012, overwrite: "auto" },
      );
      gsap.fromTo(
        "[data-seg]",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.75, ease: "power3.out", stagger: 0.05, overwrite: "auto" },
      );
    },
    { scope: root, dependencies: [unitId, pct] },
  );

  const waMsg = [
    "Hi Zee99 — I'd like to lock this plan:",
    `Zee99 Lifestyle — ${unit.name} (~${unit.area} sq ft)`,
    `Total price: ₨ ${fmtInt(plan.total)}`,
    ...rows.map((r) =>
      r.count > 1
        ? `${r.label}: ${r.count} × ₨ ${fmtInt(r.amount)} = ₨ ${fmtInt(r.total)}`
        : `${r.label}: ₨ ${fmtInt(r.amount)}`,
    ),
    `Handover: month ${handover}`,
  ].join("\n");

  return (
    <div ref={root} className="border border-ink/10 bg-paper shadow-[0_28px_80px_rgba(23,20,16,0.07)]">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 px-6 py-5 sm:px-9">
        <div>
          <p className="eyebrow text-ink">Choose how you pay</p>
          {(cfg.tenureLabel || cfg.handoverLabel) && (
            <p className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-2">
              {[cfg.tenureLabel, cfg.handoverLabel].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Unit type">
          {units.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setUnitId(u.id)}
              aria-pressed={unitId === u.id}
              className={cn(
                "rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-300",
                unitId === u.id ? "bg-ink text-paper" : "text-ink-2 hover:text-ink",
              )}
            >
              {u.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-10 lg:p-12">
        {/* live sentence */}
        <p className="max-w-3xl font-display text-[clamp(1.45rem,2.6vw,2.25rem)] font-[380] leading-[1.4] tracking-[-0.01em] text-ink">
          Pay <span className="text-gold">₨ {fmtInt(twDown)}</span> now, then{" "}
          <span className="text-gold">₨ {fmtInt(twMonthly)}</span> a month.{" "}
          <em className="italic">The keys are yours in month {handover}.</em>
        </p>
        <p className="mt-4 max-w-xl font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">
          {unit.name} · ~{unit.area} sq ft · total ₨ {pkrCompact(plan.total)}
        </p>

        {/* slider */}
        <div className="mt-12 max-w-xl">
          <p className="eyebrow mb-6">Down payment</p>
          <div className="relative px-2">
            <div className="absolute left-2 right-2 top-[7px] h-px bg-ink/15" />
            <div
              className="absolute top-[7px] h-px bg-gold-2 transition-all duration-500 ease-[var(--ease-out-expo)]"
              style={{ left: "8px", width: `calc(${at * 100}% - ${(at * 2 - 1) * 8}px)` }}
            />
            <div
              className="absolute top-0 h-[15px] w-[15px] -translate-x-1/2 rounded-full border-2 border-gold bg-paper shadow-[0_0_0_5px_rgba(194,157,85,0.18)] transition-[left] duration-500 ease-[var(--ease-out-expo)]"
              style={{ left: `calc(${at * 100}% + ${8 - at * 16}px)` }}
            />
            <div className="flex justify-between">
              {cfg.downOptions.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPct(p)}
                  aria-pressed={pct === p}
                  className="group flex w-10 flex-col items-center gap-4 first:items-start last:items-end"
                >
                  <span
                    className={cn(
                      "mt-[5px] h-[5px] w-[5px] rounded-full transition-colors duration-300",
                      pct === p ? "bg-gold" : "bg-ink/25 group-hover:bg-ink/50",
                    )}
                  />
                  <span
                    className={cn(
                      "font-mono text-[11px] tracking-[0.14em] transition-colors duration-300",
                      pct === p ? "text-ink" : "text-ink-2/70 group-hover:text-ink",
                    )}
                  >
                    {p}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* where the money goes */}
        <div className="mt-14">
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow">Where the money goes</p>
            <p className="font-mono text-[10px] tracking-[0.12em] text-ink-2">
              ₨ {fmtInt(plan.total)}
            </p>
          </div>
          <div className="mt-4 flex h-3 w-full overflow-hidden bg-ink/5">
            {rows.map((r, i) => (
              <span
                key={r.key}
                data-seg
                title={`${r.label} — ₨ ${fmtInt(r.total)}`}
                className="h-full origin-left"
                style={{
                  width: `${(r.total / plan.total) * 100}%`,
                  background: segColor(i),
                }}
              />
            ))}
          </div>
          <ul className="mt-5 grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r, i) => (
              <li key={r.key} className="flex items-baseline gap-2.5">
                <span
                  className="mt-[1px] h-[7px] w-[7px] shrink-0 rounded-full"
                  style={{ background: segColor(i) }}
                />
                <span className="min-w-0 flex-1 truncate text-[0.86rem] text-ink-2">
                  {r.label}
                  {r.count > 1 && (
                    <span className="ml-1.5 font-mono text-[9.5px] tracking-[0.1em] text-ink-2/70">
                      ×{r.count}
                    </span>
                  )}
                </span>
                <span className="font-mono text-[11px] tracking-[0.06em] text-ink">
                  {Math.round((r.total / plan.total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* timeline — fits within the viewport on mobile so page scroll is never trapped */}
        <div className="mt-14 pb-2 sm:overflow-x-auto" style={{ touchAction: "pan-y" }}>
          <div className="flex min-w-0 items-stretch gap-3 sm:min-w-[560px] sm:gap-5">
            <div className="shrink-0">
              <p className="eyebrow mb-3">Booking</p>
              <p className="font-mono text-[11px] tracking-[0.04em] text-ink sm:text-[13px] sm:tracking-[0.06em]">
                ₨ {fmtInt(plan.down)}
              </p>
              <span className="mt-3 block h-[9px] w-[9px] rounded-full bg-gold" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-end">
              <MilestoneMarkers rows={rows} months={plan.months} handover={handover} />
              <div
                className="grid items-end gap-[3px]"
                style={{ gridTemplateColumns: `repeat(${plan.months}, 1fr)` }}
              >
                {Array.from({ length: plan.months }, (_, i) => (
                  <span
                    key={i}
                    data-tick
                    className={cn(
                      "block w-full origin-bottom bg-ink/25",
                      (i + 1) % 6 === 0 ? "h-6 bg-ink/45" : "h-3.5",
                    )}
                  />
                ))}
              </div>
              <div
                className="mt-2 grid gap-[3px] font-mono text-[8.5px] tracking-[0.08em] text-ink-2/70"
                style={{ gridTemplateColumns: `repeat(${plan.months}, 1fr)` }}
              >
                {Array.from({ length: plan.months }, (_, i) => (
                  <span key={i} className="text-center">
                    {(i + 1) % 6 === 0 ? i + 1 : ""}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-center font-mono text-[9.5px] uppercase tracking-[0.26em] text-ink-2">
                {plan.months} × ₨ {fmtInt(plan.monthly)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="eyebrow mb-3 text-gold">Ownership</p>
              <p className="font-mono text-[11px] tracking-[0.04em] text-ink sm:text-[13px] sm:tracking-[0.06em]">
                Month {handover}
              </p>
              <svg viewBox="0 0 24 24" className="ml-auto mt-2 h-5 w-5 text-gold" fill="none" aria-hidden>
                <circle cx="8.5" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12.7 12h8.5M18 12v3.4M21.2 12v2.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* full schedule */}
        <div className="mt-14 border-t border-ink/10">
          <div className="flex items-baseline justify-between gap-4 py-5">
            <p className="eyebrow">The full schedule</p>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-2">
              {pct}% down
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] border-collapse text-left">
              <thead>
                <tr className="border-y border-ink/10 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-2">
                  <th className="py-3 pr-4 font-normal">Payment</th>
                  <th className="py-3 pr-4 text-right font-normal">Each</th>
                  <th className="py-3 pr-4 text-right font-normal">No.</th>
                  <th className="py-3 text-right font-normal">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="border-b border-ink/10">
                    <td className="py-3.5 pr-4 text-[0.9rem] text-ink">
                      {r.label}
                      <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-2/70">
                        {whenLabel(r)}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right font-mono text-[12.5px] tracking-[0.04em] text-ink-2">
                      {fmtInt(r.amount)}
                    </td>
                    <td className="py-3.5 pr-4 text-right font-mono text-[12.5px] text-ink-2">
                      {r.count}
                    </td>
                    <td className="py-3.5 text-right font-mono text-[12.5px] tracking-[0.04em] text-ink">
                      {fmtInt(r.total)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-4 pr-4 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink">
                    Total price
                  </td>
                  <td colSpan={2} />
                  <td className="py-4 text-right font-mono text-[13.5px] tracking-[0.05em] text-gold">
                    {fmtInt(plan.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* compare */}
        <button
          type="button"
          onClick={() => setCompare((c) => !c)}
          className="link-mono mt-8 text-ink hover:text-gold"
          aria-expanded={compare}
        >
          Compare all {cfg.downOptions.length} plans
          <span
            className={cn(
              "transition-transform duration-400 ease-[var(--ease-out-expo)]",
              compare && "rotate-45",
            )}
          >
            +
          </span>
        </button>
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-600 ease-[var(--ease-out-expo)]",
            compare ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="grid gap-3 pt-7 sm:grid-cols-3">
              {cfg.downOptions.map((p) => {
                const alt = planFor(unit, p, LIFESTYLE.plan);
                const on = p === pct;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPct(p)}
                    className={cn(
                      "border p-6 text-left transition-all duration-300",
                      on ? "border-gold-2 bg-paper-2/70" : "border-ink/10 hover:border-ink/30",
                    )}
                  >
                    <p className="flex items-baseline justify-between">
                      <span className="font-display text-[1.6rem] font-[400]">{p}%</span>
                      {on && (
                        <span className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-gold">
                          Selected
                        </span>
                      )}
                    </p>
                    <dl className="mt-5 space-y-2.5 font-mono text-[11px] tracking-[0.08em]">
                      <div className="flex justify-between gap-3">
                        <dt className="text-ink-2">Down</dt>
                        <dd>₨ {fmtInt(alt.down)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-ink-2">Monthly</dt>
                        <dd>₨ {fmtInt(alt.monthly)}</dd>
                      </div>
                      {alt.milestonesTotal > 0 && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-ink-2">Milestones</dt>
                          <dd>₨ {pkrCompact(alt.milestonesTotal)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between gap-3 border-t border-ink/10 pt-2.5">
                        <dt className="text-ink-2">Total</dt>
                        <dd>₨ {pkrCompact(alt.total)}</dd>
                      </div>
                    </dl>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-ink/10 pt-8">
          <p className="max-w-sm text-[11px] leading-[1.8] text-ink-2/85">
            The price is fixed. A smaller down payment only moves money into the
            monthly run — the structure, half-yearly and possession payments never
            change. Every plan is issued in writing at booking.
          </p>
          <Button external href={waLink(waMsg)} arrow>
            Lock this plan on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}

/** "Month 18" / "Months 6–36, every 6" — when a scheduled row is charged. */
function whenLabel(r: ScheduleRow): string {
  if (r.key === "booking") return "At booking";
  if (r.key === "monthly") return `Months 1–${r.count}`;
  if (r.count === 1) return `Month ${r.months[0]}`;
  const gap = r.months.length > 1 ? r.months[1] - r.months[0] : 0;
  return `Months ${r.months[0]}–${r.months[r.months.length - 1]}${gap ? `, every ${gap}` : ""}`;
}

/** Diamonds above the month track for every non-monthly payment. */
function MilestoneMarkers({
  rows,
  months,
  handover,
}: {
  rows: ScheduleRow[];
  months: number;
  handover: number;
}) {
  const marks = rows.flatMap((r, i) =>
    r.key === "booking" || r.key === "monthly"
      ? []
      : r.months.map((m) => ({ id: `${r.key}-${m}`, month: m, color: segColor(i), label: r.label })),
  );
  if (!marks.length) return null;
  return (
    <div className="relative mb-3 h-6">
      {marks.map((mk) => (
        <span
          key={mk.id}
          title={`${mk.label} — month ${mk.month}`}
          className="absolute bottom-0 h-[7px] w-[7px] -translate-x-1/2 rotate-45"
          style={{ left: `${(mk.month / months) * 100}%`, background: mk.color }}
        />
      ))}
      <span
        title={`Handover — month ${handover}`}
        className="absolute bottom-0 h-4 w-px -translate-x-1/2 bg-gold"
        style={{ left: `${(handover / months) * 100}%` }}
      />
    </div>
  );
}
