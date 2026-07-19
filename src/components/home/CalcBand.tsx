import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import InvestmentCalculator from "@/components/tools/InvestmentCalculator";

export default function CalcBand() {
  return (
    <section id="calculator" className="border-y border-ink/10 bg-paper-2/55 py-24 md:py-36">
      <div className="container-x">
        <SectionHead
          no="04"
          label="Run your numbers"
          title={
            <>
              What does your <em className="italic text-gold">budget</em> buy?
            </>
          }
          lede="Enter a monthly amount. We'll show you the unit, the plan, and what it's likely worth at handover."
          className="mb-16"
        />
        <Reveal y={36}>
          <InvestmentCalculator compact defaultMode="budget" />
        </Reveal>
      </div>
    </section>
  );
}
