"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Item = { q: string; a: React.ReactNode };

export default function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="border-t border-ink/10">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border-b border-ink/10">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="group flex w-full items-baseline gap-6 py-7 text-left"
            >
              <span className="font-mono text-[10px] tracking-[0.2em] text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "flex-1 font-display text-[1.25rem] leading-snug font-[420] transition-colors duration-300 sm:text-[1.45rem]",
                  isOpen ? "text-ink" : "text-ink/75 group-hover:text-ink",
                )}
              >
                {item.q}
              </span>
              <span
                className={cn(
                  "relative mt-1 h-[14px] w-[14px] shrink-0 transition-transform duration-500 ease-[var(--ease-out-expo)]",
                  isOpen && "rotate-45",
                )}
                aria-hidden
              >
                <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-ink" />
                <span className="absolute left-1/2 top-0 w-px h-full -translate-x-1/2 bg-ink" />
              </span>
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-8 pl-[42px] text-[0.98rem] leading-[1.85] text-ink-2">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
