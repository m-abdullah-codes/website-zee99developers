"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ARCADE } from "@/data/projects";
import { crFmt, lacFmt } from "@/lib/format";
import { cn } from "@/lib/utils";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import Button from "@/components/ui/Button";
import PriceChart, { type PriceChartHandle } from "@/components/home/PriceChart";

const data = ARCADE.history!;

export default function TrackRecord() {
  const section = useRef<HTMLElement>(null);
  const pinInner = useRef<HTMLDivElement>(null);
  const chartWrap = useRef<HTMLDivElement>(null);
  const chart = useRef<PriceChartHandle>(null);
  const activeRef = useRef(-1);
  const [active, setActive] = useState(-1);

  const onProgress = (p: number) => {
    let idx = -1;
    for (let i = 0; i < data.length; i++) {
      if (p >= i / (data.length - 1) - 0.015) idx = i;
    }
    if (idx !== activeRef.current) {
      activeRef.current = idx;
      setActive(idx);
    }
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 1023.98px)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, reduced } = ctx.conditions as {
            desktop: boolean;
            reduced: boolean;
          };
          if (reduced) {
            chart.current?.setProgress(1);
            return;
          }
          if (desktop) {
            ScrollTrigger.create({
              trigger: section.current,
              start: "top top",
              end: "+=170%",
              pin: pinInner.current,
              anticipatePin: 1,
              onUpdate: (self) => chart.current?.setProgress(self.progress),
            });
          } else {
            const state = { p: 0 };
            ScrollTrigger.create({
              trigger: chartWrap.current,
              start: "top 80%",
              once: true,
              onEnter: () =>
                gsap.to(state, {
                  p: 1,
                  duration: 2.6,
                  ease: "power2.inOut",
                  onUpdate: () => chart.current?.setProgress(state.p),
                }),
            });
          }
        },
      );
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative overflow-hidden bg-night text-paper">
      <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[44%] lg:block">
        <Image
          src="/images/home/arcade-structure.jpg"
          alt=""
          fill
          sizes="44vw"
          className="object-cover opacity-[0.08] grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-night to-transparent" />
      </div>

      <div ref={pinInner} className="relative">
        <div className="container-x flex min-h-[100svh] flex-col justify-center py-24 lg:py-20">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
            <div>
              <Reveal as="p" y={14} className="folio mb-9 text-gold-3">
                03&ensp;—&ensp;Track record
              </Reveal>
              <SplitReveal
                as="h2"
                className="font-display font-[360] text-[clamp(2.6rem,4.8vw,4.6rem)] leading-[1.02] tracking-[-0.02em] text-paper"
              >
                The one you <em className="italic text-gold-3">missed.</em>
              </SplitReveal>
              <Reveal delay={0.15}>
                <p className="mt-8 max-w-[34rem] text-[1rem] leading-[1.85] text-paper/60">
                  In December 2024, a two-bed at Zee99 Arcade was 1.20 crore.
                  Today it&rsquo;s 1.61 crore. That&rsquo;s not luck — that&rsquo;s a
                  corner plot near the Eiffel Tower and a grey structure finished
                  in 8 months, when the market takes two years.
                </p>
              </Reveal>

              <Reveal delay={0.2} className="mt-10 max-w-[30rem]">
                <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 border-b border-paper/15 pb-3 font-mono text-[9px] uppercase tracking-[0.26em] text-paper/40">
                  <span>Booked / traded</span>
                  <span className="text-right">2 Bed</span>
                  <span className="text-right">1 Bed</span>
                </div>
                {data.map((row, i) => (
                  <div
                    key={row.label}
                    className={cn(
                      "grid grid-cols-[1.2fr_1fr_1fr] gap-3 border-b border-paper/10 py-3.5 font-mono text-[12.5px] tracking-[0.08em] transition-colors duration-500",
                      i <= active
                        ? i === data.length - 1
                          ? "text-gold-3"
                          : "text-paper"
                        : "text-paper/25",
                    )}
                  >
                    <span className="uppercase text-[11px] tracking-[0.18em]">
                      {row.label}
                    </span>
                    <span className="text-right">{crFmt(row.twoBed)}</span>
                    <span className="text-right">{lacFmt(row.oneBed)}</span>
                  </div>
                ))}
              </Reveal>

              <Reveal delay={0.25} className="mt-11">
                <Button href="/projects/zee99-lifestyle" variant="gold" arrow>
                  Don&rsquo;t miss the next one
                </Button>
              </Reveal>
            </div>

            <div ref={chartWrap}>
              <Reveal y={20}>
                <PriceChart ref={chart} data={data} onProgress={onProgress} />
                <p className="mt-6 font-mono text-[9px] uppercase leading-[2.1] tracking-[0.26em] text-paper/35">
                  Transfer record — dated entries, published as they happened.
                  Not a projection.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
