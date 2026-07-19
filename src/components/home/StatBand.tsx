import Reveal from "@/components/motion/Reveal";
import Counter from "@/components/motion/Counter";
import { STATS } from "@/data/site";

export default function StatBand() {
  return (
    <section aria-label="The numbers" className="border-y border-ink/10 bg-paper">
      <div className="container-x grid grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.09}
            className={[
              "flex flex-col items-center gap-4 border-ink/10 px-3 py-12 text-center md:py-16",
              i % 2 === 0 ? "border-r" : "lg:border-r",
              i < 2 ? "border-b lg:border-b-0" : "",
              i === 3 ? "lg:border-r-0" : "",
            ].join(" ")}
          >
            <span className="font-display font-[380] text-[clamp(2.7rem,4.6vw,4.3rem)] leading-none tracking-[-0.02em] text-ink">
              <Counter value={s.value} />
              {s.suffix && <span className="text-gold-2">{s.suffix}</span>}
            </span>
            <span className="eyebrow">{s.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
