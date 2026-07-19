"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReduced } from "@/lib/gsap";

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReduced()) return;
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // New route: jump to top and re-measure triggers once layout settles.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return null;
}
