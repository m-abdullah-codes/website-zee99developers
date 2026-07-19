import Image from "next/image";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import Em from "@/components/ui/Em";
import { section } from "@/data/content";

type PillarsSection = {
  label: string;
  title: string;
  items: { n: string; t: string; d: string; img: string; alt: string }[];
};

export default function Pillars() {
  const s = section<PillarsSection>("home", "pillars");
  return (
    <section className="border-t border-ink/10 bg-paper py-24 md:py-36">
      <div className="container-x">
        <SectionHead
          no="05"
          label={s.label}
          title={<Em text={s.title} />}
          className="mb-16"
        />
        <div>
          {s.items.map((p, i) => (
            <Reveal
              key={p.n}
              delay={i * 0.08}
              className="group grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-6 border-b border-ink/10 py-10 first:border-t sm:grid-cols-[auto_1fr_auto] md:gap-x-12 md:py-12"
            >
              <span className="self-start pt-2 font-mono text-[11px] tracking-[0.2em] text-gold">
                {p.n}
              </span>
              <div>
                <h3 className="font-display text-[clamp(1.5rem,2.7vw,2.35rem)] font-[400] leading-tight tracking-[-0.015em] text-ink transition-colors duration-300">
                  {p.t}
                </h3>
                <p className="mt-3 max-w-xl text-[0.98rem] leading-[1.8] text-ink-2">
                  {p.d}
                </p>
              </div>
              <div className="relative col-span-2 h-40 w-full overflow-hidden border border-ink/10 sm:col-span-1 sm:h-28 sm:w-28 md:h-36 md:w-36">
                <Image
                  src={p.img}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 144px"
                  className="object-cover transition-all duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.07] sm:grayscale sm:group-hover:grayscale-0"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
