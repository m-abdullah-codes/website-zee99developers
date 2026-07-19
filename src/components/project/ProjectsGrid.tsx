"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReduced } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { PROJECTS, type ProjectStatus } from "@/data/projects";
import ProjectCard from "@/components/project/ProjectCard";

type Filter = "all" | ProjectStatus;

const TABS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "booking", label: "Now Booking" },
  { id: "construction", label: "Under Construction" },
  { id: "delivered", label: "Delivered" },
];

export default function ProjectsGrid() {
  const [filter, setFilter] = useState<Filter>("all");
  const root = useRef<HTMLDivElement>(null);

  const list = PROJECTS.filter((p) => filter === "all" || p.status === filter);

  useGSAP(
    () => {
      if (prefersReduced()) return;
      gsap.fromTo(
        "[data-card]",
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.09,
          overwrite: "auto",
        },
      );
    },
    { scope: root, dependencies: [filter] },
  );

  return (
    <div ref={root}>
      <div className="mb-14 flex flex-wrap gap-2.5" role="group" aria-label="Filter projects">
        {TABS.map((t) => {
          const count = PROJECTS.filter(
            (p) => t.id === "all" || p.status === t.id,
          ).length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              aria-pressed={filter === t.id}
              className={cn(
                "rounded-full border px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
                filter === t.id
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/15 text-ink-2 hover:border-ink/40 hover:text-ink",
              )}
            >
              {t.label}
              <span className={cn("ml-2", filter === t.id ? "text-gold-3" : "text-gold")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid items-stretch gap-x-8 gap-y-10 md:grid-cols-2">
        {list.map((p) => {
          const big = p.status === "booking";
          return (
            <div key={p.slug} className={cn("flex", big && "md:col-span-2")}>
              <ProjectCard project={p} big={big} />
            </div>
          );
        })}
        {list.length === 0 && (
          <p className="col-span-full py-20 text-center font-mono text-[11px] uppercase tracking-[0.24em] text-ink-2">
            Nothing here yet.
          </p>
        )}
      </div>
    </div>
  );
}
