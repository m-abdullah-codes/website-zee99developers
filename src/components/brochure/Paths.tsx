"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import Em from "@/components/ui/Em";
import { Verb } from "@/components/ui/TapCue";
import { getLenis } from "@/components/motion/SmoothScroll";
import { ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { PATHS } from "@/data/brochure";
import type { PathOption } from "@/data/brochure";

/**
 * The fork the document turns on.
 *
 * Two thirds of this brochure only ever applies to one of two readers. Someone
 * looking for a two-bedroom does not want nine shop plates and twenty-three
 * payment schedules between them and the specification; someone pricing a
 * kiosk does not want the wardrobes. Printing both at full length in front of
 * both is how a brochure gets closed halfway down, so the page asks once —
 * apartments or shops — and opens only that half.
 *
 * Five rules hold it together:
 *
 *   1. **The question has to be answered.** Nothing after the fork is on the
 *      page until one of the cards is open — see `PathGate`. Not a scroll the
 *      page fights, which reads as broken on any device with momentum: simply
 *      nothing below to scroll to. A document that lets a reader past the
 *      question answers it for them, badly, by putting the other half's prices
 *      in front of them first.
 *   2. **It is a choice, not a filter.** Nothing is thrown away. Everything
 *      below the fork — the film, the amenities, the address, the builder, the
 *      questions, the roof — is common ground and arrives whichever card was
 *      taken, so a reader who picks wrong loses a tap, not a section.
 *   3. **One at a time.** Two open branches is the long document again, and
 *      "which one am I in" stops having an answer. Choosing the other one
 *      swaps.
 *   4. **The way out is always in reach.** Three of them: the cards
 *      themselves, a foot bar at the end of a branch (which is where a reader
 *      finishes, a long way from the cards), and the pinned switch in the
 *      anchor rail, which is on screen at every scroll position.
 *   5. **Print ignores all of it** and prints both branches open, for the same
 *      reason `Fold` does: a brochure saved to PDF with half the building
 *      missing is not a brochure. (A brochure printed without answering the
 *      question at all is the cover, the overview and the question — which is
 *      what was on the page.)
 *
 * The two branches are passed in as rendered server output rather than
 * imported, so this file stays a small piece of client state and the sections
 * inside it — the drawings, the schedules, the specification — keep whatever
 * they already were.
 */

export type PathId = "residential" | "commercial";

/* ------------------------------------------------------------------ state */

type Ctx = {
  path: PathId | null;
  /**
   * The open branch, once it has stopped moving. Not the same as `path`: a
   * branch may only stop clipping its contents after the growing has finished,
   * and until then a sticky column inside it would be silently dead. See the
   * note on `Branch`.
   */
  settled: PathId | null;
  /** Toggling the open one shuts it; anything else swaps. */
  choose: (id: PathId) => void;
  /** Open `id` and take the reader to it. What the anchor rail calls. */
  go: (id: PathId) => void;
};

const PathCtx = createContext<Ctx>({
  path: null,
  settled: null,
  choose: () => {},
  go: () => {},
});

export const usePath = () => useContext(PathCtx);

/** Clear of the sticky anchor rail — the same offset `Fold` scrolls to. */
const RAIL = 96;

const scrollTo = (y: number) => {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, { duration: 0.9 });
  else window.scrollTo({ top: y, behavior: "smooth" });
};

/** How long a branch takes to finish growing or collapsing. Matches the
 *  `duration-700` on the panel, with a frame of margin. */
const TRAVEL = 780;

export function PathProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<PathId | null>(null);
  const [settled, setSettled] = useState<PathId | null>(null);
  // Nothing has been opened or closed yet, so there is nothing to re-measure.
  const touched = useRef(false);

  /**
   * Once the branch has stopped moving: unclip it, and re-measure the page.
   * Opening or closing changes the height under every trigger below it — the
   * same problem `Fold` has, and the same answer.
   *
   * Both happen on a timer rather than on `transitionend`, because
   * `motion-reduce` removes the transition and with it the event, and the
   * sticky columns inside still need the clip gone.
   */
  useEffect(() => {
    if (!touched.current) return;
    const t = window.setTimeout(() => {
      setSettled(path);
      ScrollTrigger.refresh();
    }, TRAVEL);
    return () => window.clearTimeout(t);
  }, [path]);

  /** Any move re-clips immediately: the box is about to change size. */
  const move = useCallback((next: (p: PathId | null) => PathId | null) => {
    touched.current = true;
    setSettled(null);
    setPath(next);
  }, []);

  /**
   * Toggling the open one shuts it, which also takes the rest of the document
   * off the page — so the reader is brought back to the question, wherever
   * they were when they pressed it. Without that, closing from the middle of a
   * shop ledger leaves the browser to clamp the scroll on its own, and the
   * reader lands somewhere they did not ask for with no idea why.
   */
  const choose = useCallback(
    (id: PathId) => {
      const closing = path === id;
      move((p) => (p === id ? null : id));
      if (!closing) return;
      const box = document.getElementById("paths")?.getBoundingClientRect();
      if (box && box.top < 0) scrollTo(Math.max(0, window.scrollY + box.top));
    },
    [move, path],
  );

  /**
   * Open it and go there.
   *
   * The target has to be worked out against the layout the page is about to
   * have, not the one it has. Switching from apartments to shops collapses
   * four thousand pixels of plans *above* the shops on a 700ms transition, and
   * scrolling to where the shops are at the moment of the click lands the
   * reader four thousand pixels past them once that height leaves the page —
   * which is halfway down the lower-ground ledger, with no idea what happened.
   *
   * So: measure the target, then take off the height of every branch open
   * above it, since all of them are on their way to nothing. Read from the DOM
   * rather than from the two ids, so a third branch would not need this
   * remembering.
   */
  const go = useCallback(
    (id: PathId) => {
      const target = document.getElementById(`path-${id}`);
      let y: number | null = null;
      if (target) {
        const mine = target.getBoundingClientRect().top;
        let closing = 0;
        document.querySelectorAll<HTMLElement>("[data-branch]").forEach((el) => {
          if (el === target) return;
          const box = el.getBoundingClientRect();
          if (box.top < mine) closing += box.height;
        });
        y = Math.max(0, window.scrollY + mine - closing - RAIL);
      }
      move(() => id);
      if (y !== null) scrollTo(y);
    },
    [move],
  );

  /**
   * Landing on a section that lives inside a branch opens that branch.
   *
   * Without this, a forwarded `#specification` scrolls to a seam in the page
   * and shows nothing, because the section it names has no height until
   * somebody chooses the half it is in. Read out of the DOM rather than from a
   * list of section ids, so nothing has to be kept in step by hand.
   *
   * Read a frame late, and scrolled a branch's travel later still, for the two
   * reasons `Fold` reads its own landing hash late: the panel has to be laid
   * out before it can animate, and a section's final position is not knowable
   * until the branch above it has finished growing.
   */
  useEffect(() => {
    let timer = 0;
    const frame = requestAnimationFrame(() => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      const branch = document
        .getElementById(id)
        ?.closest<HTMLElement>("[data-branch]")?.dataset.branch;
      if (branch !== "residential" && branch !== "commercial") return;
      move(() => branch);
      timer = window.setTimeout(() => {
        const box = document.getElementById(id)?.getBoundingClientRect();
        if (box) scrollTo(Math.max(0, window.scrollY + box.top - RAIL));
      }, TRAVEL + 60);
    });
    return () => {
      cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
    };
  }, [move]);

  const value = useMemo(() => ({ path, settled, choose, go }), [path, settled, choose, go]);

  return <PathCtx.Provider value={value}>{children}</PathCtx.Provider>;
}

/* ------------------------------------------------------------- the section */

export default function Paths({
  no = "02",
  residential,
  commercial,
}: {
  no?: string;
  residential: ReactNode;
  commercial: ReactNode;
}) {
  const { path, choose } = usePath();

  return (
    <>
      <section id="paths" className="scroll-mt-24 border-t border-ink/10 bg-paper-2/55 py-16 sm:py-20 md:py-28">
        <div className="container-x">
          {/* Hand-rolled rather than `SectionHead`, as the overview and the
              location already are. This section is a control, not a chapter:
              the question and both answers have to be in one glance on a
              phone, and the shared head's headline scale alone runs to four
              lines and 290 pixels there. */}
          <header className="mb-10 sm:mb-14">
            <Reveal as="p" y={14} className="folio mb-7 text-ink-2 sm:mb-9">
              {no}&ensp;—&ensp;Choose
            </Reveal>
            <SplitReveal
              as="h2"
              className="font-display text-[clamp(2rem,7.4vw,4.9rem)] font-[360] leading-[1.04] tracking-[-0.02em] text-ink"
            >
              <Em text={PATHS.title} />
            </SplitReveal>
            <Reveal delay={0.18} y={20}>
              <p className="mt-6 max-w-[34rem] text-[0.98rem] leading-[1.8] text-ink-2 sm:mt-8 sm:text-[1.02rem]">
                {PATHS.lede}
              </p>
            </Reveal>
          </header>

          <div className="grid grid-cols-2 gap-px border border-ink/12 bg-ink/12">
            <Card
              id="residential"
              option={PATHS.residential}
              open={path === "residential"}
              onToggle={() => choose("residential")}
            />
            <Card
              id="commercial"
              option={PATHS.commercial}
              open={path === "commercial"}
              onToggle={() => choose("commercial")}
            />
          </div>

          {/* The document stops here until one of them is open, so the end of
              the page has to read as a question rather than as a page that
              failed to load. It goes the moment either card is taken up. */}
          <div
            aria-hidden={path !== null}
            className={cn(
              "mt-8 flex items-center justify-center gap-3.5 transition-opacity duration-500 print:hidden",
              path === null ? "opacity-100" : "opacity-0",
            )}
          >
            <span
              aria-hidden
              className="h-px w-8 bg-gold-2/60 sm:w-12"
            />
            <span className="text-center font-mono text-[9px] uppercase leading-[1.7] tracking-[0.22em] text-ink-2 sm:text-[9.5px]">
              {PATHS.note}
            </span>
            <span aria-hidden className="h-px w-8 bg-gold-2/60 sm:w-12" />
          </div>
        </div>
      </section>

      <Branch id="residential" option={PATHS.residential} other={PATHS.commercial}>
        {residential}
      </Branch>
      <Branch id="commercial" option={PATHS.commercial} other={PATHS.residential}>
        {commercial}
      </Branch>
    </>
  );
}

/* -------------------------------------------------------------- the gate */

/**
 * Everything after the fork, which is not on the page until the fork has been
 * answered.
 *
 * The reader is not stopped from scrolling — they are given nothing to scroll
 * to, which is the difference between a document that ends on a question and a
 * page that fights the thumb. Clamping a scroll position works badly on every
 * touch device with momentum, and reads as broken rather than as deliberate.
 *
 * Mounted on choice rather than hidden with CSS, because half of what is down
 * here measures itself when it mounts — the roof rail reads its own
 * `scrollWidth` to decide whether its arrows are live, and inside a
 * `display: none` subtree that is zero.
 */
export function PathGate({ children }: { children: ReactNode }) {
  const { path } = usePath();
  return path === null ? null : <>{children}</>;
}

/* --------------------------------------------------------------- one card */

/**
 * The whole card is the control. A chevron on its own is a 44px target on a
 * page whose every other target is a section-sized one, and the arrow is what
 * a reader is being asked to notice — so the arrow is drawn large, sits in the
 * card's own bottom bar, and the tap area is everything above it as well.
 *
 * The two of them are side by side at every width, phones included. A choice
 * reads as a choice when both options are in one glance; stacked, the second
 * one is something you find by scrolling, which is a different question. That
 * is what sets the budget for what may go on a card — at 375px each is about
 * 160 pixels wide, so: a label, a name, three facts, and the bar.
 */
function Card({
  id,
  option,
  open,
  onToggle,
}: {
  id: PathId;
  option: PathOption;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={`path-${id}`}
      className={cn(
        "group relative flex flex-col text-left transition-colors duration-500 ease-[var(--ease-out-expo)]",
        open ? "bg-ink text-paper" : "bg-paper hover:bg-paper-2/70",
      )}
    >
      {/* The picked card points at what it opened. */}
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-px left-1/2 z-10 h-4 w-4 -translate-x-1/2 translate-y-1/2 rotate-45 border-b border-r transition-opacity duration-500",
          open ? "border-ink bg-ink opacity-100" : "opacity-0",
          "print:hidden",
        )}
      />

      <span className="flex flex-1 flex-col p-5 sm:p-8 lg:p-10">
        <span
          className={cn(
            "font-mono text-[8.5px] uppercase leading-[1.6] tracking-[0.22em] transition-colors duration-500 sm:text-[9px] sm:tracking-[0.28em]",
            open ? "text-gold-3" : "text-gold",
          )}
        >
          {option.label}
        </span>

        <span
          className={cn(
            "mt-4 block font-display text-[clamp(1.35rem,5.6vw,2.9rem)] font-[380] leading-[1.06] tracking-[-0.02em] transition-colors duration-500 sm:mt-6",
            open ? "text-paper" : "text-ink",
          )}
        >
          {option.title}
        </span>

        {/* One fact to a line. Read down rather than across, they survive a
            160px column without wrapping mid-figure, and three of them make a
            shape the eye can compare with the card beside it. */}
        {option.meta.length > 0 && (
          <span
            className={cn(
              "mt-auto flex flex-col gap-1.5 pt-7 font-mono text-[9px] uppercase leading-[1.5] tracking-[0.16em] transition-colors duration-500 sm:gap-2 sm:text-[9.5px] sm:tracking-[0.2em]",
              open ? "text-paper/55" : "text-ink-2/85",
            )}
          >
            {option.meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </span>
        )}
      </span>

      {/* The bar that says it opens — filled, which on a page with no buttons
          on it is the whole of the invitation. It is the same object `Fold`
          puts on a shut section, widened to the card, so the two controls in
          this document read as one control used twice. */}
      <span
        className={cn(
          "flex items-center justify-between gap-2 border-t px-5 py-4 transition-colors duration-500 sm:gap-4 sm:px-8 sm:py-5 lg:px-10",
          open
            ? "border-paper/15 text-paper/70 group-hover:text-paper"
            : "border-ink bg-ink text-paper group-hover:bg-gold",
          "print:hidden",
        )}
      >
        {/* Short on a phone, where the bar has about 130px to play with. */}
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] sm:text-[10px] sm:tracking-[0.24em]">
          <span className="sm:hidden">{open ? "Close" : "Open"}</span>
          <span className="hidden sm:inline">
            {open ? "Close this section" : <><Verb /> to open</>}
          </span>
        </span>
        <Chevron open={open} />
      </span>
    </button>
  );
}

/** Down while shut, up while open, and big enough to read as the point. */
function Chevron({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-out-expo)] sm:h-9 sm:w-9",
        open ? "rotate-180 border-paper/30" : "border-paper/45 group-hover:translate-y-0.5",
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <path d="M6 9.5 12 15.5 18 9.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------- one branch */

/**
 * The half of the document a card opens.
 *
 * Same collapse mechanics as `Fold`, and for the same reasons: the rows inside
 * have to be clipped while the box grows or they spill out of it, but an
 * overflow ancestor silently kills `position: sticky` — and both branches pin
 * a column. So the clip comes off once the branch has stopped moving.
 */
function Branch({
  id,
  option,
  other,
  children,
}: {
  id: PathId;
  option: PathOption;
  other: PathOption;
  children: ReactNode;
}) {
  const { path, settled, choose, go } = usePath();
  const open = path === id;
  const otherId: PathId = id === "residential" ? "commercial" : "residential";
  const panelId = `path-${id}`;
  const labelId = `${useId()}-branch`;

  return (
    <div
      id={panelId}
      inert={!open}
      // How `go` finds the branches whose height is about to leave the page.
      data-branch={id}
      aria-labelledby={labelId}
      className={cn(
        "grid scroll-mt-24 transition-[grid-template-rows] duration-700 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        "print:grid-rows-[1fr]!",
      )}
    >
      <div
        className={cn(
          settled === id ? "overflow-visible" : "overflow-hidden",
          "print:overflow-visible",
        )}
      >
        {/* Which half you are reading, said once at the top of it — the
            sections below carry lettered folios, not numbers, and this is
            what tells you what the letter stands for. */}
        <div className="border-t border-ink/10 bg-ink text-paper">
          <div className="container-x flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4">
            <p id={labelId} className="flex items-center gap-3.5">
              <span className="h-[5px] w-[5px] rounded-full bg-gold-2" aria-hidden />
              <span className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-paper">
                Now reading&ensp;·&ensp;{option.title}
              </span>
            </p>
            <button
              type="button"
              onClick={() => go(otherId)}
              className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-paper/55 underline decoration-paper/25 underline-offset-[6px] transition-colors hover:text-gold-3 hover:decoration-gold-3/50 print:hidden"
            >
              {other.title} instead →
            </button>
          </div>
        </div>

        {children}

        {/* The end of a branch is a long way from the cards, and it is exactly
            where a reader decides whether they also want the other half. */}
        <div className="border-t border-ink/10 bg-paper-2/70 print:hidden">
          <div className="container-x flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-7">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
              End of {option.title.toLowerCase()}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => choose(id)}
                className="border border-ink/25 px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2 transition-colors hover:border-ink hover:text-ink"
              >
                Close this section
              </button>
              <button
                type="button"
                onClick={() => go(otherId)}
                className="flex items-center gap-3 border border-ink bg-ink px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-paper transition-colors hover:border-gold hover:bg-gold"
              >
                Open {other.title.toLowerCase()}
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
