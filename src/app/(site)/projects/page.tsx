import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import ProjectsGrid from "@/components/project/ProjectsGrid";
import Em from "@/components/ui/Em";
import { section, pageMeta } from "@/data/content";

export const metadata: Metadata = pageMeta("/projects");

type ProjectsHeader = { folio: string; title: string; lede: string };

export default function ProjectsPage() {
  const header = section<ProjectsHeader>("projects", "header");
  return (
    <div className="bg-paper pb-28 pt-36 md:pb-40 md:pt-48">
      <div className="container-x">
        <header className="mb-20 max-w-4xl md:mb-24">
          <Reveal as="p" y={14} className="folio mb-9 text-ink-2">
            {header.folio}
          </Reveal>
          <SplitReveal
            as="h1"
            immediate
            className="font-display font-[340] text-[clamp(2.8rem,6vw,5.6rem)] leading-[1.02] tracking-[-0.025em] text-ink"
          >
            <Em text={header.title} />
          </SplitReveal>
          <Reveal delay={0.25}>
            <p className="mt-9 max-w-xl text-[1.02rem] leading-[1.85] text-ink-2">
              {header.lede}
            </p>
          </Reveal>
        </header>
        <ProjectsGrid />
      </div>
    </div>
  );
}
