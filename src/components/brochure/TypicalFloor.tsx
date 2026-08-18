import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import Plate from "@/components/ui/Plate";
import Em from "@/components/ui/Em";
import { TYPICAL_FLOOR } from "@/data/brochure";

/**
 * The typical floor — the plate all six residential levels are.
 *
 * It sits ahead of the residences on purpose. "Three ways in" shows three
 * apartments as three products; this shows the floor they are cut out of, so
 * by the time a reader opens the studio they already know where it is, what it
 * looks out at, and what is on the other side of its wall.
 *
 * Carried over from the light brochure's `TypicalFloor.astro`, including its
 * one good idea: the facing split is a count of the plate, not a sentence
 * someone typed. Edit an apartment's facing in the dashboard and the two
 * numbers follow — they cannot drift out of agreement with the drawing.
 *
 * The apartments are not also listed row by row. The drawing letters every one
 * of them with its own area, so a table beside it would be the same eight
 * facts twice; the two counts say the thing the drawing does not say at a
 * glance, and stop there.
 */
export default function TypicalFloor({ no = "02" }: { no?: string }) {
  const units = TYPICAL_FLOOR.units;

  // Grouped in the order the facings first appear, so the dashboard's row
  // order decides which side of the split is which.
  const facings: { facing: string; ids: string[] }[] = [];
  for (const u of units) {
    const found = facings.find((f) => f.facing === u.facing);
    if (found) found.ids.push(u.id);
    else facings.push({ facing: u.facing, ids: [u.id] });
  }

  return (
    <section id="floor" className="border-t border-ink/10 bg-paper py-24 md:py-32">
      <div className="container-x">
        <SectionHead
          no={no}
          label="The typical floor"
          title={<Em text={TYPICAL_FLOOR.title} />}
          lede={TYPICAL_FLOOR.lede}
          className="mb-16"
        />

        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="min-w-0">
            <Reveal>
              <p className="max-w-[42ch] text-[1rem] leading-[1.85] text-ink-2">
                {TYPICAL_FLOOR.body}
              </p>
            </Reveal>

            {facings.length > 1 && (
              <Reveal
                delay={0.1}
                className="mt-10 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10"
              >
                {facings.map((f) => (
                  <div key={f.facing} className="bg-paper p-6 sm:p-7">
                    <p className="eyebrow mb-4 text-[9px]">Facing {f.facing.toLowerCase()}</p>
                    <p className="font-display text-[clamp(2.4rem,4.2vw,3.2rem)] font-[380] leading-none tracking-[-0.02em] text-gold">
                      {f.ids.length}
                    </p>
                    <p className="mt-4 font-mono text-[10px] tracking-[0.18em] text-ink-2">
                      {f.ids.join(" · ")}
                    </p>
                  </div>
                ))}
              </Reveal>
            )}

            <Reveal delay={0.15}>
              <p className="mt-9 max-w-[38ch] border-l-2 border-gold-2 pl-5 font-display text-[1.08rem] font-[400] italic leading-[1.65] text-ink-2">
                {TYPICAL_FLOOR.note}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="min-w-0 lg:sticky lg:top-28">
            <Plate
              src={TYPICAL_FLOOR.image}
              alt={TYPICAL_FLOOR.alt}
              ratio="aspect-square"
              fit="contain"
              sizes="(max-width: 1024px) 100vw, 55vw"
              caption={{ left: TYPICAL_FLOOR.caption, right: "Not to scale" }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
