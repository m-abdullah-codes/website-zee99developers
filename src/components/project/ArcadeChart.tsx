"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReduced } from "@/lib/gsap";
import PriceChart, { type PriceChartHandle } from "@/components/home/PriceChart";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import Button from "@/components/ui/Button";
import type { PricePoint } from "@/data/projects";
import { crFmt, lacFmt } from "@/lib/format";

export default function ArcadeChart({ data }: { data: PricePoint[] }) {
  const section = useRef<HTMLElement>(null);
  const chart = useRef<PriceChartHandle>(null);

  useGSAP(
    () => {
      if (prefersReduced()) {
        chart.current?.setProgress(1);
        return;
      }
      const state = { p: 0 };
      ScrollTrigger.create({
        trigger: section.current,
        start: "top 65%",
        once: true,
        onEnter: () =>
          gsap.to(state, {
            p: 1,
            duration: 2.6,
            ease: "power2.inOut",
            onUpdate: () => chart.current?.setProgress(state.p),
          }),
      });
    },
    { scope: section },
  );

  return (
    <section id="chart" ref={section} className="bg-night py-24 text-paper md:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <Reveal as="p" y={14} className="folio mb-9 text-gold-3">
            The chart
          </Reveal>
          <SplitReveal
            as="h2"
            className="font-display font-[360] text-[clamp(2.3rem,4.2vw,3.9rem)] leading-[1.04] tracking-[-0.02em] text-paper"
          >
            34% — while it was <em className="italic text-gold-3">being built.</em>
          </SplitReveal>
          <Reveal delay={0.15}>
            <p className="mt-7 max-w-[32rem] text-[0.98rem] leading-[1.85] text-paper/60">
              Booked out at launch. The appreciation below belongs to the buyers
              of December 2024 — published entry by entry as units traded, not
              reconstructed afterwards.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-9 max-w-[28rem]">
            {data.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1.2fr_1fr_1fr] gap-3 border-b border-paper/10 py-3 font-mono text-[12px] tracking-[0.08em] ${
                  i === data.length - 1 ? "text-gold-3" : "text-paper/80"
                }`}
              >
                <span className="text-[10.5px] uppercase tracking-[0.18em]">{row.label}</span>
                <span className="text-right">{crFmt(row.twoBed)}</span>
                <span className="text-right">{lacFmt(row.oneBed)}</span>
              </div>
            ))}
          </Reveal>
          <Reveal delay={0.25} className="mt-10">
            <Button href="/projects/zee99-lifestyle" variant="gold" arrow>
              The next chart is open
            </Button>
          </Reveal>
        </div>
        <Reveal y={24}>
          <PriceChart ref={chart} data={data} />
          <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.26em] text-paper/35">
            Transfer record — not a projection
          </p>
        </Reveal>
      </div>
    </section>
  );
}
