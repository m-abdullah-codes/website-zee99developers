"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import CurrencySwitch, { useCurrency } from "@/components/tools/Currency";
import { cn } from "@/lib/utils";
import { LIFESTYLE, type UnitId } from "@/data/projects";
import { unitTotal, yieldPct } from "@/lib/pricing";
import { money } from "@/lib/format";
import { waLink } from "@/data/site";

/**
 * What a residence earns once the keys are handed over — and nothing else.
 *
 * This is not the payment planner. The plans are printed in full in the
 * residences section above, so there is no down-payment stop and no budget
 * matching here: a unit's rent does not change with how you paid for it. The
 * calculator proper still lives on /payment-planner.
 */
export default function RentalReturn({ defaultUnit }: { defaultUnit?: UnitId }) {
  const units = LIFESTYLE.units!;
  const ui = LIFESTYLE.planner ?? {};
  const start = defaultUnit && units.some((u) => u.id === defaultUnit) ? defaultUnit : units[0].id;
  const [unitId, setUnitId] = useState<UnitId>(start);
  const [cur, setCur] = useCurrency();

  const unit = units.find((u) => u.id === unitId) ?? units[0];
  const total = unitTotal(unit);
  const yearly = unit.rentEst * 12;
  const yld = yieldPct(unit.rentEst, total);

  const waMsg = [
    "Hi Zee99 — about rental returns at Zee99 Lifestyle:",
    `Unit: ${unit.name} (~${unit.area} sq ft)`,
    `Expected rent: ${money(unit.rentEst, "PKR")}/month`,
    `That is ${yld.toFixed(1)}% a year against ${money(total, "PKR")}.`,
    "Can you share what comparable units are renting for?",
  ].join("\n");

  return (
    <div className="border border-ink/10 bg-paper shadow-[0_28px_80px_rgba(23,20,16,0.07)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 px-6 py-5 sm:px-9">
        <p className="eyebrow text-ink">What it earns</p>
        <CurrencySwitch value={cur} onChange={setCur} />
      </div>

      <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
        {/* pick a residence */}
        <div className="min-w-0 border-b border-ink/10 p-6 sm:p-9 lg:border-b-0 lg:border-r">
          <p className="eyebrow mb-5">Pick a residence</p>
          <div className="grid gap-2.5">
            {units.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setUnitId(u.id)}
                aria-pressed={unitId === u.id}
                className={cn(
                  "flex items-baseline justify-between gap-3 border px-5 py-4 text-left transition-all duration-300",
                  unitId === u.id
                    ? "border-gold-2 bg-paper-2/70"
                    : "border-ink/10 hover:border-ink/30",
                )}
              >
                <span className="font-display text-[1.1rem] font-[420]">{u.name}</span>
                <span className="text-right">
                  <span className="block font-mono text-[10.5px] tracking-[0.12em] text-ink-2">
                    ~{u.area} sq ft
                  </span>
                  <span className="mt-1 block font-mono text-[10.5px] tracking-[0.08em] text-gold">
                    {money(u.rentEst, cur)}/mo
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* what it returns */}
        <div className="min-w-0 bg-paper-2/45 p-6 sm:p-9">
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow">The return, roughly.</p>
            <p className="font-mono text-[10px] tracking-[0.14em] text-ink-2">Zee99 Lifestyle</p>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1.5 border-b border-ink/10 pb-6">
            <h3 className="font-display text-[1.7rem] font-[440] leading-none tracking-[-0.015em] text-ink">
              {unit.name}
            </h3>
            <span className="font-mono text-[10.5px] tracking-[0.12em] text-ink-2">
              ~{unit.area} sq ft
            </span>
          </div>

          <p className="mt-6 font-display text-[clamp(2.3rem,3.6vw,3.3rem)] font-[380] leading-none tracking-[-0.01em] text-gold">
            {money(unit.rentEst, cur)}
            <span className="mt-2.5 block font-sans text-[0.95rem] font-normal tracking-normal text-ink-2">
              expected rent, every month
            </span>
          </p>

          <dl className="mt-9 border-t border-ink/10">
            {[
              [ui.yieldLabel || "Est. rental yield", `${yld.toFixed(1)}% / yr`],
              ["A full year of rent", money(yearly, cur)],
              ["Against a total price of", money(total, cur, { compact: true })],
            ].map(([label, v]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-4 sm:gap-6"
              >
                <dt className="text-[0.9rem] text-ink-2">{label}</dt>
                <dd className="font-mono text-[1.02rem] tracking-[0.05em] text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-[11px] leading-[1.8] text-ink-2/85">
            Rents are current Bahria Town rates for a furnished unit of this size. Rental income
            is an estimate, not a guarantee, and depends on the market at handover.
          </p>

          <div className="mt-8">
            <Button external href={waLink(waMsg)}>
              Ask about rentals on WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
