"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReduced } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  /** Percent of element height drifted across the viewport pass. */
  strength?: number;
};

/** Wrap around an absolutely-filled image inside an overflow-hidden parent. */
export default function Parallax({ children, className, strength = 9 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReduced()) return;
      gsap.fromTo(
        el,
        { yPercent: -strength },
        {
          yPercent: strength,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "absolute", inset: 0, scale: `${1 + (strength * 2.2) / 100}` }}
    >
      {children}
    </div>
  );
}
