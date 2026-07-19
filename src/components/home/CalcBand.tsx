import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import InvestmentCalculator from "@/components/tools/InvestmentCalculator";
import Em from "@/components/ui/Em";
import { section } from "@/data/content";

type CalcBandSection = { label: string; title: string; lede: string };

export default function CalcBand() {
  const s = section<CalcBandSection>("home", "calc-band");
  return (
    <section id="calculator" className="border-y border-ink/10 bg-paper-2/55 py-24 md:py-36">
      <div className="container-x">
        <SectionHead
          no="04"
          label={s.label}
          title={<Em text={s.title} />}
          lede={s.lede}
          className="mb-16"
        />
        <Reveal y={36}>
          <InvestmentCalculator compact defaultMode="budget" />
        </Reveal>
      </div>
    </section>
  );
}
