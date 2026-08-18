import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import Em from "@/components/ui/Em";
import RoofRail from "@/components/brochure/RoofRail";
import { BUILDING } from "@/data/brochure";

/**
 * The roof, then the full register of what is in the building — and, kept
 * visibly apart, what is only across the road from it.
 *
 * The split is the whole point of the section. Amenity lists in this market
 * routinely fold a public hospital and a municipal park in beside the lift and
 * the generator; naming which is which is cheap to do and is the only reason
 * the first column is believable. So the two are set as one bordered panel cut
 * in half — ours on paper, theirs on a toned ground — rather than as two lists
 * that happen to sit next to each other.
 */
export default function Building({ no = "08" }: { no?: string }) {
  const total = BUILDING.inBuilding.groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <section id="building" className="border-t border-ink/10 bg-paper py-24 md:py-32">
      <div className="container-x">
        <SectionHead
          no={no}
          label="The building"
          title={<Em text={BUILDING.title} />}
          lede={BUILDING.lede}
          className="mb-12"
        />
      </div>

      <div className="container-x">
        {/* The rooftop renders are the only portrait assets in the set, so they
            run as a rail rather than a grid: tall frames moved sideways at every
            width, instead of three screens of stacked portrait on a phone. The
            cards are deliberately wider than a third of the rail, so the cut
            edge is visible at rest — which is what tells anyone it moves. */}
        <RoofRail />

        {/* ours / not ours — one panel, cut in two */}
        <div className="mt-16 grid gap-px border border-ink/10 bg-ink/10 lg:grid-cols-[1.4fr_1fr]">
          <div className="bg-paper p-7 sm:p-10">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink/15 pb-5">
              <h3 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-[420] leading-none tracking-[-0.015em] text-ink">
                {BUILDING.inBuilding.label}
              </h3>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-gold">
                {`${total} fitted & built in`}
              </p>
            </div>
            <p className="mt-5 max-w-[42ch] text-[0.95rem] leading-[1.75] text-ink-2">
              {BUILDING.inBuilding.note}
            </p>

            <div className="mt-9 grid gap-8 sm:grid-cols-2 sm:gap-x-10">
              {BUILDING.inBuilding.groups.map((g, i) => (
                <Reveal key={g.g} delay={i * 0.05} y={18}>
                  <p className="flex items-baseline gap-3 border-b border-ink/15 pb-2.5">
                    <span className="eyebrow text-[9px] text-ink">{g.g}</span>
                    <span className="font-mono text-[9px] tracking-[0.14em] text-ink-2/60">
                      {String(g.items.length).padStart(2, "0")}
                    </span>
                  </p>
                  <ul className="mt-1">
                    {g.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-baseline gap-3 border-b border-ink/10 py-2.5 text-[0.94rem] leading-snug text-ink-2"
                      >
                        <span
                          className="mt-[0.45em] h-[3px] w-[3px] shrink-0 rounded-full bg-gold-2"
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Not ours. Toned ground, quieter type, and it says so twice. */}
          <div className="flex flex-col bg-paper-2/70 p-7 sm:p-10">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink/15 pb-5">
              <h3 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-[420] leading-none tracking-[-0.015em] text-ink-2">
                {BUILDING.acrossRoad.label}
              </h3>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink-2/60">
                Not ours
              </p>
            </div>
            <p className="mt-5 max-w-[36ch] border-l-2 border-ink/15 pl-4 text-[0.9rem] leading-[1.7] text-ink-2/85">
              {BUILDING.acrossRoad.note}
            </p>
            <ul className="mt-8">
              {BUILDING.acrossRoad.items.map((item) => (
                <li
                  key={item}
                  className="border-b border-ink/10 py-2.5 text-[0.94rem] leading-snug text-ink-2/75"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-auto pt-8 font-mono text-[9px] uppercase leading-[1.9] tracking-[0.2em] text-ink-2/55">
              Every one of them within a few blocks — the drive times are in
              section 09.
            </p>
          </div>
        </div>

        <Reveal delay={0.1} className="mt-12 border-t border-ink/15 pt-9">
          <h3 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-[420] leading-none tracking-[-0.015em] text-ink">
            {BUILDING.serviced.head}
          </h3>
          <p className="mt-4 max-w-[62ch] text-[1rem] leading-[1.85] text-ink-2">
            {BUILDING.serviced.body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
