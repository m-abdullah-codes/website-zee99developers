"use client";

import { useState } from "react";
import Fold from "@/components/ui/Fold";
import Reveal from "@/components/motion/Reveal";
import Em from "@/components/ui/Em";
import { cn } from "@/lib/utils";
import { SPEC } from "@/data/brochure";

/**
 * The fittings schedule, as eight rows that open, inside a section that folds.
 *
 * The light brochure prints this as a flat three-column table, which is the
 * right shape on a printed page and the wrong one here: eight rows of item /
 * specification / brand set at a readable size is a screen and a half of
 * material a reader scrolls past rather than reads. Folded, the whole
 * specification is one glance — and the row a buyer actually cares about
 * (the kitchen, usually) opens to the sentence that explains it.
 *
 * Closed rows still carry the item and the one-line spec, so nothing is hidden
 * behind an interaction: opening adds the brands and the why, it does not
 * reveal the fact that the row exists.
 */
export default function SpecList({ no = "06" }: { no?: string }) {
  const [open, setOpen] = useState<number>(0);

  return (
    <Fold
      id="specification"
      no={no}
      label="Specification"
      // The one section whose name is bigger than the folio it sits in: it is
      // what a reader is looking for when they come back to this document, and
      // at 10px it read as part of the numbering rather than as the heading.
      labelClassName="text-[13.5px] font-medium tracking-[0.26em] text-ink sm:text-[16px]"
      title={<Em text={SPEC.title} />}
      lede={SPEC.lede}
      peek={`${SPEC.rows.length} lines · every one names its brands`}
      className="bg-paper"
    >
      <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-24">
          <p className="max-w-[30ch] border-l-2 border-gold-2 pl-5 font-display text-[1.08rem] font-[400] italic leading-[1.65] text-ink-2">
            {SPEC.close}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="border-t border-ink/10">
            {SPEC.rows.map((row, i) => {
              const isOpen = open === i;
              return (
                <div key={row.item} className="border-b border-ink/10">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-baseline gap-5 py-6 text-left sm:gap-7"
                  >
                    <span className="font-mono text-[10px] tracking-[0.2em] text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-6">
                      <span
                        className={cn(
                          "font-display text-[1.2rem] font-[460] leading-snug tracking-[-0.01em] transition-colors duration-300 sm:w-[8.5rem] sm:shrink-0",
                          isOpen ? "text-ink" : "text-ink/80 group-hover:text-ink",
                        )}
                      >
                        {row.item}
                      </span>
                      <span className="text-[0.92rem] leading-[1.6] text-ink-2">{row.detail}</span>
                    </span>
                    <span
                      className={cn(
                        "relative mt-1.5 h-[13px] w-[13px] shrink-0 transition-transform duration-500 ease-[var(--ease-out-expo)]",
                        isOpen && "rotate-45",
                      )}
                      aria-hidden
                    >
                      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-ink-2 transition-colors group-hover:bg-ink" />
                      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink-2 transition-colors group-hover:bg-ink" />
                    </span>
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="pb-8 pl-[38px] sm:pl-[46px]">
                        <p className="max-w-xl text-[0.95rem] leading-[1.8] text-ink-2">
                          {row.note}
                        </p>
                        <ul className="mt-5 flex flex-wrap items-center gap-2">
                          {row.brands.map((b) => (
                            <li
                              key={b}
                              className="border border-ink/12 bg-paper-2/60 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-2"
                            >
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </Fold>
  );
}
