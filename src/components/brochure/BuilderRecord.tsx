import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import Em from "@/components/ui/Em";
import { cn } from "@/lib/utils";
import { BUILDER } from "@/data/brochure";

/**
 * The record, placed after the price.
 *
 * The light brochure argues for putting it there rather than earlier, and it
 * is right: "who is asking me for 1.44 crore" only becomes an urgent question
 * once the figure has been seen.
 */
export default function BuilderRecord({ no = "10" }: { no?: string }) {
  return (
    <section id="builder" className="border-t border-ink/10 bg-paper-2/55 py-24 md:py-32">
      <div className="container-x">
        <SectionHead
          no={no}
          label="The builder"
          title={<Em text={BUILDER.title} />}
          className="mb-14"
        />

        <div className="grid gap-14 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="max-w-[46ch] font-display text-[clamp(1.15rem,1.9vw,1.45rem)] font-[380] leading-[1.55] tracking-[-0.01em] text-ink">
                {BUILDER.lede}
              </p>
            </Reveal>

            <Reveal delay={0.15} className="mt-11 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-4">
              {BUILDER.stats.map((s) => (
                <div key={s.label} className="bg-paper px-5 py-6">
                  <p className="font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-[360] leading-none tracking-[-0.03em] text-gold">
                    {s.n}
                    {s.unit && (
                      <span className="ml-1 font-sans text-[0.7rem] font-normal tracking-normal text-ink-2">
                        {s.unit}
                      </span>
                    )}
                  </p>
                  <p className="mt-3 font-mono text-[9px] uppercase leading-[1.6] tracking-[0.2em] text-ink-2">
                    {s.label}
                  </p>
                </div>
              ))}
            </Reveal>
          </div>

          {/* The track: delivered reads as complete, the current one is the
              only lit mark. */}
          <Reveal delay={0.1}>
            <ol className="border-t border-ink/15">
              {BUILDER.projects.map((p) => {
                const current = p.status === "Current";
                return (
                  <li
                    key={p.name}
                    className="grid grid-cols-[1.5rem_1fr] items-start gap-4 border-b border-ink/10 py-5"
                  >
                    <span
                      className={cn(
                        "mt-[0.5em] h-[9px] w-[9px] justify-self-center rounded-full border",
                        current
                          ? "border-gold bg-gold-2 shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-gold-2)_28%,transparent)]"
                          : "border-ink/30 bg-ink/25",
                      )}
                      aria-hidden
                    />
                    <span className="grid gap-1">
                      <span className="font-display text-[1.1rem] font-[480] leading-snug text-ink">
                        {p.name}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[9.5px] uppercase tracking-[0.2em]",
                          current ? "text-gold" : "text-ink-2",
                        )}
                      >
                        {p.status}
                      </span>
                      {p.note && (
                        <span className="text-[0.88rem] leading-[1.6] text-ink-2/85">{p.note}</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-14 border-t border-ink/10 pt-8">
          <p className="max-w-[68ch] text-[1rem] leading-[1.85] text-ink-2">{BUILDER.close}</p>
        </Reveal>
      </div>
    </section>
  );
}
