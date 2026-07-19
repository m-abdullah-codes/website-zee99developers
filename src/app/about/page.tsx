import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import SectionHead from "@/components/ui/SectionHead";
import Plate from "@/components/ui/Plate";
import Button from "@/components/ui/Button";
import Milestones from "@/components/about/Milestones";
import { SITE, waLink } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "We build in Bahria Town Lahore — and only in Bahria Town Lahore. Fifteen years, one address, every price on record.",
};

const BELIEFS = [
  { t: "Say it in writing.", d: "Every price, every date, on paper before you pay." },
  { t: "Build faster than promised.", d: "Speed is the cheapest insurance a buyer can get." },
  { t: "Show the site, not the brochure.", d: "Renders sell; concrete convinces." },
  { t: "Answer the phone.", d: "Ask anyone who's called us. Then call us." },
];

export default function AboutPage() {
  return (
    <>
      {/* opening */}
      <section className="bg-paper pt-36 md:pt-48">
        <div className="container-x">
          <header className="mb-16 max-w-4xl md:mb-20">
            <Reveal as="p" y={14} className="folio mb-9 text-ink-2">
              01&ensp;—&ensp;About
            </Reveal>
            <SplitReveal
              as="h1"
              immediate
              className="font-display font-[340] text-[clamp(2.9rem,6.4vw,6rem)] leading-[1.01] tracking-[-0.025em] text-ink"
            >
              Fifteen years. <em className="italic text-gold">One address.</em>
            </SplitReveal>
            <Reveal delay={0.25}>
              <p className="mt-9 max-w-2xl text-[1.05rem] leading-[1.85] text-ink-2">
                We build in Bahria Town Lahore — and only in Bahria Town Lahore.
                Not because we can&rsquo;t build elsewhere, but because depth
                beats spread. We know every block, every approval office, every
                price movement here since 2010.
              </p>
            </Reveal>
          </header>
        </div>
        <Reveal y={40}>
          <Plate
            src="/images/about/hero.jpg"
            alt="Aerial of Bahria Town Lahore — the Grand Mosque and surrounding blocks"
            ratio="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
            parallax={8}
            sizes="100vw"
            caption={{ left: "Bahria Town, Lahore — aerial", right: "The address" }}
            className="mx-auto w-full"
          />
        </Reveal>
      </section>

      {/* story */}
      <section id="story" className="bg-paper py-24 md:py-36">
        <div className="container-x grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-24">
          <Reveal as="p" y={14} className="folio text-ink-2 lg:sticky lg:top-36 lg:self-start">
            02&ensp;—&ensp;The story
          </Reveal>
          <div className="max-w-3xl">
            <Reveal>
              <p className="text-[1.12rem] leading-[2] text-ink/85">
                Zee99 started with single homes — built, finished, handed over.
                Homes became plazas. Plazas became high-rises. The method never
                changed: buy the corner, publish the price, build faster than
                promised.
              </p>
            </Reveal>
            <SplitReveal
              as="blockquote"
              className="my-14 border-l border-gold-2 pl-8 font-display text-[clamp(1.7rem,3vw,2.6rem)] font-[360] italic leading-[1.35] tracking-[-0.01em] text-ink"
            >
              &ldquo;Buy the corner. Publish the price. Build faster than
              promised.&rdquo;
            </SplitReveal>
            <Reveal>
              <p className="text-[1.12rem] leading-[2] text-ink/85">
                In 2025 that method got its clearest proof. Zee99 Arcade&rsquo;s
                grey structure went up in 8 months — a stage the market usually
                takes two years to reach — and its two-beds appreciated 34%
                before handover. The buyers who trusted the plan watched it
                happen in monthly photo updates.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 text-[1.12rem] leading-[2] text-ink/85">
                Zee99 Lifestyle is the same method,{" "}
                <em className="font-display italic">one block over.</em>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* beliefs */}
      <section className="border-y border-ink/10 bg-paper-2/55 py-24 md:py-32">
        <div className="container-x">
          <SectionHead
            no="03"
            label="What we believe"
            title={
              <>
                Four rules. <em className="italic text-gold">No fine print.</em>
              </>
            }
            className="mb-16"
          />
          <div>
            {BELIEFS.map((b, i) => (
              <Reveal
                key={b.t}
                delay={i * 0.06}
                className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 border-b border-ink/10 py-9 first:border-t md:grid-cols-[auto_1fr_1fr] md:gap-x-14"
              >
                <span className="font-mono text-[11px] tracking-[0.2em] text-gold">
                  0{i + 1}
                </span>
                <h3 className="font-display text-[clamp(1.6rem,3vw,2.5rem)] font-[390] leading-tight tracking-[-0.015em] text-ink transition-colors duration-400 group-hover:text-gold">
                  {b.t}
                </h3>
                <p className="col-start-2 max-w-md text-[0.96rem] leading-[1.8] text-ink-2 md:col-start-3 md:justify-self-end md:self-center">
                  {b.d}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* leadership */}
      <section className="bg-paper py-24 md:py-36">
        <div className="container-x grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <Reveal>
            <Plate
              src="/images/about/leadership.jpg"
              alt="Talha Rajput on site"
              ratio="aspect-[3/4]"
              parallax={6}
              zoom
              sizes="(max-width: 1024px) 90vw, 38vw"
              caption={{ left: "On site — not in a studio", right: "Portrait" }}
            />
          </Reveal>
          <div>
            <Reveal as="p" y={14} className="folio mb-9 text-ink-2">
              04&ensp;—&ensp;Leadership
            </Reveal>
            <SplitReveal
              as="h2"
              className="font-display font-[360] text-[clamp(2.3rem,4.4vw,4rem)] leading-[1.03] tracking-[-0.02em] text-ink"
            >
              Talha Rajput
            </SplitReveal>
            <Reveal delay={0.1}>
              <p className="eyebrow mt-5 text-gold">Chief Executive Officer</p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-8 max-w-xl text-[1.02rem] leading-[1.9] text-ink-2">
                Fifteen years in Bahria Town real estate — from the first single
                homes to Arcade&rsquo;s eight-month grey structure and the
                Lifestyle launch. His market analysis fills the notes our blog
                is known for.
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <p className="mt-10 border-l border-gold-2 pl-7 font-display text-[1.35rem] italic leading-[1.55] text-ink">
                &ldquo;If a developer won&rsquo;t put it in writing, they&rsquo;ve
                already told you everything.&rdquo;
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <Milestones />

      {/* closing */}
      <section className="border-t border-ink/10 bg-paper-2/55 py-28 md:py-36">
        <div className="container-x flex flex-col items-center text-center">
          <SplitReveal
            as="h2"
            className="max-w-3xl font-display font-[350] text-[clamp(2.5rem,5.2vw,4.8rem)] leading-[1.03] tracking-[-0.02em] text-ink"
          >
            Come see for <em className="italic text-gold">yourself.</em>
          </SplitReveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-8 max-w-md text-[1rem] leading-[1.85] text-ink-2">
              {SITE.address}. We&rsquo;d rather show you a site than a sales
              deck.
            </p>
          </Reveal>
          <Reveal delay={0.25} className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <Button external href={SITE.directionsUrl} arrow>
              Get directions
            </Button>
            <Button external href={waLink()} variant="outline">
              WhatsApp {SITE.phoneDisplay}
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
