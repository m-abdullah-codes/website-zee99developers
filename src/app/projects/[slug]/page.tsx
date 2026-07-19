import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, LIFESTYLE, ARCADE } from "@/data/projects";
import { SITE, WA, waLink } from "@/data/site";
import DetailHero from "@/components/project/DetailHero";
import AnchorNav, { type AnchorItem } from "@/components/project/AnchorNav";
import Residences from "@/components/project/Residences";
import Amenities from "@/components/project/Amenities";
import UpdatesTimeline from "@/components/project/UpdatesTimeline";
import ArcadeChart from "@/components/project/ArcadeChart";
import PaymentVisualizer from "@/components/tools/PaymentVisualizer";
import InvestmentCalculator from "@/components/tools/InvestmentCalculator";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import Plate from "@/components/ui/Plate";
import Button from "@/components/ui/Button";
import Accordion from "@/components/ui/Accordion";

export function generateStaticParams() {
  return [{ slug: LIFESTYLE.slug }, { slug: ARCADE.slug }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.short,
    openGraph: { images: [project.heroImage] },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const booking = project.status === "booking";
  const anchors: AnchorItem[] = booking
    ? [
        { id: "overview", label: "Overview" },
        { id: "residences", label: "Residences" },
        { id: "payment", label: "Payment" },
        { id: "returns", label: "Returns" },
        { id: "amenities", label: "Amenities" },
        { id: "location", label: "Location" },
        { id: "updates", label: "Updates" },
        { id: "faqs", label: "FAQs" },
      ]
    : [
        { id: "overview", label: "Overview" },
        { id: "chart", label: "The chart" },
        { id: "updates", label: "The log" },
      ];

  return (
    <>
      <DetailHero project={project} />
      <AnchorNav items={anchors} />

      {/* overview */}
      <section id="overview" className="bg-paper py-24 md:py-32">
        <div className="container-x grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <Reveal as="p" y={14} className="folio mb-9 text-ink-2">
              01&ensp;—&ensp;Overview
            </Reveal>
            <SplitReveal
              as="p"
              className="font-display text-[clamp(1.45rem,2.4vw,2rem)] font-[380] leading-[1.55] tracking-[-0.01em] text-ink"
            >
              {project.overview}
            </SplitReveal>
            {project.facts && (
              <Reveal delay={0.2} className="mt-12 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-3">
                {project.facts.map((f) => (
                  <div key={f.k} className="bg-paper p-5 sm:p-6">
                    <p className="eyebrow mb-3 text-[9px]">{f.k}</p>
                    <p className="font-display text-[1.05rem] font-[420] leading-snug text-ink">
                      {f.v}
                    </p>
                  </div>
                ))}
              </Reveal>
            )}
          </div>
          {project.overviewImage && (
            <Reveal delay={0.15} className="lg:sticky lg:top-36">
              <Plate
                src={project.overviewImage}
                alt={`${project.name} — corner elevation`}
                ratio="aspect-[3/2]"
                parallax={6}
                zoom
                sizes="(max-width: 1024px) 100vw, 45vw"
                caption={{ left: `${project.name} — corner elevation`, right: "Render" }}
              />
            </Reveal>
          )}
        </div>
      </section>

      {booking && project.units && (
        <>
          <Residences units={project.units} />

          {/* payment */}
          <section id="payment" className="border-t border-ink/10 bg-paper-2/55 py-24 md:py-32">
            <div className="container-x">
              <SectionHead
                no="03"
                label="Payment plans"
                title={
                  <>
                    Choose how you <em className="italic text-gold">pay.</em>
                  </>
                }
                lede="Slide the down payment. Watch the installments adjust. The full timeline to ownership, on one screen."
                className="mb-16"
              />
              <Reveal y={36}>
                <PaymentVisualizer />
              </Reveal>
            </div>
          </section>

          {/* returns */}
          <section id="returns" className="border-t border-ink/10 bg-paper py-24 md:py-32">
            <div className="container-x">
              <SectionHead
                no="04"
                label="Run your numbers"
                title={
                  <>
                    Then see what it <em className="italic text-gold">returns.</em>
                  </>
                }
                lede="Total investment, projected value at handover, and expected rental yield — based on Arcade's actual price history, not wishful thinking."
                className="mb-16"
              />
              <Reveal y={36}>
                <InvestmentCalculator defaultMode="unit" defaultUnit="studio" />
              </Reveal>
            </div>
          </section>

          <Amenities items={project.amenities!} />

          {/* location */}
          <section id="location" className="border-t border-ink/10 bg-paper py-24 md:py-32">
            <div className="container-x">
              <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                <div>
                  <Reveal as="p" y={14} className="folio mb-9 text-ink-2">
                    06&ensp;—&ensp;Location
                  </Reveal>
                  <SplitReveal
                    as="h2"
                    className="font-display font-[360] text-[clamp(2.2rem,4vw,3.7rem)] leading-[1.05] tracking-[-0.02em] text-ink"
                  >
                    {project.locationSec!.title}
                  </SplitReveal>
                  <Reveal delay={0.15}>
                    <p className="mt-7 max-w-lg text-[1rem] leading-[1.85] text-ink-2">
                      {project.locationSec!.body}
                    </p>
                  </Reveal>
                  <Reveal delay={0.2} className="mt-11 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10">
                    {project.locationSec!.distances.map((d) => (
                      <div key={d.t} className="bg-paper p-5">
                        <p className="font-display text-[1.5rem] font-[380] text-gold">{d.d}</p>
                        <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-2">
                          {d.t}
                        </p>
                      </div>
                    ))}
                  </Reveal>
                </div>
                <Reveal delay={0.1}>
                  <div className="map-frame aspect-[16/10] overflow-hidden border border-ink/10 lg:aspect-[16/12]">
                    <iframe
                      src={project.locationSec!.embed}
                      title={`${project.name} on Google Maps`}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                  <p className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.24em] text-ink-2/80">
                    <span>Safari Block — Sector B</span>
                    <span>31.3865° N, 74.1922° E</span>
                  </p>
                </Reveal>
              </div>
            </div>
          </section>

          <UpdatesTimeline updates={project.updates!} no="07" />

          {/* faqs */}
          <section id="faqs" className="border-t border-ink/10 bg-paper-2/55 py-24 md:py-32">
            <div className="container-x grid items-start gap-14 lg:grid-cols-[0.75fr_1.25fr]">
              <SectionHead
                no="08"
                label="FAQs"
                title={
                  <>
                    Asked, <em className="italic text-gold">answered.</em>
                  </>
                }
                className="lg:sticky lg:top-36"
              />
              <Reveal>
                <Accordion items={project.faqs!.map((f) => ({ q: f.q, a: f.a }))} />
              </Reveal>
            </div>
          </section>
        </>
      )}

      {!booking && project.history && <ArcadeChart data={project.history} />}
      {!booking && project.updates && (
        <UpdatesTimeline
          updates={project.updates}
          no="03"
          intro="The log as we published it — dated, in order, from launch to handover."
        />
      )}

      {/* closing */}
      <section className="border-t border-ink/10 bg-paper py-28 md:py-36">
        <div className="container-x flex flex-col items-center text-center">
          <SplitReveal
            as="h2"
            className="max-w-3xl font-display font-[350] text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.04] tracking-[-0.02em] text-ink"
          >
            {booking ? (
              <>
                See it before you <em className="italic text-gold">decide.</em>
              </>
            ) : (
              <>
                This one&rsquo;s sold. The next corner is{" "}
                <em className="italic text-gold">open.</em>
              </>
            )}
          </SplitReveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-8 max-w-md text-[1rem] leading-[1.85] text-ink-2">
              {booking
                ? "The site is a five-minute drive from our office. Come stand on the corner."
                : "Zee99 Lifestyle is one block over, on the same method — corner plot, published plan, monthly photos."}
            </p>
          </Reveal>
          <Reveal delay={0.25} className="mt-11 flex flex-wrap items-center justify-center gap-4">
            {booking ? (
              <>
                <Button external href={WA.siteVisit} arrow>
                  Book a site visit
                </Button>
                <Button external href={waLink()} variant="outline">
                  WhatsApp {SITE.phoneDisplay}
                </Button>
              </>
            ) : (
              <>
                <Button href="/projects/zee99-lifestyle" arrow>
                  Explore Zee99 Lifestyle
                </Button>
                <Button external href={waLink()} variant="outline">
                  WhatsApp {SITE.phoneDisplay}
                </Button>
              </>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
