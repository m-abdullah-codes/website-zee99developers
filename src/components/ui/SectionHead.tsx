import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";

type Props = {
  no: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: "light" | "night";
  center?: boolean;
  className?: string;
  titleClassName?: string;
  ledeClassName?: string;
};

export default function SectionHead({
  no,
  label,
  title,
  lede,
  tone = "light",
  center = false,
  className,
  titleClassName,
  ledeClassName,
}: Props) {
  const night = tone === "night";
  return (
    <header className={cn(center && "flex flex-col items-center text-center", className)}>
      <Reveal
        className={cn(
          "folio mb-9",
          night ? "text-gold-3" : "text-ink-2",
        )}
        as="p"
        y={14}
      >
        {no}&ensp;—&ensp;{label}
      </Reveal>
      <SplitReveal
        as="h2"
        className={cn(
          "font-display font-[360] text-[clamp(2.5rem,5.2vw,4.9rem)] leading-[1.03] tracking-[-0.02em]",
          night ? "text-paper" : "text-ink",
          titleClassName,
        )}
      >
        {title}
      </SplitReveal>
      {lede && (
        <Reveal delay={0.18} y={20}>
          <p
            className={cn(
              "mt-8 max-w-[36rem] text-[1.02rem] leading-[1.85]",
              night ? "text-paper/65" : "text-ink-2",
              ledeClassName,
            )}
          >
            {lede}
          </p>
        </Reveal>
      )}
    </header>
  );
}
