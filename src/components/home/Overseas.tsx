import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import Button from "@/components/ui/Button";
import Plate from "@/components/ui/Plate";
import Marquee from "@/components/ui/Marquee";
import Em from "@/components/ui/Em";
import { WA } from "@/data/site";
import { section } from "@/data/content";

type OverseasSection = {
  label: string;
  title: string;
  lede: string;
  cities: { code: string; city: string; price: string }[];
  cta1Label: string;
  cta2Label: string;
  cta2Href: string;
  imageCaption: string;
  image?: string;
};

export default function Overseas() {
  const s = section<OverseasSection>("home", "overseas");
  return (
    <section className="bg-paper pb-24 md:pb-36">
      <Marquee speed={34} className="border-b border-ink/10 py-5">
        {s.cities.map(({ code, city, price }) => (
          <span
            key={city}
            className="flex items-center gap-4 pr-10 font-mono text-[11px] uppercase tracking-[0.26em] text-ink-2"
          >
            <span className="rounded-[3px] border border-ink/20 px-[7px] py-[3px] text-[8.5px] tracking-[0.18em] text-ink">
              {code}
            </span>
            {city}
            <span className="text-ink">{price}</span>
            <span className="ml-6 h-[4px] w-[4px] rotate-45 bg-gold-2" aria-hidden />
          </span>
        ))}
      </Marquee>

      <div className="container-x grid items-center gap-16 pt-20 md:pt-28 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionHead
            no="04"
            label={s.label}
            title={<Em text={s.title} />}
            lede={s.lede}
          />
          <Reveal delay={0.25} className="mt-11 flex flex-wrap items-center gap-4">
            <Button external href={WA.overseas} arrow>
              {s.cta1Label}
            </Button>
            <Button href={s.cta2Href} variant="outline">
              {s.cta2Label}
            </Button>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="lg:justify-self-end lg:w-[86%]">
          <Plate
            src={s.image || "/images/home/overseas.jpg"}
            alt="Zee99 hard hat and level over site drawings"
            ratio="aspect-[3/4]"
            parallax={7}
            zoom
            sizes="(max-width: 1024px) 90vw, 38vw"
            caption={{ left: s.imageCaption, right: "No. 07" }}
          />
        </Reveal>
      </div>
    </section>
  );
}
