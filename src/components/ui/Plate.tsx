import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Parallax from "@/components/motion/Parallax";

type Props = {
  src: string;
  alt: string;
  /** Tailwind aspect class, e.g. "aspect-[16/9]". */
  ratio: string;
  caption?: { left: string; right?: string };
  parallax?: number;
  zoom?: boolean;
  priority?: boolean;
  sizes?: string;
  tone?: "light" | "night";
  className?: string;
  children?: ReactNode;
};

/**
 * Archive-plate image frame: hairline border + mono caption strip,
 * like a numbered drawing in a prospectus.
 */
export default function Plate({
  src,
  alt,
  ratio,
  caption,
  parallax,
  zoom,
  priority,
  sizes = "(max-width: 768px) 100vw, 60vw",
  tone = "light",
  className,
  children,
}: Props) {
  const night = tone === "night";
  const img = (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cn(
        "object-cover",
        zoom &&
          "transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.055]",
      )}
    />
  );

  return (
    <figure className={cn("relative", className)}>
      <div
        className={cn(
          "group relative overflow-hidden border",
          ratio,
          night ? "border-paper/15 bg-night-2" : "border-ink/10 bg-paper-2",
        )}
      >
        {parallax ? <Parallax strength={parallax}>{img}</Parallax> : img}
        {children}
      </div>
      {caption && (
        <figcaption
          className={cn(
            "flex items-center justify-between gap-4 border-x border-b px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.26em]",
            night
              ? "border-paper/15 text-paper/45"
              : "border-ink/10 text-ink-2/80",
          )}
        >
          <span className="truncate">{caption.left}</span>
          <span className="hidden shrink-0 sm:block">{caption.right ?? "ZEE99 · DWG SET"}</span>
        </figcaption>
      )}
    </figure>
  );
}
