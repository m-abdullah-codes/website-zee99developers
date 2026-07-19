"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReduced } from "@/lib/gsap";
import SectionHead from "@/components/ui/SectionHead";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import StatusPill from "@/components/ui/StatusPill";
import Em from "@/components/ui/Em";
import { section as sectionData } from "@/data/content";
import { LIFESTYLE } from "@/data/projects";

type FeaturedSection = {
  label: string;
  title: string;
  intro: string;
  imageCaption: string;
  cardLine1: string;
  cardLine2: string;
  cta1Label: string;
  cta2Label: string;
};

export default function Featured() {
  const s = sectionData<FeaturedSection>("home", "featured");
  const projectHref = `/projects/${LIFESTYLE.slug}`;
  const section = useRef<HTMLElement>(null);
  const clip = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReduced()) return;
      gsap.fromTo(
        clip.current,
        { clipPath: "inset(10% 5% 10% 5% round 22px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          ease: "none",
          scrollTrigger: {
            trigger: clip.current,
            start: "top 85%",
            end: "top 22%",
            scrub: true,
          },
        },
      );
    },
    { scope: section },
  );

  return (
    <section ref={section} className="bg-paper pt-28 md:pt-40">
      <div className="container-x mb-16 grid items-end gap-10 lg:grid-cols-[1.15fr_1fr]">
        <SectionHead no="02" label={s.label} title={<Em text={s.title} />} />
        <Reveal delay={0.15} className="lg:justify-self-end">
          <p className="max-w-md text-[1.02rem] leading-[1.85] text-ink-2">{s.intro}</p>
        </Reveal>
      </div>

      <div className="relative">
        <div ref={clip} className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/10] lg:aspect-[21/10]">
          <Parallax strength={8}>
            <Image
              src="/images/home/featured-lifestyle.jpg"
              alt="Zee99 Lifestyle at night — lit terraces and street-level retail on the corner"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </Parallax>
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-night/60 to-transparent" />
          <div className="absolute left-5 top-5 sm:left-8 sm:top-8">
            <StatusPill status="booking" label={LIFESTYLE.statusLabel} onImage />
          </div>
          <p className="absolute bottom-6 right-5 hidden font-mono text-[9px] uppercase tracking-[0.3em] text-paper/70 sm:right-8 md:block">
            {s.imageCaption}
          </p>
        </div>

        <div className="container-x">
          <Reveal
            y={40}
            className="relative z-10 -mt-16 max-w-2xl border border-ink/10 bg-paper p-8 shadow-[0_30px_90px_rgba(23,20,16,0.12)] sm:-mt-24 sm:p-12"
          >
            <p className="font-mono text-[10px] uppercase leading-[2.4] tracking-[0.26em] text-ink-2">
              {s.cardLine1}
              <br />
              <span className="text-gold">{s.cardLine2}</span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href={projectHref} arrow>
                {s.cta1Label}
              </Button>
              <Button href={`${projectHref}#payment`} variant="outline">
                {s.cta2Label}
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
