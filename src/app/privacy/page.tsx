import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Zee99 Developers handles your information.",
};

const SECTIONS = [
  {
    t: "What we collect",
    d: "If you message us on WhatsApp or subscribe to the monthly note, we keep your name, contact details, and what you asked about. Nothing else — the website itself sets no marketing trackers.",
  },
  {
    t: "How we use it",
    d: "To answer your questions, send the payment plans you request, and — if you opt in — one useful market note a month. We don't sell, rent, or trade your details with anyone.",
  },
  {
    t: "How long we keep it",
    d: "For as long as we're talking, or as long as the law requires for booking records. Ask us to delete your details any time and we will.",
  },
  {
    t: "Talk to us",
    d: `Questions about your data — or anything else — reach us at ${SITE.email} or on WhatsApp at ${SITE.phoneDisplay}.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-paper pb-28 pt-36 md:pt-48">
      <div className="container-x max-w-4xl">
        <Reveal as="p" y={14} className="folio mb-9 text-ink-2">
          Privacy
        </Reveal>
        <SplitReveal
          as="h1"
          immediate
          className="font-display font-[340] text-[clamp(2.6rem,5.4vw,4.8rem)] leading-[1.02] tracking-[-0.025em] text-ink"
        >
          Plain terms, like our <em className="italic text-gold">prices.</em>
        </SplitReveal>
        <div className="mt-16">
          {SECTIONS.map((s, i) => (
            <Reveal
              key={s.t}
              delay={i * 0.06}
              className="grid gap-3 border-b border-ink/10 py-9 first:border-t md:grid-cols-[0.6fr_1.4fr] md:gap-12"
            >
              <h2 className="font-display text-[1.35rem] font-[420] text-ink">{s.t}</h2>
              <p className="max-w-2xl text-[0.98rem] leading-[1.9] text-ink-2">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
