import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import Parallax from "@/components/motion/Parallax";

export default function Statement() {
  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-paper">
      {/* background photo with a soft paper wash so ink type stays crisp */}
      <div className="absolute inset-0">
        <Parallax strength={6}>
          <Image
            src="/images/home/opening-bg.jpg"
            alt="Brass inlay set into cast concrete"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </Parallax>
        <div className="absolute inset-0 bg-paper/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper/80 via-paper/75 to-paper/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-paper/25" />
      </div>

      <div className="container-x relative py-28 md:py-40">
        <div className="max-w-4xl">
          <Reveal as="p" y={14} className="folio mb-10 text-ink-2">
            01&ensp;—&ensp;The position
          </Reveal>
          <SplitReveal
            as="h1"
            className="font-display font-[340] text-[clamp(2.9rem,6.3vw,6.2rem)] leading-[1.02] tracking-[-0.025em] text-ink"
          >
            We don&rsquo;t sell dreams. We publish{" "}
            <em className="font-[380] italic text-gold">our numbers.</em>
          </SplitReveal>
          <Reveal delay={0.2}>
            <p className="mt-12 max-w-md text-[1.05rem] leading-[1.9] text-ink-2">
              Fifteen years of building in Bahria Town Lahore. Every project
              delivered. Every price on record.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link href="/projects" className="link-mono mt-10 text-ink hover:text-gold">
              See the record
              <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>
      </div>

      <p className="absolute bottom-7 right-6 hidden font-mono text-[9px] uppercase tracking-[0.3em] text-ink-2/70 md:block lg:right-20">
        Detail 01 — Brass on concrete
      </p>
    </section>
  );
}
