import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import Em from "@/components/ui/Em";
import InvestmentCalculator from "@/components/tools/InvestmentCalculator";
import Button from "@/components/ui/Button";
import { sectionOr, pageMeta } from "@/data/content";
import { WA } from "@/data/site";
import { LIFESTYLE } from "@/data/projects";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

type Head = { folio: string; title: string; lede: string; note: string };

// Fallbacks used until the matching D1 sections / page_seo rows exist, so the
// page renders and carries correct SEO regardless of a content pull.
const HEAD_FALLBACK: Head = {
  folio: "Payment planner",
  title: "Plan your *payment.*",
  lede: "Start from a monthly budget, or pick a unit. We’ll show you the plan to ownership — the down payment, the fixed monthly installments, and where Arcade’s published price history suggests the value could land at handover.",
  note: "The property price is fixed. A smaller down payment simply spreads the same total across larger installments — never a rupee more. Every schedule is issued in writing at booking and stays fixed for its full term.",
};

export const metadata: Metadata = pageMeta("/payment-planner", {
  title: "Payment Planner",
  description:
    "Plan your Zee99 Lifestyle purchase in Bahria Town Lahore. Enter a monthly budget or pick a unit to see the down payment, fixed installments, and total — no premium for paying less up front.",
});

export default function PaymentPlannerPage() {
  const head = sectionOr<Head>("payment-planner", "head", HEAD_FALLBACK);

  return (
    <div className="overflow-x-clip bg-paper pb-28 pt-36 md:pt-44">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Payment Planner", path: "/payment-planner" },
        ])}
      />
      <div className="container-x">
        <div className="max-w-3xl">
          <Reveal as="p" y={14} className="folio mb-9 text-ink-2">
            {head.folio}
          </Reveal>
          <SplitReveal
            as="h1"
            immediate
            className="font-display font-[340] text-[clamp(2.5rem,5.4vw,4.8rem)] leading-[1.02] tracking-[-0.025em] text-ink"
          >
            <Em text={head.title} />
          </SplitReveal>
          <Reveal delay={0.18} y={20}>
            <p className="mt-8 max-w-[42rem] text-[1.02rem] leading-[1.85] text-ink-2">
              {head.lede}
            </p>
          </Reveal>
        </div>

        <Reveal y={36} className="mt-16">
          <InvestmentCalculator defaultMode="budget" />
        </Reveal>

        {head.note && (
          <Reveal delay={0.1} className="mt-12 max-w-2xl">
            <p className="text-[0.95rem] leading-[1.85] text-ink-2">{head.note}</p>
          </Reveal>
        )}

        <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center gap-4">
          <Button href={`/projects/${LIFESTYLE.slug}#payment`} arrow>
            See the full payment plans
          </Button>
          <Button external href={WA.default} variant="outline">
            Ask us on WhatsApp
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
