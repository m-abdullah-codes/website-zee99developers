"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReduced } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  /** Play on mount instead of waiting for scroll. */
  immediate?: boolean;
};

/** Masked line-by-line reveal for display type. */
export default function SplitReveal({
  children,
  className,
  as: Tag = "h2",
  delay = 0,
  immediate = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el) return;
      if (prefersReduced()) {
        gsap.set(el, { visibility: "visible" });
        return;
      }
      const run = contextSafe!(() => {
        if (!el.isConnected) return;
        let split: SplitText | null = null;
        try {
          split = new SplitText(el, { type: "lines", mask: "lines" });
        } catch {
          gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, delay, visibility: "visible" });
          return;
        }
        gsap.set(el, { visibility: "visible" });
        gsap.from(split.lines, {
          yPercent: 115,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.085,
          delay,
          scrollTrigger: immediate
            ? undefined
            : { trigger: el, start: "top 88%", once: true },
          onComplete: () => split?.revert(),
        });
      });
      document.fonts.ready.then(run);
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} data-lines className={className}>
      {children}
    </Tag>
  );
}
