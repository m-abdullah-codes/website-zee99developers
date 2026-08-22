"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import Em from "@/components/ui/Em";
import TapCue, { Verb } from "@/components/ui/TapCue";
import { useCurrency } from "@/components/tools/Currency";
import { getLenis } from "@/components/motion/SmoothScroll";
import { ScrollTrigger, gsap, prefersReduced } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { fmtInt, money } from "@/lib/format";
import {
  ARCADE_FRONTED,
  PLATE_POS,
  SHOP_FLOORS,
  SHOPFRONT,
  type ShopFloor,
  type ShopUnit,
} from "@/data/brochure";

/**
 * The retail floors, unit by unit, with every shop on its true position on the
 * drawing.
 *
 * A table cannot show arcade frontage — you have to see which unit is where —
 * and a drawing alone cannot say what a unit costs. So both: tap a marker and
 * the panel under the plan fills in, and the same row lights up in the ledger
 * below it, which makes reading the plan and reading the prices one action
 * rather than two.
 *
 * No summary schedule under the two floors any more: shops are sold on a down
 * payment and thirty-six monthly instalments, and the only place either figure
 * belongs is on the unit it applies to — which is the panel and the ledger.
 *
 * The drawings here are the ones PLATE_POS was measured against. They are
 * deliberately not taken from the dashboard's `commercial.floors[].image`: a
 * re-crop from the media library would leave twenty-three markers pointing at
 * the wrong rooms, silently.
 */
export default function Shopfront({ no = "C1" }: { no?: string }) {
  return (
    <section id="commercial" className="border-t border-ink/10 bg-paper py-24 md:py-32">
      <div className="container-x">
        <SectionHead
          no={no}
          label="Commercial"
          title={<Em text={SHOPFRONT.title} />}
          lede={SHOPFRONT.lede}
          className="mb-16"
        />

        <div className="grid gap-20">
          {SHOP_FLOORS.map((floor) => (
            <Floor key={floor.id} floor={floor} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- one floor */

function Floor({ floor }: { floor: ShopFloor }) {
  // Which unit, and which of the two controls chose it — the plan and the
  // price list want opposite things brought into view.
  const [pick, setPick] = useState<{ id: string; from: "plan" | "list" } | null>(null);
  const picked = pick?.id ?? null;
  const [openLedger, setOpenLedger] = useState(false);
  const [cur] = useCurrency();
  const panel = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);

  // This plan is on screen and nothing on it has been opened yet: the only
  // moment its cue has anything to say. Kept per floor rather than shared
  // across the section — the two plates are two drawings, and whichever one a
  // reader comes to should say for itself that it can be read.
  const [near, setNear] = useState(false);
  const [taught, setTaught] = useState(false);
  const hint = near && !taught;

  const choose = (id: string, from: "plan" | "list") => {
    setTaught(true);
    setPick((p) => (p?.id === id ? null : { id, from }));
  };

  /**
   * A drawing covered in numbered pills does not, by itself, say that the pills
   * are buttons — so a cue says it, for as long as the drawing is the thing on
   * screen. It is put up on the way in and taken down on the way past, and the
   * first unit opened on this plate ends it for good: nobody needs telling
   * twice about the same drawing.
   */
  useGSAP(
    () => {
      // Read on refresh as well as on every crossing. Arriving with the plan
      // already on screen — a reload, the back button, a link straight to
      // #commercial — is not a crossing and fires no toggle, and the reading is
      // only meaningful once ScrollTrigger has measured the page, which it
      // defers past the moment the trigger is made.
      const sync = (self: ScrollTrigger) => setNear(!!self.isActive);
      ScrollTrigger.create({
        trigger: plate.current,
        start: "top 80%",
        end: "bottom 35%",
        onToggle: sync,
        onRefresh: sync,
      });
    },
    { scope: plate },
  );

  /**
   * The picked unit's figures arrive one after another rather than all at once,
   * and whatever answers the tap brings itself into view when it is off-screen.
   *
   * Which thing that is depends on where the tap came from. Tapping the plan
   * asks "what does this one cost", so the panel of figures comes up; tapping a
   * row in the price list asks "where is this one", so the drawing does.
   *
   * And it moves as little as it can — the nudge that just clears the target,
   * not a jump that parks it under the rail. Pinning the panel to the top of
   * the viewport would push the drawing it belongs to off the screen, which
   * loses the reader the thing they were looking at to show them the answer
   * about it.
   */
  useGSAP(
    () => {
      const el = panel.current;
      if (!el || !pick) return;

      const target = pick.from === "list" ? plate.current : el;
      if (target) nudgeIntoView(target);

      if (prefersReduced()) return;
      gsap.fromTo(
        el.querySelectorAll("[data-field]"),
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.045, ease: "power3.out", overwrite: true },
      );
      gsap.fromTo(
        el.querySelectorAll("[data-flag]"),
        { autoAlpha: 0, x: -8 },
        { autoAlpha: 1, x: 0, duration: 0.5, delay: 0.28, ease: "power3.out", overwrite: true },
      );
      // A rule that draws itself across the top of the panel — the one bit of
      // motion that says "this answered your tap" without moving any type.
      gsap.fromTo(
        el.querySelectorAll("[data-sweep]"),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.7, ease: "power2.out", overwrite: true },
      );
    },
    { dependencies: [pick], scope: panel },
  );

  const units = floor.units;
  const sqfts = units.filter((u) => u.type === "Shop").map((u) => u.sqft);
  const prices = units.map((u) => u.price);
  const unit = units.find((u) => u.id === picked) ?? null;
  const kiosks = units.filter((u) => u.type === "Kiosk").length;

  // The unit the cue rings. The leftmost one on the plate, because below sm the
  // drawing is held at 640px inside a narrower scroller and only its left edge
  // is on screen until someone pans it.
  let cueId: string | null = null;
  let cueX = Infinity;
  for (const u of units) {
    const pos = PLATE_POS[u.id];
    if (pos && pos.x < cueX) {
      cueId = u.id;
      cueX = pos.x;
    }
  }

  const facts: [string, string][] = [
    [
      "Units",
      kiosks ? `${units.length - kiosks} shops + ${kiosks === 1 ? "a kiosk" : `${kiosks} kiosks`}` : `${units.length} shops`,
    ],
    ["Sizes", `${fmtInt(Math.min(...sqfts))}–${fmtInt(Math.max(...sqfts))} sq ft`],
    ["Rate", `${money(floor.rate, cur)} / sq ft`],
    [
      "Prices",
      `${money(Math.min(...prices), cur, { compact: true })} – ${money(Math.max(...prices), cur, { compact: true })}`,
    ],
  ];

  return (
    <Reveal className="grid items-start gap-9 border-t border-ink/10 pt-9 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
      <div className="min-w-0">
        <h3 className="font-display text-[clamp(1.6rem,2.6vw,2.15rem)] font-[400] leading-none tracking-[-0.015em] text-ink">
          {floor.name}
        </h3>
        <p className="mt-3.5 max-w-[26ch] text-[1rem] leading-[1.7] text-ink-2">{floor.sub}</p>

        <dl className="mt-8 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10">
          {facts.map(([k, v]) => (
            <div key={k} className="bg-paper p-5">
              <dt className="eyebrow mb-3 text-[9px]">{k}</dt>
              <dd className="font-display text-[1.05rem] font-[420] leading-snug text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-7 max-w-[42ch] text-[0.95rem] leading-[1.8] text-ink-2">{floor.body}</p>
      </div>

      {/* min-w-0 is load-bearing: a grid item defaults to min-width:auto, so
          without it the 640px plan below sets this column's floor and the whole
          page scrolls sideways on a phone instead of the plan panning inside
          its own scroller. */}
      <div className="min-w-0">
        {/* The drawing, and over it the cue. The cue is a sibling of the
            scroller and not a child of it: positioned inside, it would be
            centred on the 640px drawing rather than on the part of the drawing
            a phone is showing, and half of it would sit off the screen. */}
        <div className="relative">
          {/* Below sm the plan is held at 640px so its markers stay tappable,
              which puts part of it off-screen; it pans inside its own scroller
              and the page itself never scrolls sideways. */}
          <div
            ref={plate}
            className="scroll-mt-24 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]"
          >
            <div className="relative min-w-[640px] sm:min-w-0">
              <div className="relative aspect-square overflow-hidden border border-ink/10 bg-white">
                <Image
                  src={floor.image}
                  alt={floor.alt}
                  fill
                  sizes="(max-width: 1024px) 640px, 55vw"
                  className="object-contain"
                />
              </div>

              {units.map((u) => {
                const pos = PLATE_POS[u.id];
                if (!pos) return null;
                const on = picked === u.id;
                const ringed = on || (hint && u.id === cueId);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => choose(u.id, "plan")}
                    aria-pressed={on}
                    aria-label={`${u.type} ${u.id}, ${fmtInt(u.sqft)} square feet`}
                    style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
                    className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
                  >
                    {/* One ring leaving the picked marker, so the eye is told
                        where the figures below came from — and, until anything is
                        picked, one leaving the marker the cue is about. */}
                    {ringed && (
                      <span
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute h-[26px] w-[26px] rounded-full border motion-reduce:hidden",
                          on ? "border-ink" : "border-gold-2",
                        )}
                        style={{ animation: "float-ring 1.8s ease-out infinite" }}
                      />
                    )}
                    <span
                      className={cn(
                        "relative grid h-[26px] min-w-[26px] place-items-center rounded-full px-1.5",
                        "font-mono text-[10.5px] font-medium leading-none",
                        "border transition-transform duration-500 ease-[var(--ease-out-expo)]",
                        on
                          ? "scale-[1.25] border-ink bg-ink text-paper shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-ink)_14%,transparent)]"
                          : "border-gold bg-gold-3 text-ink shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-gold-3)_45%,transparent)] hover:scale-[1.15]",
                      )}
                    >
                      {u.type === "Kiosk" ? "K" : u.id.replace(/^[GL]/, "")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <PlanCue show={hint} />
        </div>

        <p className="mt-3 flex items-center justify-between gap-4 border-x border-b border-ink/10 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.24em] text-ink-2/80">
          <span className="truncate">{floor.caption}</span>
          <span className="hidden shrink-0 sm:block">Not to scale</span>
        </p>

        {/* Detail panel. Never an empty box: at rest it says what to do. */}
        <div
          ref={panel}
          aria-live="polite"
          className={cn(
            "relative mt-5 min-h-[7rem] scroll-mt-28 border-t border-ink/15 px-1 pb-1 pt-5 transition-colors duration-500",
            unit && "bg-paper-2/60",
          )}
        >
          {unit && (
            <span
              data-sweep
              aria-hidden
              className="absolute inset-x-0 top-0 h-[2px] origin-left bg-gold"
            />
          )}

          {!unit ? (
            <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2/80">
              <Verb /> a numbered unit on the plan
            </p>
          ) : (
            <>
              <dl className="flex flex-wrap gap-x-9 gap-y-4 px-3 sm:px-4">
                {(
                  [
                    ["Unit", unit.type === "Kiosk" ? "Kiosk" : `Shop ${unit.id.replace(/^[GL]/, "").padStart(2, "0")}`],
                    ["Size", `${fmtInt(unit.sqft)} sq ft`],
                    ["Rate", `${money(unit.rate, cur)} / sq ft`],
                    ["Price", money(unit.price, cur)],
                    ["Down", money(unit.down, cur)],
                    ["Monthly", `${money(unit.monthly, cur)} × ${unit.monthlyCount}`],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k} data-field className="grid gap-1.5">
                    <dt className="eyebrow text-[9px]">{k}</dt>
                    <dd className="font-display text-[1.02rem] font-[460] leading-none text-ink">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              {flagFor(unit) && (
                <p
                  data-flag
                  className="mx-3 mb-4 mt-5 max-w-[52ch] border-l-2 border-gold pl-4 text-[0.9rem] leading-[1.7] text-ink-2 sm:mx-4"
                >
                  {flagFor(unit)}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* The ledger. Folded shut — twenty-three shops printed open is four
          screens of figures in a section whose job is to show where each one
          is. It runs the full measure under both columns, because it is a table
          and a table squeezed into a 0.85fr column wraps its figures. */}
      <div className="min-w-0 lg:col-span-2">
        <div className="border-t border-ink/10">
          <button
            type="button"
            onClick={() => setOpenLedger((v) => !v)}
            aria-expanded={openLedger}
            className="group flex w-full items-center justify-between gap-5 py-4 text-left"
          >
            <span>
              <span className="block font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink">
                {floor.ledgerLabel}
              </span>
              <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-ink-2/75">
                {units.length} units ·{" "}
                {money(Math.min(...prices), cur, { compact: true })} –{" "}
                {money(Math.max(...prices), cur, { compact: true })} · down payment and monthly on
                each
              </span>
            </span>
            <span
              className={cn(
                "relative h-[13px] w-[13px] shrink-0 transition-transform duration-500 ease-[var(--ease-out-expo)]",
                openLedger && "rotate-45",
              )}
              aria-hidden
            >
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-ink-2 transition-colors group-hover:bg-ink" />
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink-2 transition-colors group-hover:bg-ink" />
            </span>
          </button>

          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]",
              openLedger ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="overflow-hidden">
              <ol className="border-t border-ink/10 pb-2">
                {units.map((u) => {
                  const on = picked === u.id;
                  return (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => choose(u.id, "list")}
                        aria-pressed={on}
                        className={cn(
                          "grid w-full grid-cols-[2rem_1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-ink/10 px-2 py-3 text-left transition-colors duration-300",
                          "sm:grid-cols-[2rem_6rem_1fr_auto]",
                          "border-l-2",
                          on
                            ? "border-l-gold bg-paper-2"
                            : "border-l-transparent hover:bg-paper-2/60",
                        )}
                      >
                        <span
                          className={cn(
                            "font-mono text-[10px] font-semibold tracking-[0.1em] transition-colors duration-300",
                            on ? "text-gold" : "text-ink-2",
                          )}
                        >
                          {u.type === "Kiosk" ? "K" : u.id.replace(/^[GL]/, "").padStart(2, "0")}
                        </span>
                        <span className="font-mono text-[11.5px] tracking-[0.06em] text-ink">
                          {fmtInt(u.sqft)}
                          <span className="ml-1 text-ink-2/80">sq ft</span>
                        </span>
                        <span className="col-start-2 row-start-2 font-mono text-[10.5px] tracking-[0.04em] text-ink-2 sm:col-start-3 sm:row-start-1">
                          {money(u.down, cur)} down · {money(u.monthly, cur)} a month
                        </span>
                        <span className="col-start-3 row-start-1 text-right font-mono text-[12px] tracking-[0.04em] text-ink sm:col-start-4">
                          {money(u.price, cur)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------- bits */

/** Clear of the sticky anchor rail. */
const RAIL = 84;

/**
 * Scroll by the smallest amount that puts `el` fully on screen, and not at all
 * if it already is. Prefers pushing the page down so the element's foot clears
 * the bottom edge, which keeps whatever is above it — here, the drawing the
 * figures came from — where the reader left it.
 */
function nudgeIntoView(el: HTMLElement) {
  const box = el.getBoundingClientRect();
  const floor = window.innerHeight - 20;

  let delta = 0;
  if (box.bottom > floor) delta = box.bottom - floor;
  // Never so far that the element's own head disappears under the rail.
  if (box.top - delta < RAIL) delta = box.top - RAIL;
  if (Math.abs(delta) < 8) return;

  const y = window.scrollY + delta;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, { duration: 0.9 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

/** Two things worth saying out loud rather than leaving to be noticed. */
function flagFor(u: ShopUnit): string {
  if (u.id === "G9") {
    return "Priced below the other ground-floor shops: it sits inside the plate with no arcade frontage.";
  }
  if (ARCADE_FRONTED.includes(u.id)) return "Opens directly onto the ten-foot arcade.";
  return "";
}

/**
 * The cue over a plan: a pointer, clicking, and the one sentence that says what
 * the numbers on the drawing are for. It arrives with the drawing and leaves
 * the moment a unit is opened.
 *
 * Decorative in the accessibility tree on purpose. The panel under the plan
 * carries the same instruction as its resting state, and that one sits in a
 * live region — a reader on a screen reader should not be told it twice.
 */
function PlanCue({ show }: { show: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-5 sm:px-4",
        "transition-all duration-700 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
        show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      {/* Ink, on a drawing that is line work on white: a paper-coloured chip
          would read as part of the plate. */}
      <TapCue>
        <Verb /> a shop for its size and price
      </TapCue>
    </div>
  );
}
