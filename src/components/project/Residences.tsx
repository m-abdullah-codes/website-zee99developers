"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { Unit } from "@/data/projects";
import { fmtInt } from "@/lib/format";

export default function Residences({ units }: { units: Unit[] }) {
  const [open, setOpen] = useState<Unit | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section id="residences" className="border-t border-ink/10 bg-paper py-24 md:py-32">
      <div className="container-x">
        <SectionHead
          no="02"
          label="The residences"
          title={
            <>
              Three ways <em className="italic text-gold">in.</em>
            </>
          }
          className="mb-16"
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {units.map((u, i) => (
            <Reveal
              key={u.id}
              delay={i * 0.1}
              className="group flex flex-col border border-ink/10 bg-paper p-8 transition-colors duration-500 hover:border-gold-2/60 sm:p-10"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-mono text-[12px] uppercase tracking-[0.3em] text-ink">
                  {u.name}
                </h3>
                <span className="font-mono text-[10px] tracking-[0.12em] text-ink-2">
                  ~{u.area} sq ft
                </span>
              </div>
              <p className="mt-8 font-display text-[2rem] font-[380] leading-none tracking-[-0.01em] text-ink">
                ₨ {fmtInt(u.down)}
                <span className="mt-2 block font-sans text-[0.8rem] font-normal tracking-normal text-ink-2">
                  down payment
                </span>
              </p>
              <p className="mt-6 border-t border-ink/10 pt-6 font-mono text-[13px] tracking-[0.06em] text-ink">
                {u.months} × ₨ {fmtInt(u.monthly)}
                <span className="ml-2 font-sans text-[0.8rem] text-ink-2">monthly</span>
              </p>
              <p className="mt-6 flex-1 text-[0.94rem] leading-[1.8] text-ink-2">{u.blurb}</p>
              <button
                type="button"
                onClick={() => setOpen(u)}
                className="link-mono mt-9 self-start text-ink hover:text-gold"
              >
                View floor plan
                <span aria-hidden>→</span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* floor plan modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={open ? `${open.name} floor plan` : undefined}
        className={cn(
          "fixed inset-0 z-[80] flex items-center justify-center p-5 transition-[opacity,visibility] duration-400",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        onClick={() => setOpen(null)}
      >
        <div className="absolute inset-0 bg-night/70 backdrop-blur-sm" />
        <div
          className={cn(
            "relative w-full max-w-3xl border border-ink/10 bg-paper shadow-2xl transition-transform duration-500 ease-[var(--ease-out-expo)]",
            open ? "scale-100" : "scale-[0.96]",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-ink">
              {open?.name} — floor plan
            </p>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="relative h-8 w-8"
            >
              <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ink" />
              <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-ink" />
            </button>
          </div>
          <div className="relative aspect-[4/3] bg-white">
            {open && (
              <Image
                src={open.floorPlan || "/images/projects/floor-plan.jpg"}
                alt={`${open.name} floor plan drawing`}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
              />
            )}
          </div>
          <p className="border-t border-ink/10 px-6 py-4 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-2">
            Indicative drawing · ~{open?.area} sq ft — final plans issued at booking
          </p>
        </div>
      </div>
    </section>
  );
}
