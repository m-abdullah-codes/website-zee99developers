import SplitReveal from "@/components/motion/SplitReveal";
import Reveal from "@/components/motion/Reveal";
import Em from "@/components/ui/Em";
import Logo from "@/components/ui/Logo";
import { CLOSING } from "@/data/brochure";
import { SITE } from "@/data/site";

/**
 * The end of the document.
 *
 * Where the project page closes with two buttons, this closes with a colophon.
 * The brochure is sent by someone — on WhatsApp, by email, hand to hand — so
 * the reader already has a way back to whoever sent it; what it owes them is
 * an identity and a date, not another place to click. The address and number
 * below are set as plain text on purpose: nothing on this page is a link.
 */
export default function Closing({ edition }: { edition: string }) {
  return (
    <section className="border-t border-paper/10 bg-night py-28 text-paper md:py-36">
      <div className="container-x flex flex-col items-center text-center">
        <SplitReveal
          as="h2"
          className="max-w-3xl font-display font-[350] text-[clamp(2.2rem,4.6vw,4.2rem)] leading-[1.06] tracking-[-0.02em] text-paper"
        >
          <Em text={CLOSING.title} emClass="italic text-gold-3" />
        </SplitReveal>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-8 max-w-md space-y-2">
            {CLOSING.lines.map((l) => (
              <p key={l} className="text-[1rem] leading-[1.85] text-paper/65">
                {l}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.25} className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {CLOSING.marks.map((m) => (
            <span
              key={m}
              className="rounded-full border border-paper/25 px-5 py-[9px] font-mono text-[9.5px] uppercase tracking-[0.28em] text-paper/75"
            >
              {m} approved
            </span>
          ))}
        </Reveal>

        <Reveal delay={0.3} className="mt-20 w-full border-t border-paper/12 pt-10">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between lg:text-left">
            <Logo tone="paper" />
            <div className="grid gap-1.5 font-mono text-[10px] uppercase leading-[1.9] tracking-[0.18em] text-paper/55">
              <p>{SITE.address}</p>
              <p>{SITE.phoneDisplay}</p>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-paper/45">
              E-brochure · {edition}
            </p>
          </div>
          <p className="mx-auto mt-10 max-w-[62ch] text-[0.86rem] leading-[1.8] text-paper/45">
            {CLOSING.colophon}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
