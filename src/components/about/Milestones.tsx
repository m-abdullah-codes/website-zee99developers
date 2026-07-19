"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import Reveal from "@/components/motion/Reveal";
import Em from "@/components/ui/Em";
import type { MilestonesSection } from "@/app/(site)/about/page";

export default function Milestones({ data }: { data: MilestonesSection }) {
  const MILESTONES = data.items;
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const el = track.current!;
          const dist = () => el.scrollWidth - window.innerWidth + 160;
          gsap.to(el, {
            x: () => -dist(),
            ease: "none",
            scrollTrigger: {
              trigger: section.current,
              start: "top top",
              end: () => `+=${dist()}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });
          gsap.fromTo(
            "[data-progress]",
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                trigger: section.current,
                start: "top top",
                end: () => `+=${dist()}`,
                scrub: 0.6,
              },
            },
          );
        },
      );
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      className="overflow-hidden border-t border-ink/10 bg-paper"
      aria-label="Milestones"
    >
      <div className="flex min-h-0 flex-col justify-center py-24 md:py-28 lg:h-[100svh] lg:py-0">
        <div className="container-x mb-14 flex flex-wrap items-end justify-between gap-6 lg:mb-20">
          <div>
            <Reveal as="p" y={14} className="folio mb-8 text-ink-2">
              {data.folio}
            </Reveal>
            <h2 className="font-display font-[360] text-[clamp(2.3rem,4.4vw,4.2rem)] leading-none tracking-[-0.02em] text-ink">
              <Em text={data.title} />
            </h2>
          </div>
          <p className="hidden font-mono text-[9.5px] uppercase tracking-[0.26em] text-ink-2 lg:block">
            {data.hint}
          </p>
        </div>

        {/* desktop: horizontal track · mobile: vertical list */}
        <div className="relative">
          <div
            ref={track}
            className="flex flex-col gap-12 px-5 will-change-transform sm:px-8 lg:w-max lg:flex-row lg:gap-0 lg:px-14 xl:px-20"
          >
            {MILESTONES.map((m, i) => (
              <Reveal
                key={m.year}
                delay={i * 0.04}
                className="relative border-l border-ink/15 pl-7 lg:w-[26rem] lg:shrink-0 lg:border-l-0 lg:border-t lg:pl-0 lg:pr-16 lg:pt-10"
              >
                <span className="absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full border-2 border-gold bg-paper lg:-top-[5px] lg:left-0" />
                <p className="font-display text-[clamp(3rem,5vw,4.6rem)] font-[330] leading-none tracking-[-0.02em] text-ink">
                  {m.year}
                </p>
                <h3 className="mt-4 font-display text-[1.25rem] font-[430] leading-snug text-ink">
                  {m.t}
                </h3>
                <p className="mt-2.5 max-w-[19rem] text-[0.9rem] leading-[1.75] text-ink-2">
                  {m.d}
                </p>
              </Reveal>
            ))}
          </div>
          <div className="container-x mt-14 hidden lg:block">
            <div className="h-px w-full bg-ink/10">
              <div data-progress className="h-px origin-left scale-x-0 bg-gold-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
