import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject } from "@/data/projects";
import SmoothScroll from "@/components/motion/SmoothScroll";
import DetailHero from "@/components/project/DetailHero";
import AnchorNav, { type AnchorItem } from "@/components/project/AnchorNav";
import Residences from "@/components/project/Residences";
import Amenities from "@/components/project/Amenities";
import UpdatesTimeline from "@/components/project/UpdatesTimeline";
import { CurrencyProvider } from "@/components/tools/Currency";
import Shopfront from "@/components/brochure/Shopfront";
import Film from "@/components/brochure/Film";
import SpecList from "@/components/brochure/SpecList";
import Building from "@/components/brochure/Building";
import BuilderRecord from "@/components/brochure/BuilderRecord";
import Closing from "@/components/brochure/Closing";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import Plate from "@/components/ui/Plate";
import Accordion from "@/components/ui/Accordion";
import Logo from "@/components/ui/Logo";

/**
 * The full e-brochure — /zee99lifestyle-e-brochure.
 *
 * It is the project page as a document. Same components, same type, same
 * plates, plus the five sections that only ever existed in the light brochure
 * (the specification, the roof, the amenity split, the shop-by-shop ledger and
 * the builder's record), and the full tour in place of the rental projection.
 *
 * Two rules hold the whole file together:
 *
 *   1. Nothing here is a link and nothing here is a call to action. It sits
 *      outside the (site) route group on purpose, so it inherits no header, no
 *      footer and no floating WhatsApp button, and every component that would
 *      normally carry a CTA is passed `noCta`. A brochure is forwarded and read
 *      away from the site; it should say everything it has to say on its own.
 *      The one frame that could still navigate away — the Google map — has its
 *      pointer events off for the same reason.
 *
 *   2. It reads the same D1-backed project the site does, so a price edited in
 *      the dashboard is right here on the next publish without anyone
 *      remembering this page exists.
 *
 * The light brochure that used to own this route is now at
 * /zee99lifestyle-e-brochure-lightweight (built from brochures/zee99lifestyle
 * by scripts/build-brochure.mjs).
 */

const SLUG = "zee99-lifestyle";

export const metadata: Metadata = {
  title: "Zee99 Lifestyle — e-brochure",
  description:
    "The full Zee99 Lifestyle brochure: the three plans and their schedules, the two retail floors shop by shop, the specification, the roof, the site and the builder's record.",
  alternates: { canonical: "/zee99lifestyle-e-brochure" },
  // A document, not a page to rank: nearly all of it also stands on
  // /projects/zee99-lifestyle, and two indexed copies of one building compete
  // with each other. The light brochure is noindex for the same reason.
  robots: { index: false, follow: false },
};

const ANCHORS: AnchorItem[] = [
  { id: "overview", label: "Overview" },
  { id: "residences", label: "Residences" },
  { id: "commercial", label: "Shops" },
  { id: "film", label: "The film" },
  { id: "specification", label: "Specification" },
  { id: "amenities", label: "Amenities" },
  { id: "building", label: "The building" },
  { id: "location", label: "Location" },
  { id: "updates", label: "Updates" },
  { id: "builder", label: "The builder" },
  { id: "faqs", label: "FAQs" },
];

export default function BrochurePage() {
  const project = getProject(SLUG);
  if (!project) notFound();

  const edition = project.updates?.[0]?.date ?? "Current edition";

  return (
    <>
      <noscript>
        <style>{`[data-reveal]{opacity:1!important}[data-lines]{visibility:visible!important}`}</style>
      </noscript>
      <SmoothScroll />

      <main>
        {/* cover — the hero, with the masthead the missing site header would
            otherwise have carried */}
        <div className="relative">
          <DetailHero project={project} />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
            <div className="container-x flex items-center justify-between gap-6 py-7">
              <Logo tone="paper" />
              <p className="hidden font-mono text-[9px] uppercase tracking-[0.28em] text-paper/60 sm:block">
                E-brochure · {edition}
              </p>
            </div>
          </div>
        </div>

        <AnchorNav items={ANCHORS} top="0px" />

        {/* 01 — overview */}
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
                <Reveal
                  delay={0.2}
                  className="mt-12 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-3"
                >
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
              <Reveal delay={0.15} className="lg:sticky lg:top-28">
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

        {/* One currency for the whole document: the plans, the shops and the
            shop ledger all follow whichever switch a reader touches first. */}
        <CurrencyProvider>
          {/* 02 */}
          <Residences
            units={project.units!}
            projectName={project.name}
            plan={project.plan}
            noCta
            lede="Open any residence for the interiors, the floor plan and the full payment schedule — every figure exactly as it is issued at booking."
          />

          {/* 03 */}
          <Shopfront no="03" />

          {/* 04 — the tour, in place of the rental projection the site runs here */}
          <Film no="04" />

          {/* 05 */}
          <SpecList no="05" />

          {/* 06 */}
          <Amenities items={project.amenities!} media={project.amenityMedia} no="06" />

          {/* 07 */}
          <Building no="07" />

          {/* 08 — location */}
          <section id="location" className="border-t border-ink/10 bg-paper py-24 md:py-32">
            <div className="container-x">
              <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                <div>
                  <Reveal as="p" y={14} className="folio mb-9 text-ink-2">
                    08&ensp;—&ensp;Location
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
                  <Reveal
                    delay={0.2}
                    className="mt-11 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10"
                  >
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
                    {/* Rendered, not navigable: a Google embed carries its own
                        links out, and nothing on this page leaves it. */}
                    <iframe
                      src={project.locationSec!.embed}
                      title={`${project.name} on Google Maps`}
                      loading="lazy"
                      tabIndex={-1}
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="pointer-events-none"
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

          {/* 09 */}
          <UpdatesTimeline updates={project.updates!} no="09" />

          {/* 10 */}
          <BuilderRecord no="10" />

          {/* 11 — faqs */}
          <section id="faqs" className="border-t border-ink/10 bg-paper-2/55 py-24 md:py-32">
            <div className="container-x grid items-start gap-14 lg:grid-cols-[0.75fr_1.25fr]">
              <SectionHead
                no="11"
                label="FAQs"
                title={
                  <>
                    Asked, <em className="italic text-gold">answered.</em>
                  </>
                }
                className="lg:sticky lg:top-28"
              />
              <Reveal>
                <Accordion items={project.faqs!.map((f) => ({ q: f.q, a: f.a }))} />
              </Reveal>
            </div>
          </section>
        </CurrencyProvider>

        <Closing edition={edition} />
      </main>
    </>
  );
}
