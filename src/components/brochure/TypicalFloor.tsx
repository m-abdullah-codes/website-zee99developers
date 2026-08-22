import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import Plate from "@/components/ui/Plate";
import Em from "@/components/ui/Em";
import { TYPICAL_FLOOR } from "@/data/brochure";

/**
 * The typical floor — the plate all six residential levels are.
 *
 * It opens the residential half on purpose. The three plans below it show three
 * apartments as three products; this shows the floor they are cut out of, so by
 * the time a reader opens the studio they already know where it is, what it
 * looks out at, and what is on the other side of its wall.
 *
 * One line of copy and no more. This section used to carry a lede, a second
 * paragraph and an italic closing aside in a column beside the drawing — four
 * hundred words in front of the plans, which is four hundred words nobody
 * finishes on the way to a price. Everything they said the drawing already
 * says: it letters every apartment with its own area, its caption names the
 * levels and the corridor width, and the two counts beside it say the one thing
 * a glance at the plate does not.
 *
 * Those counts are still a count of the file rather than a sentence someone
 * typed. Edit an apartment's facing in the dashboard and the numbers follow —
 * they cannot drift out of agreement with the drawing they sit next to.
 */
export default function TypicalFloor({ no = "R1" }: { no?: string }) {
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
    <section id="floor" className="scroll-mt-24 border-t border-ink/10 bg-paper py-24 md:py-32">
      <div className="container-x">
        <SectionHead
          no={no}
          label="The typical floor"
          title={<Em text={TYPICAL_FLOOR.title} />}
          lede={TYPICAL_FLOOR.lede}
          className="mb-14"
        />

        {/* The drawing is the section, so it takes the wide column and the
            counts stack down the narrow one rather than sitting under a
            paragraph that is no longer there. */}
        <div className="grid items-start gap-10 lg:grid-cols-[0.58fr_1.42fr] lg:gap-14">
          {facings.length > 1 && (
            <Reveal className="order-2 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 lg:sticky lg:top-28 lg:order-1 lg:grid-cols-1">
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

          <Reveal delay={0.1} className="order-1 min-w-0 lg:order-2">
            <Plate
              src={TYPICAL_FLOOR.image}
              alt={TYPICAL_FLOOR.alt}
              ratio="aspect-square"
              fit="contain"
              sizes="(max-width: 1024px) 100vw, 62vw"
              caption={{ left: TYPICAL_FLOOR.caption, right: "Not to scale" }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
