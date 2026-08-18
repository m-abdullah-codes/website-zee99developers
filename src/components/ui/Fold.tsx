"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import { getLenis } from "@/components/motion/SmoothScroll";
import { ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * A whole section that folds.
 *
 * The e-brochure runs to twelve sections and the last four of them — the
 * specification, the amenities, the builder's record and the FAQs — are
 * reference material. A reader wants them *available*, not in the way of the
 * plans and the prices they came for. So they arrive shut: folio, title, and
 * one mono line saying what is inside, which is enough to decide whether to
 * open it.
 *
 * The head is the control. A section-sized target is easier to hit than a
 * chevron, and the same click works on a phone with one thumb — which is how
 * this document is read, because it is sent over WhatsApp.
 *
 * Three details that are less obvious than they look:
 *
 *   1. `overflow-hidden` on the panel is dropped once the section has finished
 *      opening. It has to be there while the rows grow or the content spills
 *      out of the collapsing box — but an overflow ancestor silently kills
 *      `position: sticky` on everything inside it, and two of these four
 *      sections pin a column.
 *   2. Opening a section changes the height of the page under every trigger
 *      below it, so ScrollTrigger is re-measured when the transition lands.
 *   3. Closing a tall section from its foot would drop the reader into
 *      whatever came next with no idea what happened, so the head is pulled
 *      back into view if it has already scrolled off the top.
 *
 * Printing ignores all of it and prints every section open: a brochure saved
 * to PDF with four empty chapters in it is not a brochure.
 */

type Props = {
  id: string;
  no: string;
  label: string;
  title: ReactNode;
  /** Set to give the section's name its own weight on the lid, rather than the
   *  folio's. Only the specification uses it. */
  labelClassName?: string;
  lede?: ReactNode;
  /** One line naming what is inside — shown while the section is shut. */
  peek: ReactNode;
  /** Section chrome: the border and background it would carry unfolded. */
  className?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

/** Clear of the sticky anchor rail. */
const RAIL = 96;

export default function Fold({
  id,
  no,
  label,
  title,
  labelClassName,
  lede,
  peek,
  className,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  // Open *and* finished moving — the only state in which the panel may stop
  // clipping its contents. See note 1 above.
  const [settled, setSettled] = useState(defaultOpen);
  const head = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const panelId = `${useId()}-fold`;

  /**
   * Unclip and re-measure once the section has stopped moving. A timer rather
   * than `transitionend`, because `motion-reduce` removes the transition and
   * with it the event, and the sticky columns inside still need the clip gone.
   */
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      setSettled(true);
      ScrollTrigger.refresh();
    }, 720);
    return () => window.clearTimeout(t);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setSettled(false);
    setOpen(next);
    if (next) return;

    const box = head.current?.getBoundingClientRect();
    if (!box || box.top >= RAIL) return;
    const y = window.scrollY + box.top - RAIL;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 0.8 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  /**
   * Arriving at a folded section by name opens it — from the anchor rail
   * (which fires this event) or from a link that lands on `#id`. Someone who
   * asked for the specification wants the specification, not its lid.
   */
  useEffect(() => {
    const mine = () => {
      setSettled(false);
      setOpen(true);
    };
    const onHash = () => {
      if (window.location.hash === `#${id}`) mine();
    };
    const onJump = (e: Event) => {
      if ((e as CustomEvent<{ id: string }>).detail?.id === id) mine();
    };
    // The landing hash is read a frame late on purpose: the panel has to be
    // laid out before it can animate, and reading it during the effect would
    // fork hydration off the server's shut markup.
    const frame = requestAnimationFrame(onHash);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("fold:open", onJump);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("fold:open", onJump);
    };
  }, [id]);

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 border-t border-ink/10 transition-[padding] duration-700 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
        open ? "py-24 md:py-32" : "py-16 md:py-20",
        "print:py-24",
        className,
      )}
    >
      <div className="container-x" ref={head}>
        {/* h2 > button is the accordion pattern: the heading stays a heading in
            the outline, and everything inside the control is phrasing. */}
        <h2>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="group block w-full text-left print:cursor-default"
          >
            <span className="flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
              <Reveal as="span" y={14} className="folio text-ink-2">
                <span>{no}&ensp;—</span>
                <span className={labelClassName}>{label}</span>
              </Reveal>
              <Control open={open} />
            </span>

            <SplitReveal
              as="span"
              className="mt-8 block font-display text-[clamp(2.5rem,5.2vw,4.9rem)] font-[360] leading-[1.03] tracking-[-0.02em] text-ink"
            >
              {title}
            </SplitReveal>

            {lede && (
              <Reveal
                as="span"
                delay={0.18}
                y={20}
                className="mt-8 block max-w-[36rem] text-[1.02rem] leading-[1.85] text-ink-2"
              >
                {lede}
              </Reveal>
            )}

            {/* The rule draws itself across as the section opens — the one bit
                of motion that reports the click without moving any type. */}
            <span className="relative mt-10 block h-px w-full bg-ink/12">
              <span
                aria-hidden
                className={cn(
                  "absolute inset-0 block origin-left bg-gold transition-transform duration-[900ms] ease-[var(--ease-out-expo)] motion-reduce:transition-none",
                  open ? "scale-x-100" : "scale-x-0",
                )}
              />
            </span>

            {/* Shut, the section still says what it holds. */}
            <span
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
                open ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
                "print:hidden",
              )}
            >
              <span className="block overflow-hidden">
                <span className="flex flex-wrap items-baseline gap-x-4 gap-y-2 pt-4 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2/80">
                  {peek}
                  <span className="text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    Read it
                  </span>
                </span>
              </span>
            </span>
          </button>
        </h2>

        <div
          id={panelId}
          ref={panel}
          inert={!open}
          className={cn(
            "grid transition-[grid-template-rows] duration-700 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            "print:grid-rows-[1fr]!",
          )}
        >
          <div className={cn(settled ? "overflow-visible" : "overflow-hidden", "print:overflow-visible")}>
            <div className="pt-14 md:pt-16">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Shut it is a filled block — the strongest invitation on a page with no
 * buttons on it. Open it goes quiet and outlined, because by then the content
 * under it is the thing worth looking at.
 */
function Control({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center gap-3.5 border px-5 py-2.5 transition-colors duration-500 ease-[var(--ease-out-expo)] print:hidden",
        open
          ? "border-ink/25 text-ink-2 group-hover:border-ink group-hover:text-ink"
          : "border-ink bg-ink text-paper group-hover:border-gold group-hover:bg-gold",
      )}
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.24em]">
        {open ? "Close" : "Open"}
      </span>
      <span
        className={cn(
          "relative h-[11px] w-[11px] transition-transform duration-500 ease-[var(--ease-out-expo)]",
          open && "rotate-45",
        )}
      >
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
      </span>
    </span>
  );
}
