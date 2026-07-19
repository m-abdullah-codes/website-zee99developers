import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import SectionHead from "@/components/ui/SectionHead";
import Plate from "@/components/ui/Plate";
import Button from "@/components/ui/Button";
import Em from "@/components/ui/Em";
import Milestones from "@/components/about/Milestones";
import { SITE, waLink } from "@/data/site";
import { section, pageMeta } from "@/data/content";

export const metadata: Metadata = pageMeta("/about");

type Opening = {
  folio: string;
  title: string;
  body: string;
  heroImage: string;
  heroAlt: string;
  heroCaptionLeft: string;
  heroCaptionRight: string;
};
type Story = { folio: string; p1: string; quote: string; p2: string; p3: string };
type Beliefs = { label: string; title: string; items: { t: string; d: string }[] };
type Leadership = {
  folio: string;
  name: string;
  role: string;
  bio: string;
  quote: string;
  image: string;
  imageAlt: string;
  imageCaptionLeft: string;
  imageCaptionRight: string;
};
export type MilestonesSection = {
  folio: string;
  title: string;
  hint: string;
  items: { year: string; t: string; d: string }[];
};
type Closing = { title: string; body: string; cta1Label: string };

export default function AboutPage() {
  const opening = section<Opening>("about", "opening");
  const story = section<Story>("about", "story");
  const beliefs = section<Beliefs>("about", "beliefs");
  const leadership = section<Leadership>("about", "leadership");
  const milestones = section<MilestonesSection>("about", "milestones");
  const closing = section<Closing>("about", "closing");

  return (
    <>
      {/* opening */}
      <section className="bg-paper pt-36 md:pt-48">
        <div className="container-x">
          <header className="mb-16 max-w-4xl md:mb-20">
            <Reveal as="p" y={14} className="folio mb-9 text-ink-2">
              {opening.folio}
            </Reveal>
            <SplitReveal
              as="h1"
              immediate
              className="font-display font-[340] text-[clamp(2.9rem,6.4vw,6rem)] leading-[1.01] tracking-[-0.025em] text-ink"
            >
              <Em text={opening.title} />
            </SplitReveal>
            <Reveal delay={0.25}>
              <p className="mt-9 max-w-2xl text-[1.05rem] leading-[1.85] text-ink-2">
                {opening.body}
              </p>
            </Reveal>
          </header>
        </div>
        <Reveal y={40}>
          <Plate
            src={opening.heroImage}
            alt={opening.heroAlt}
            ratio="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
            parallax={8}
            sizes="100vw"
            caption={{ left: opening.heroCaptionLeft, right: opening.heroCaptionRight }}
            className="mx-auto w-full"
          />
        </Reveal>
      </section>

      {/* story */}
      <section id="story" className="bg-paper py-24 md:py-36">
        <div className="container-x grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-24">
          <Reveal as="p" y={14} className="folio text-ink-2 lg:sticky lg:top-36 lg:self-start">
            {story.folio}
          </Reveal>
          <div className="max-w-3xl">
            <Reveal>
              <p className="text-[1.12rem] leading-[2] text-ink/85">{story.p1}</p>
            </Reveal>
            <SplitReveal
              as="blockquote"
              className="my-14 border-l border-gold-2 pl-8 font-display text-[clamp(1.7rem,3vw,2.6rem)] font-[360] italic leading-[1.35] tracking-[-0.01em] text-ink"
            >
              &ldquo;{story.quote}&rdquo;
            </SplitReveal>
            <Reveal>
              <p className="text-[1.12rem] leading-[2] text-ink/85">{story.p2}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 text-[1.12rem] leading-[2] text-ink/85">
                <Em text={story.p3} emClass="font-display italic" />
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
            label={beliefs.label}
            title={<Em text={beliefs.title} />}
            className="mb-16"
          />
          <div>
            {beliefs.items.map((b, i) => (
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
              src={leadership.image}
              alt={leadership.imageAlt}
              ratio="aspect-[3/4]"
              parallax={6}
              zoom
              sizes="(max-width: 1024px) 90vw, 38vw"
              caption={{ left: leadership.imageCaptionLeft, right: leadership.imageCaptionRight }}
            />
          </Reveal>
          <div>
            <Reveal as="p" y={14} className="folio mb-9 text-ink-2">
              {leadership.folio}
            </Reveal>
            <SplitReveal
              as="h2"
              className="font-display font-[360] text-[clamp(2.3rem,4.4vw,4rem)] leading-[1.03] tracking-[-0.02em] text-ink"
            >
              {leadership.name}
            </SplitReveal>
            <Reveal delay={0.1}>
              <p className="eyebrow mt-5 text-gold">{leadership.role}</p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-8 max-w-xl text-[1.02rem] leading-[1.9] text-ink-2">
                {leadership.bio}
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <p className="mt-10 border-l border-gold-2 pl-7 font-display text-[1.35rem] italic leading-[1.55] text-ink">
                &ldquo;{leadership.quote}&rdquo;
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <Milestones data={milestones} />

      {/* closing */}
      <section className="border-t border-ink/10 bg-paper-2/55 py-28 md:py-36">
        <div className="container-x flex flex-col items-center text-center">
          <SplitReveal
            as="h2"
            className="max-w-3xl font-display font-[350] text-[clamp(2.5rem,5.2vw,4.8rem)] leading-[1.03] tracking-[-0.02em] text-ink"
          >
            <Em text={closing.title} />
          </SplitReveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-8 max-w-md text-[1rem] leading-[1.85] text-ink-2">
              {SITE.address}. {closing.body}
            </p>
          </Reveal>
          <Reveal delay={0.25} className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <Button external href={SITE.directionsUrl} arrow>
              {closing.cta1Label}
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
