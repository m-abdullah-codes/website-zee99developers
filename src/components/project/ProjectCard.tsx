import Link from "next/link";
import Image from "next/image";
import StatusPill from "@/components/ui/StatusPill";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/projects";

export default function ProjectCard({
  project,
  big = false,
}: {
  project: Project;
  big?: boolean;
}) {
  const href = project.href ?? `/projects/${project.slug}`;
  return (
    <Link
      href={href}
      data-card
      className="group flex h-full w-full flex-col overflow-hidden border border-ink/10 bg-paper shadow-[0_20px_50px_-28px_rgba(23,20,16,0.38)] transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:shadow-[0_38px_72px_-30px_rgba(23,20,16,0.45)]"
    >
      <div
        className={cn(
          "relative overflow-hidden bg-paper-2",
          big ? "aspect-[4/5] sm:aspect-[16/9] lg:aspect-[2/1]" : "aspect-[3/2]",
        )}
      >
        <Image
          src={project.cardImage}
          alt={`${project.name} — ${project.location}`}
          fill
          sizes={big ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
          className="object-cover transition-transform duration-[1500ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-night/45 to-transparent" />
        <div className="absolute left-5 top-5 sm:left-6 sm:top-6">
          <StatusPill status={project.status} label={project.statusLabel} onImage />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
          <h3
            className={cn(
              "font-display font-[400] tracking-[-0.015em] text-ink transition-colors duration-300 group-hover:text-gold",
              big
                ? "text-[clamp(1.9rem,3.4vw,2.7rem)]"
                : "text-[clamp(1.5rem,2.4vw,1.9rem)]",
            )}
          >
            {project.name}
          </h3>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-2">
            {project.figures[0]}&ensp;·&ensp;{project.figures[1]}
          </p>
        </div>
        <p className="mt-3 max-w-2xl text-[0.95rem] leading-[1.75] text-ink-2">
          {project.short}
        </p>
        <span className="mt-auto inline-flex items-center gap-2.5 pt-7 font-mono text-[9.5px] uppercase tracking-[0.24em] text-ink-2 transition-colors duration-300 group-hover:text-gold">
          {project.href ? "See the record" : "See project"}
          <span className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
