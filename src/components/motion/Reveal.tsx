"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReduced } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  y?: number;
  duration?: number;
};

export default function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  y = 30,
  duration = 1.15,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReduced()) {
        gsap.set(el, { opacity: 1 });
        return;
      }
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} data-reveal className={className}>
      {children}
    </Tag>
  );
}
