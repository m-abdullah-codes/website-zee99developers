"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReduced } from "@/lib/gsap";

/** Subtle magnet pull on hover — desktop pointers only. */
export default function Magnetic({
  children,
  className,
  pull = 0.32,
}: {
  children: ReactNode;
  className?: string;
  pull?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReduced()) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.9, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.9, ease: "elastic.out(1, 0.4)" });

      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * pull);
        yTo((e.clientY - (r.top + r.height / 2)) * pull);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className} style={{ display: "inline-block" }}>
      {children}
    </div>
  );
}
