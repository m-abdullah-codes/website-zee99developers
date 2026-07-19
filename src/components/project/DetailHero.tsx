"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReduced } from "@/lib/gsap";
import SplitReveal from "@/components/motion/SplitReveal";
import Reveal from "@/components/motion/Reveal";
import StatusPill from "@/components/ui/StatusPill";
import type { Project } from "@/data/projects";

export default function DetailHero({ project }: { project: Project }) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReduced()) return;
      gsap.fromTo(
        "[data-hero-img]",
        { scale: 1.12 },
        { scale: 1, duration: 2, ease: "power3.out" },
      );
      gsap.fromTo(
        "[data-hero-img]",
        { yPercent: 0 },
        {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      className="relative flex h-[80svh] min-h-[560px] items-end overflow-hidden bg-night text-paper"
    >
      <div data-hero-img className="absolute inset-0 will-change-transform">
        <Image
          src={project.heroImage}
          alt={`${project.name} — ${project.location}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-night/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-night/85 via-night/30 to-transparent" />

      <div className="container-x relative pb-14 md:pb-20">
        <Reveal y={16} className="mb-7 flex flex-wrap items-center gap-3">
          <StatusPill status={project.status} label={project.statusLabel} onImage />
          <span className="rounded-full border border-paper/25 bg-night/50 px-4 py-[9px] font-mono text-[9.5px] uppercase tracking-[0.24em] text-paper/80 backdrop-blur-md">
            {project.location}
          </span>
        </Reveal>
        <SplitReveal
          as="h1"
          immediate
          className="font-display font-[340] text-[clamp(3rem,7.2vw,6.8rem)] leading-[0.98] tracking-[-0.025em] text-paper"
        >
          {project.name}
        </SplitReveal>
        {project.heroLine && (
          <Reveal delay={0.35}>
            <p className="mt-7 max-w-xl font-display text-[1.25rem] italic leading-[1.5] text-paper/80 sm:text-[1.4rem]">
              {project.heroLine}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
