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

export default function Featured() {
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
        <SectionHead
          no="02"
          label="Featured — Now booking"
          title={
            <>
              Zee99 <em className="italic text-gold">Lifestyle</em>
            </>
          }
        />
        <Reveal delay={0.15} className="lg:justify-self-end">
          <p className="max-w-md text-[1.02rem] leading-[1.85] text-ink-2">
            Eight storeys on a corner of Safari Block, facing the Safari Sports
            Complex. Studios, one-beds, and two-beds — each with a private
            terrace, owned outright in 36 months.
          </p>
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
            <StatusPill status="booking" label="Now booking" onImage />
          </div>
          <p className="absolute bottom-6 right-5 hidden font-mono text-[9px] uppercase tracking-[0.3em] text-paper/70 sm:right-8 md:block">
            Night elevation — Safari Block corner
          </p>
        </div>

        <div className="container-x">
          <Reveal
            y={40}
            className="relative z-10 -mt-16 max-w-2xl border border-ink/10 bg-paper p-8 shadow-[0_30px_90px_rgba(23,20,16,0.12)] sm:-mt-24 sm:p-12"
          >
            <p className="font-mono text-[10px] uppercase leading-[2.4] tracking-[0.26em] text-ink-2">
              Sector B, Bahria Town Lahore&ensp;·&ensp;Studio / 1 Bed / 2 Bed
              <br />
              <span className="text-gold">From ₨ 550,000 down — keys in 36 months</span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href="/projects/zee99-lifestyle" arrow>
                Explore the project
              </Button>
              <Button href="/projects/zee99-lifestyle#payment" variant="outline">
                See payment plans
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
