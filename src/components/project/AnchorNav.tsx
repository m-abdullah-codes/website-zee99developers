"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getLenis } from "@/components/motion/SmoothScroll";

export type AnchorItem = { id: string; label: string };

export default function AnchorNav({ items }: { items: AnchorItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -110, duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="On this page"
      style={{ top: "var(--nav-offset, 73px)" }}
      className="sticky z-40 border-y border-ink/10 bg-paper/88 backdrop-blur-xl transition-[top] duration-500 ease-[var(--ease-out-expo)]"
    >
      <div className="container-x flex gap-7 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => go(item.id)}
            className={cn(
              "shrink-0 whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.24em] transition-colors duration-300",
              active === item.id ? "text-gold" : "text-ink-2/75 hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
