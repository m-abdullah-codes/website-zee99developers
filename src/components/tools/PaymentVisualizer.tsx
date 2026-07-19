"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReduced } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { LIFESTYLE, DOWN_OPTIONS, type DownPct, type UnitId } from "@/data/projects";
import { planFor } from "@/lib/pricing";
import { fmtInt, pkrCompact } from "@/lib/format";
import { useTweened } from "@/lib/hooks";
import { waLink } from "@/data/site";

export default function PaymentVisualizer() {
  const units = LIFESTYLE.units!;
  const [unitId, setUnitId] = useState<UnitId>("studio");
  const [pct, setPct] = useState<DownPct>(20);
  const [compare, setCompare] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const unit = units.find((u) => u.id === unitId)!;
  const plan = planFor(unit, pct);
  const twDown = useTweened(plan.down);
  const twMonthly = useTweened(plan.monthly);
  const stopIdx = DOWN_OPTIONS.indexOf(pct);

  useGSAP(
    () => {
      if (prefersReduced()) return;
      gsap.fromTo(
        "[data-tick]",
        { scaleY: 0.2, opacity: 0.25 },
        {
          scaleY: 1,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.012,
          overwrite: "auto",
        },
      );
    },
    { scope: root, dependencies: [unitId, pct] },
  );

  const waMsg = [
    "Hi Zee99 — I'd like to lock this plan:",
    `Zee99 Lifestyle — ${unit.name}`,
    `${pct}% down: ₨ ${fmtInt(plan.down)} at booking`,
    `Then ${plan.months} × ₨ ${fmtInt(plan.monthly)} monthly`,
    `Total: ₨ ${pkrCompact(plan.total)}`,
  ].join("\n");

  return (
    <div ref={root} className="border border-ink/10 bg-paper shadow-[0_28px_80px_rgba(23,20,16,0.07)]">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 px-6 py-5 sm:px-9">
        <p className="eyebrow text-ink">Choose how you pay</p>
        <div className="flex gap-1" role="group" aria-label="Unit type">
          {units.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setUnitId(u.id)}
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
          <em className="italic">The keys are yours in month {plan.months}.</em>
        </p>

        {/* slider */}
        <div className="mt-12 max-w-xl">
          <p className="eyebrow mb-6">Down payment</p>
          <div className="relative px-2">
            <div className="absolute left-2 right-2 top-[7px] h-px bg-ink/15" />
            <div
              className="absolute top-[7px] h-px bg-gold-2 transition-all duration-500 ease-[var(--ease-out-expo)]"
              style={{ left: "8px", width: `calc(${stopIdx * 50}% - ${(stopIdx - 1) * 8}px)` }}
            />
            <div
              className="absolute top-0 h-[15px] w-[15px] -translate-x-1/2 rounded-full border-2 border-gold bg-paper shadow-[0_0_0_5px_rgba(194,157,85,0.18)] transition-[left] duration-500 ease-[var(--ease-out-expo)]"
              style={{ left: `calc(${stopIdx * 50}% + ${8 - stopIdx * 8}px)` }}
            />
            <div className="flex justify-between">
              {DOWN_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPct(p)}
                  aria-pressed={pct === p}
                  className="group flex w-10 -translate-x-0 flex-col items-center gap-4 first:items-start last:items-end"
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

        {/* timeline — fits within the viewport on mobile so page scroll is never trapped */}
        <div className="mt-12 pb-2 sm:overflow-x-auto" style={{ touchAction: "pan-y" }}>
          <div className="flex min-w-0 items-stretch gap-3 sm:min-w-[560px] sm:gap-5">
            <div className="shrink-0">
              <p className="eyebrow mb-3">Booking</p>
              <p className="font-mono text-[11px] tracking-[0.04em] text-ink sm:text-[13px] sm:tracking-[0.06em]">
                ₨ {fmtInt(plan.down)}
              </p>
              <span className="mt-3 block h-[9px] w-[9px] rounded-full bg-gold" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-end">
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
                Month {plan.months}
              </p>
              <svg viewBox="0 0 24 24" className="ml-auto mt-2 h-5 w-5 text-gold" fill="none" aria-hidden>
                <circle cx="8.5" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12.7 12h8.5M18 12v3.4M21.2 12v2.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* compare */}
        <button
          type="button"
          onClick={() => setCompare((c) => !c)}
          className="link-mono mt-10 text-ink hover:text-gold"
          aria-expanded={compare}
        >
          Compare all three plans
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
              {DOWN_OPTIONS.map((p) => {
                const alt = planFor(unit, p);
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
            Every plan is issued in writing at booking and stays fixed. No hidden
            charges at possession.
          </p>
          <Button external href={waLink(waMsg)} arrow>
            Lock this plan on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
