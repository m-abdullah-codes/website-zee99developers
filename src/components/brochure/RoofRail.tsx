"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import { prefersReduced } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { BUILDING } from "@/data/brochure";

/**
 * The rooftop renders, as a rail you can actually move.
 *
 * Three things had to be built rather than left to the browser:
 *
 *   1. `data-lenis-prevent`. Lenis calls preventDefault on every wheel event on
 *      the page, including the horizontal component of a trackpad swipe — so a
 *      native overflow-x container inside it cannot be scrolled with a wheel or
 *      a trackpad at all. The attribute hands events inside this element back.
 *
 *   2. Mouse drag. The hint said "drag" and dragging did nothing: a native
 *      scroller is dragged by touch only. Pointer events are wired up for mice,
 *      and left alone for touch, where the browser already does it better than
 *      any handler would.
 *
 *   3. Arrows and a progress rule. A cut-off card at the right edge is the only
 *      affordance a bare scroller has, and on a desktop with no visible
 *      scrollbar that is not enough to tell anyone the rail moves.
 */
export default function RoofRail() {
  const rail = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  /** One card plus its gap — the arrows move by a frame, not by a viewport. */
  const step = () => {
    const el = rail.current;
    const first = el?.firstElementChild as HTMLElement | undefined;
    if (!el || !first) return 0;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    return first.offsetWidth + gap;
  };

  const go = (dir: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * step(), behavior: prefersReduced() ? "auto" : "smooth" });
  };

  // Mouse drag only. Touch scrolls natively, and taking that over costs the
  // browser's own momentum and its handover to a vertical page scroll.
  //
  // `active` is a ref, not the `dragging` state, on purpose: the first
  // pointermove arrives before React has committed the state set on
  // pointerdown, so a state guard drops the opening pixels of every drag — and
  // with a short flick, all of them. The state is only there to drive classes.
  const drag = useRef({ active: false, x: 0, left: 0 });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = rail.current;
    if (!el) return;
    drag.current = { active: true, x: e.clientX, left: el.scrollLeft };
    setDragging(true);
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = rail.current;
    if (!drag.current.active || !el) return;
    e.preventDefault();
    el.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
    if (rail.current?.hasPointerCapture?.(e.pointerId)) {
      rail.current.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div className="relative">
      <div
        ref={rail}
        onScroll={measure}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        data-lenis-prevent
        role="group"
        aria-label="Rooftop renders"
        tabIndex={0}
        className={cn(
          "grid grid-flow-col gap-4 overflow-x-auto pb-3 outline-none sm:gap-6",
          // Card widths are what make this a rail rather than a row that
          // happens to overflow. At a third each, three renders came within
          // 74px of fitting a 1440 desktop — the arrows moved almost nothing
          // and the drag felt broken. At 44% there is a full card of travel at
          // every width, and the renders are half again as large.
          "[grid-auto-columns:82%] sm:[grid-auto-columns:58%] lg:[grid-auto-columns:44%]",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "focus-visible:ring-1 focus-visible:ring-gold",
          // Snap is turned off mid-drag: mandatory snapping fights a pointer
          // that is still moving, and the rail stutters under the cursor.
          dragging
            ? "cursor-grabbing select-none [scroll-snap-type:none]"
            : "snap-x snap-mandatory lg:cursor-grab",
        )}
      >
        {BUILDING.roof.map((r, i) => (
          <Reveal key={r.image} delay={i * 0.08} className="snap-center">
            <figure className="group">
              {/* 5/7 rather than the source's 4/7: at 44% of the rail a full
                  4/7 frame runs past 750px tall and the section turns into a
                  wall. The crop is centred, which is where all three renders
                  keep their subject. */}
              <div className="relative aspect-[5/7] overflow-hidden border border-ink/10 bg-paper-2">
                <Image
                  src={r.image}
                  alt={r.alt}
                  fill
                  draggable={false}
                  sizes="(max-width: 640px) 82vw, (max-width: 1024px) 58vw, 44vw"
                  className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                />
              </div>
              <figcaption className="flex items-center justify-between gap-3 border-x border-b border-ink/10 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.24em] text-ink-2/80">
                <span className="truncate">{r.caption}</span>
                <span className="hidden shrink-0 md:block">Render</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      {/* The right edge stays soft while there is more to come, so the rail
          reads as continuing rather than as a card that got cut. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-paper to-transparent transition-opacity duration-500",
          atEnd ? "opacity-0" : "opacity-100",
        )}
      />

      <div className="mt-5 flex items-center gap-6">
        <div className="h-px flex-1 bg-ink/12">
          <span
            className="block h-px origin-left bg-gold transition-transform duration-300 ease-out"
            style={{ transform: `scaleX(${Math.max(progress, 0.06)})` }}
          />
        </div>
        <p className="hidden font-mono text-[9px] uppercase tracking-[0.24em] text-ink-2/70 sm:block">
          Drag, or use the arrows
        </p>
        <div className="flex items-center gap-2">
          <Arrow dir="prev" onClick={() => go(-1)} disabled={atStart} />
          <Arrow dir="next" onClick={() => go(1)} disabled={atEnd} />
        </div>
      </div>
    </div>
  );
}

function Arrow({
  dir,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  const next = dir === "next";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={next ? "Next render" : "Previous render"}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full border transition-colors duration-300",
        disabled
          ? "cursor-default border-ink/10 text-ink-2/30"
          : "border-ink/20 text-ink hover:border-gold hover:bg-gold-2 hover:text-ink",
      )}
    >
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
        <path
          d={next ? "M1 8h13M9.5 3 14.5 8l-5 5" : "M15 8H2M6.5 3 1.5 8l5 5"}
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    </button>
  );
}
