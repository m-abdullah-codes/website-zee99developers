"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { LIFESTYLE, DOWN_OPTIONS, type DownPct, type UnitId } from "@/data/projects";
import { CURRENCIES, CURRENCY_ORDER, type CurrencyCode } from "@/data/rates";
import { planFor, projectedRange, yieldPct } from "@/lib/pricing";
import { money, pkrCompact, pkrRange } from "@/lib/format";
import { useTweened } from "@/lib/hooks";
import { waLink } from "@/data/site";

type Mode = "unit" | "budget";

export default function InvestmentCalculator({
  compact = false,
  defaultMode = "unit",
  defaultUnit = "one-bed",
}: {
  compact?: boolean;
  defaultMode?: Mode;
  defaultUnit?: UnitId;
}) {
  const units = LIFESTYLE.units!;
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [unitId, setUnitId] = useState<UnitId>(defaultUnit);
  const [pct, setPct] = useState<DownPct>(20);
  const [cur, setCur] = useState<CurrencyCode>("PKR");
  const [budget, setBudget] = useState<string>("");

  const budgetPKR = useMemo(() => {
    const n = Number(budget.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) && n > 0 ? n * CURRENCIES[cur].pkrPerUnit : 0;
  }, [budget, cur]);

  const { unit, stretch } = useMemo(() => {
    if (mode === "unit") {
      return { unit: units.find((u) => u.id === unitId)!, stretch: false };
    }
    if (!budgetPKR) return { unit: units[0], stretch: false };
    const fits = units.filter((u) => planFor(u, pct).monthly <= budgetPKR);
    if (fits.length === 0) return { unit: units[0], stretch: true };
    return { unit: fits[fits.length - 1], stretch: false };
  }, [mode, unitId, budgetPKR, pct, units]);

  const plan = planFor(unit, pct);
  const range = projectedRange(plan.total, plan.months, LIFESTYLE.appreciation!);
  const yld = yieldPct(unit.rentEst, plan.total);

  const twMonthly = useTweened(plan.monthly);
  const twDown = useTweened(plan.down);
  const twTotal = useTweened(plan.total);

  const waMsg = [
    "Hi Zee99 — my numbers from the website:",
    "Project: Zee99 Lifestyle",
    `Unit: ${unit.name} (~${unit.area} sq ft)`,
    `Plan: ${pct}% down — ${money(plan.down, "PKR")} at booking, then ${plan.months} × ${money(plan.monthly, "PKR")}`,
    `Total: ₨ ${pkrCompact(plan.total)}`,
    `Projected at handover: ₨ ${pkrRange(range.low, range.high)}`,
    "Please confirm availability.",
  ].join("\n");

  return (
    <div className="border border-ink/10 bg-paper shadow-[0_28px_80px_rgba(23,20,16,0.07)]">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 px-6 py-5 sm:px-9">
        <p className="eyebrow text-ink">Run your numbers</p>
        <div className="flex items-center gap-1" role="group" aria-label="Currency">
          {CURRENCY_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCur(c)}
              className={cn(
                "rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] transition-colors duration-300",
                cur === c
                  ? "bg-ink text-paper"
                  : "text-ink-2 hover:text-ink",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
        {/* controls */}
        <div className="min-w-0 space-y-9 border-b border-ink/10 p-6 sm:p-9 lg:border-b-0 lg:border-r">
          <div className="flex gap-7">
            {(
              [
                ["unit", "Pick a unit"],
                ["budget", "Start from budget"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "relative pb-2 font-mono text-[10.5px] uppercase tracking-[0.22em] transition-colors duration-300",
                  mode === m ? "text-ink" : "text-ink-2/70 hover:text-ink",
                )}
              >
                {label}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-px w-full origin-left bg-gold transition-transform duration-500 ease-[var(--ease-out-expo)]",
                    mode === m ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            ))}
          </div>

          {mode === "unit" ? (
            <div className="grid gap-2.5">
              {units.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUnitId(u.id)}
                  className={cn(
                    "flex items-baseline justify-between border px-5 py-4 text-left transition-all duration-300",
                    unitId === u.id
                      ? "border-gold-2 bg-paper-2/70"
                      : "border-ink/10 hover:border-ink/30",
                  )}
                >
                  <span className="font-display text-[1.1rem] font-[420]">{u.name}</span>
                  <span className="font-mono text-[10.5px] tracking-[0.12em] text-ink-2">
                    ~{u.area} sq ft
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <label
                htmlFor="calc-budget"
                className="eyebrow mb-3 block"
              >
                Your monthly budget ({cur})
              </label>
              <input
                id="calc-budget"
                inputMode="numeric"
                placeholder={cur === "PKR" ? "e.g. 90,000" : "e.g. 350"}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full border-b border-ink/25 bg-transparent pb-3 font-mono text-[1.6rem] tracking-[0.04em] text-ink outline-none transition-colors placeholder:text-ink-2/40 focus:border-gold"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {units.map((u) => {
                  const m = planFor(u, pct).monthly / CURRENCIES[cur].pkrPerUnit;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setBudget(String(Math.ceil(m)))}
                      className="rounded-full border border-ink/15 px-3.5 py-1.5 font-mono text-[9.5px] tracking-[0.14em] text-ink-2 transition-colors hover:border-gold-2 hover:text-gold"
                    >
                      {u.name} · {money(planFor(u, pct).monthly, cur)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="eyebrow mb-3.5">Down payment</p>
            <div className="grid grid-cols-3 gap-2">
              {DOWN_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPct(p)}
                  className={cn(
                    "border py-3.5 font-mono text-[12px] tracking-[0.14em] transition-all duration-300",
                    pct === p
                      ? "border-gold-2 bg-paper-2/70 text-ink"
                      : "border-ink/10 text-ink-2 hover:border-ink/30",
                  )}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* results */}
        <div className="min-w-0 bg-paper-2/45 p-6 sm:p-9">
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow">Your plan, roughly.</p>
            <p className="font-mono text-[10px] tracking-[0.14em] text-ink-2">
              {unit.name} — Zee99 Lifestyle
            </p>
          </div>

          <p className="mt-7 font-display text-[clamp(2.3rem,3.6vw,3.3rem)] font-[380] leading-none tracking-[-0.01em] text-ink">
            {money(twMonthly, cur)}
            <span className="ml-3 font-sans text-[0.95rem] font-normal tracking-normal text-ink-2">
              / month × {plan.months}
            </span>
          </p>
          {stretch && (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
              Slightly above this budget — talk to us. Plans flex.
            </p>
          )}

          <dl className="mt-9 border-t border-ink/10">
            {[
              ["Down payment, at booking", money(twDown, cur)],
              [
                "Total investment",
                cur === "PKR"
                  ? `₨ ${pkrCompact(twTotal)}`
                  : money(twTotal, cur, { compact: true }),
              ],
            ].map(([k, v]) => (
              <div
                key={k as string}
                className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-4 sm:gap-6"
              >
                <dt className="text-[0.9rem] text-ink-2">{k}</dt>
                <dd className="font-mono text-[1.02rem] tracking-[0.05em] text-ink">{v}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-4 sm:gap-6">
              <dt className="text-[0.9rem] text-ink-2">Projected value at handover</dt>
              <dd className="text-right font-mono text-[1.02rem] tracking-[0.03em] text-gold">
                {cur === "PKR"
                  ? `₨ ${pkrRange(range.low, range.high)}`
                  : `${money(range.low, cur, { compact: true })} – ${money(range.high, cur, { compact: true })}`}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-4 sm:gap-6">
              <dt className="text-[0.9rem] text-ink-2">Est. rental yield</dt>
              <dd className="text-right font-mono text-[1.02rem] tracking-[0.03em] text-ink">
                {yld.toFixed(1)}%<span className="text-ink-2"> / yr · {money(unit.rentEst, cur)}/mo</span>
              </dd>
            </div>
          </dl>

          <p className="mt-6 text-[11px] leading-[1.8] text-ink-2/85">
            Projections are based on Zee99 Arcade&rsquo;s actual price history and
            current Bahria Town rental rates. Property values can fall as well as
            rise. This is a planning tool, not a promise.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button external href={waLink(waMsg)}>
              Send me this plan on WhatsApp
            </Button>
            {compact && (
              <Link
                href="/projects/zee99-lifestyle#payment"
                className="link-mono text-ink hover:text-gold"
              >
                Full payment plans →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
