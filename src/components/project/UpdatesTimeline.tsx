import Image from "next/image";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import type { Update } from "@/data/projects";

export default function UpdatesTimeline({
  updates,
  intro,
  no = "06",
}: {
  updates: Update[];
  intro?: string;
  no?: string;
}) {
  return (
    <section id="updates" className="border-t border-ink/10 bg-paper py-24 md:py-32">
      <div className="container-x">
        <SectionHead
          no={no}
          label="Construction updates"
          title={
            <>
              Watch it <em className="italic text-gold">rise.</em>
            </>
          }
          lede={intro ?? "We publish progress monthly, with dates. Hold us to it."}
          className="mb-16"
        />
        <div className="relative ml-2 border-l border-ink/15 pl-8 sm:ml-4 sm:pl-12">
          {updates.map((u, i) => (
            <Reveal key={u.date + u.title} delay={i * 0.05} className="relative pb-14 last:pb-0">
              <span className="absolute -left-[37px] top-[6px] h-[9px] w-[9px] rounded-full border-2 border-gold bg-paper sm:-left-[53px]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">
                {u.date}
              </p>
              <div className="mt-3 grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <h3 className="font-display text-[1.4rem] font-[420] leading-tight tracking-[-0.01em] text-ink">
                    {u.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-[0.95rem] leading-[1.8] text-ink-2">
                    {u.body}
                  </p>
                </div>
                {u.img && (
                  <div className="relative h-36 w-full overflow-hidden border border-ink/10 md:h-32 md:w-48">
                    <Image
                      src={u.img}
                      alt={`${u.date} — ${u.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 192px"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
