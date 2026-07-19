import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/motion/Magnetic";
import { SITE, WA } from "@/data/site";

export default function ClosingCTA() {
  return (
    <section className="relative overflow-hidden border-b border-paper/10 bg-night text-paper">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/images/home/featured-lifestyle.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.16]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night via-night/75 to-night" />
        <div
          className="absolute left-1/2 top-1/2 h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(closest-side, rgba(194,157,85,0.5), transparent 70%)",
          }}
        />
      </div>

      <div className="container-x relative flex flex-col items-center py-32 text-center md:py-44">
        <Reveal as="p" y={14} className="folio mb-10 text-gold-3">
          08&ensp;—&ensp;Now booking
        </Reveal>
        <SplitReveal
          as="h2"
          className="max-w-4xl font-display font-[350] text-[clamp(2.8rem,6.4vw,5.9rem)] leading-[1.03] tracking-[-0.02em] text-paper"
        >
          The next one is booking{" "}
          <em className="italic text-gold-3">now.</em>
        </SplitReveal>
        <Reveal delay={0.18}>
          <p className="mx-auto mt-9 max-w-md text-[1.02rem] leading-[1.85] text-paper/60">
            Studios from ₨ 550,000 down. A ten-minute call will tell you if it
            fits.
          </p>
        </Reveal>
        <Reveal delay={0.28} className="mt-12 flex flex-wrap items-center justify-center gap-5">
          <Magnetic>
            <Button external href={WA.default} variant="gold" arrow>
              WhatsApp {SITE.phoneDisplay}
            </Button>
          </Magnetic>
          <Button external href={WA.siteVisit} variant="light">
            Book a site visit
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
