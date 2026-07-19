import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import Em from "@/components/ui/Em";
import { section, pageMeta } from "@/data/content";

export const metadata: Metadata = pageMeta("/privacy");

type PrivacyHeader = { folio: string; title: string };
type PrivacySections = { items: { t: string; d: string }[] };

export default function PrivacyPage() {
  const header = section<PrivacyHeader>("privacy", "header");
  const { items } = section<PrivacySections>("privacy", "sections");

  return (
    <div className="bg-paper pb-28 pt-36 md:pt-48">
      <div className="container-x max-w-4xl">
        <Reveal as="p" y={14} className="folio mb-9 text-ink-2">
          {header.folio}
        </Reveal>
        <SplitReveal
          as="h1"
          immediate
          className="font-display font-[340] text-[clamp(2.6rem,5.4vw,4.8rem)] leading-[1.02] tracking-[-0.025em] text-ink"
        >
          <Em text={header.title} />
        </SplitReveal>
        <div className="mt-16">
          {items.map((s, i) => (
            <Reveal
              key={s.t}
              delay={i * 0.06}
              className="grid gap-3 border-b border-ink/10 py-9 first:border-t md:grid-cols-[0.6fr_1.4fr] md:gap-12"
            >
              <h2 className="font-display text-[1.35rem] font-[420] text-ink">{s.t}</h2>
              <p className="max-w-2xl text-[0.98rem] leading-[1.9] text-ink-2">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
