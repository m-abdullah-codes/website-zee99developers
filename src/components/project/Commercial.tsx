"use client";

import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import Plate from "@/components/ui/Plate";
import Em from "@/components/ui/Em";
import CurrencySwitch, { useCurrency } from "@/components/tools/Currency";
import { commercialContent } from "@/data/commercial";
import type { Commercial as CommercialData } from "@/data/projects";
import { fmtInt, money } from "@/lib/format";
import { waLink } from "@/data/site";

/**
 * The retail floors, kept to what a buyer asks on the phone: how many shops,
 * how big, what a foot costs, where the smallest one starts — and the drawing.
 * The shop-by-shop ledger and live availability live in the e-brochure.
 */
export default function Commercial({
  data,
  projectName,
  no = "03",
}: {
  data?: CommercialData;
  projectName: string;
  no?: string;
}) {
  const c = commercialContent(data);
  const [cur, setCur] = useCurrency();
  if (!c.floors.length) return null;

  return (
    <section id="commercial" className="border-t border-ink/10 bg-paper py-24 md:py-32">
      <div className="container-x">
        <SectionHead
          no={no}
          label="Commercial"
          title={<Em text={c.title} />}
          lede={c.lede}
          className="mb-16"
        />

        <div className="grid gap-16 lg:gap-20">
          {c.floors.map((f, i) => (
            <Reveal
              key={f.id || f.name}
              delay={i * 0.05}
              className="grid items-start gap-8 border-t border-ink/10 pt-9 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14"
            >
              <div>
                <h3 className="font-display text-[clamp(1.6rem,2.6vw,2.15rem)] font-[400] leading-none tracking-[-0.015em] text-ink">
                  {f.name}
                </h3>
                <p className="mt-3.5 max-w-[26ch] text-[1rem] leading-[1.7] text-ink-2">{f.sub}</p>

                <dl className="mt-8 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10">
                  {[
                    ["Units", f.units],
                    ["Sizes", `${fmtInt(f.sqftFrom)}–${fmtInt(f.sqftTo)} sq ft`],
                    ["Rate", `${money(f.rate, cur)} / sq ft`],
                    ["From", money(f.priceFrom, cur, { compact: true })],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-paper p-5">
                      <dt className="eyebrow mb-3 text-[9px]">{k}</dt>
                      <dd className="font-display text-[1.05rem] font-[420] leading-snug text-ink">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {f.image && (
                <Plate
                  src={f.image}
                  alt={f.alt || `${f.name} floor plan — ${projectName}`}
                  ratio="aspect-square"
                  fit="contain"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  caption={{ left: `${f.name} floor plan`, right: "Not to scale" }}
                />
              )}
            </Reveal>
          ))}
        </div>

        {/* one split, every unit */}
        <Reveal delay={0.1} className="mt-16 border border-ink/10 bg-paper">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-ink/10 px-5 py-4 sm:px-7">
            <p className="eyebrow text-ink">Payment, identical on every unit</p>
            <CurrencySwitch value={cur} onChange={setCur} className="-my-1.5" />
          </div>
          <ol className="grid grid-cols-2 gap-px bg-ink/10 sm:grid-cols-3 lg:grid-cols-5">
            {c.split.map((s) => (
              <li key={s.label} className="bg-paper px-5 py-6">
                <p className="font-display text-[1.75rem] font-[380] leading-none text-gold">
                  {s.pct}%
                </p>
                <p className="mt-2.5 font-mono text-[9.5px] uppercase leading-[1.6] tracking-[0.18em] text-ink-2">
                  {s.label}
                </p>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-ink/10 px-5 py-4 sm:px-7">
            <p className="font-mono text-[9px] uppercase leading-[1.8] tracking-[0.18em] text-ink-2/80">
              {c.note}
            </p>
            <a
              href={waLink(
                `Hi Zee99 — I'm interested in a shop at ${projectName}. Please send availability and the schedule.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="link-mono text-ink hover:text-gold"
            >
              Ask about a shop
              <span aria-hidden>→</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
