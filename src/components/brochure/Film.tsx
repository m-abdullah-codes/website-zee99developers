"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import Em from "@/components/ui/Em";
import { cn } from "@/lib/utils";
import { FILM } from "@/data/brochure";

/**
 * The full tour, in the plate frame the drawings and renders use.
 *
 * The <video> is not in the document until someone asks for it. A 20MB file
 * with `preload="metadata"` still costs a request and a range read on load,
 * and most readers of a brochure scroll past a film without playing it — so
 * the poster is an <Image> until the first click, and the element that
 * replaces it carries `autoPlay`, which is what makes that click feel like a
 * play button rather than a loading screen.
 */
export default function Film({ no = "05" }: { no?: string }) {
  const [playing, setPlaying] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  return (
    <section id="film" className="border-t border-ink/10 bg-night py-24 text-paper md:py-32">
      <div className="container-x">
        <SectionHead
          no={no}
          label="The film"
          title={<Em text={FILM.title} emClass="italic text-gold-3" />}
          lede={FILM.lede}
          tone="night"
          className="mb-14"
        />

        <Reveal y={36}>
          <figure className="relative">
            <div
              ref={frame}
              className="group relative aspect-[16/9] overflow-hidden border border-paper/15 bg-night-2"
            >
              {playing ? (
                <video
                  src={FILM.src}
                  poster={FILM.poster}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  className="h-full w-full bg-night object-contain"
                >
                  Your browser cannot play this video.
                </video>
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label="Play the full tour"
                  className="absolute inset-0 block cursor-pointer"
                >
                  <Image
                    src={FILM.poster}
                    alt="Zee99 Lifestyle — the corner elevation, from the tour"
                    fill
                    sizes="(max-width: 1024px) 100vw, 90vw"
                    className="object-cover transition-transform duration-[1600ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-night/70 via-night/10 to-night/25" />

                  <span
                    className={cn(
                      "absolute left-1/2 top-1/2 grid h-[5.5rem] w-[5.5rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full",
                      "border border-paper/40 bg-night/35 backdrop-blur-md",
                      "transition-[background-color,border-color,transform] duration-500 ease-[var(--ease-out-expo)]",
                      "group-hover:scale-[1.08] group-hover:border-gold-3 group-hover:bg-gold-2",
                    )}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-1 h-6 w-6 fill-paper transition-colors duration-500 group-hover:fill-ink"
                      aria-hidden
                    >
                      <path d="M6 3.5 20 12 6 20.5Z" />
                    </svg>
                  </span>

                  <span className="absolute bottom-5 left-5 flex items-center gap-3 font-mono text-[9.5px] uppercase tracking-[0.24em] text-paper/85 sm:bottom-7 sm:left-7">
                    <span className="h-[5px] w-[5px] rounded-full bg-gold-2" />
                    Play the tour
                  </span>
                </button>
              )}
            </div>

            <figcaption className="flex items-center justify-between gap-4 border-x border-b border-paper/15 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.26em] text-paper/45">
              <span className="truncate">{FILM.captionLeft}</span>
              <span className="hidden shrink-0 sm:block">{FILM.captionRight}</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
