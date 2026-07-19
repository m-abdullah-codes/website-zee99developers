"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReduced } from "@/lib/gsap";
import { fmtInt } from "@/lib/format";

type Props = {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
};

export default function Counter({ value, suffix = "", className, duration = 2 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReduced()) return;
      const state = { v: 0 };
      el.textContent = `0${suffix}`;
      gsap.to(state, {
        v: value,
        duration,
        ease: "power2.inOut",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = `${fmtInt(state.v)}${suffix}`;
        },
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className}>
      {fmtInt(value)}
      {suffix}
    </span>
  );
}
