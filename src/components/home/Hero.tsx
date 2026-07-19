"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReduced } from "@/lib/gsap";
import { LogoMark } from "@/components/ui/Logo";
import { section as sectionData } from "@/data/content";

type HeroSection = {
  chipLabel: string;
  chipHref: string;
  coordsLine1: string;
  coordsLine2: string;
  introWordmark: string;
  introTagline: string;
  heroVideo?: string;
  heroPoster?: string;
};

export default function Hero() {
  const s = sectionData<HeroSection>("home", "hero");
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReduced();
      if (reduced) video.current?.pause();

      // Intro curtain — once per session.
      const seen = sessionStorage.getItem("z99-intro");
      if (seen || reduced) {
        gsap.set(overlay.current, { autoAlpha: 0 });
      } else {
        const tl = gsap.timeline({
          onComplete: () => sessionStorage.setItem("z99-intro", "1"),
        });
        tl.fromTo(
          "[data-intro-mark]",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" },
          0.15,
        )
          .fromTo(
            "[data-intro-word]",
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
            0.35,
          )
          .fromTo(
            "[data-intro-rule]",
            { scaleX: 0 },
            { scaleX: 1, duration: 0.8, ease: "power3.inOut" },
            0.3,
          )
          .to(
            overlay.current,
            { yPercent: -100, duration: 1, ease: "power4.inOut" },
            1.35,
          )
          .fromTo(
            frame.current,
            { scale: 1.08 },
            { scale: 1, duration: 1.6, ease: "power3.out" },
            1.4,
          )
          .set(overlay.current, { autoAlpha: 0 });
      }

      if (reduced) return;

      // Scroll exit: the video settles into a framed plate.
      gsap.fromTo(
        frame.current,
        { scale: 1, borderRadius: 0 },
        {
          scale: 0.93,
          borderRadius: 22,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "bottom 35%",
            scrub: true,
          },
        },
      );
      gsap.fromTo(
        "[data-hero-dim]",
        { opacity: 0 },
        {
          opacity: 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "bottom 40%",
            scrub: true,
          },
        },
      );
      ScrollTrigger.create({
        trigger: section.current,
        start: "bottom top",
        onEnter: () => video.current?.pause(),
        onLeaveBack: () => {
          video.current?.play().catch(() => {});
        },
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative h-[100svh] overflow-hidden bg-night">
      <div ref={frame} className="absolute inset-0 overflow-hidden will-change-transform">
        <video
          ref={video}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={s.heroPoster || "/images/home/featured-lifestyle.jpg"}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={s.heroVideo || "/media/hero.mp4"} type="video/mp4" />
        </video>
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-night/70 to-transparent" />
        <div data-hero-dim className="absolute inset-0 bg-night opacity-0" />
      </div>

      {/* bottom chrome */}
      <div className="container-x absolute inset-x-0 bottom-0 z-10 flex items-end justify-between pb-8">
        <p className="hidden font-mono text-[9px] uppercase leading-[2] tracking-[0.3em] text-paper/55 sm:block">
          {s.coordsLine1}
          <br />
          {s.coordsLine2}
        </p>
        <div className="absolute bottom-8 left-1/2 h-16 w-px -translate-x-1/2 overflow-hidden bg-paper/20">
          <span className="scroll-cue-dot absolute left-0 top-0 h-6 w-px bg-gold-3" />
        </div>
        <Link
          href={s.chipHref}
          className="group ml-auto mr-16 inline-flex items-center gap-3 rounded-full border border-paper/25 bg-night/40 px-5 py-3 font-mono text-[9px] uppercase tracking-[0.26em] text-paper backdrop-blur-md transition-colors duration-300 hover:border-gold-2/70 hover:text-gold-3 sm:mr-20"
        >
          <span className="pulse-dot h-[5px] w-[5px] rounded-full bg-gold-2" />
          {s.chipLabel}
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      {/* intro curtain */}
      <div
        ref={overlay}
        className="absolute inset-0 z-[75] flex flex-col items-center justify-center bg-paper text-ink"
      >
        <LogoMark data-intro-mark className="h-14 w-14" />
        <p
          data-intro-word
          className="mt-6 font-mono text-[12px] uppercase tracking-[0.5em] text-ink"
        >
          {s.introWordmark}
        </p>
        <span
          data-intro-rule
          className="mt-7 block h-px w-24 origin-center bg-gold-2"
        />
        <p className="absolute bottom-8 font-mono text-[9px] uppercase tracking-[0.3em] text-ink-2">
          {s.introTagline}
        </p>
      </div>
    </section>
  );
}
