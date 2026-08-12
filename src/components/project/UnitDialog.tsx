"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import BrochureDownload from "@/components/tools/BrochureDownload";
import type { Brochure, PlanConfig, Unit } from "@/data/projects";
import type { CurrencyCode } from "@/data/rates";
import { listedStop, planConfig, planFor, scheduleFor, type ScheduleRow } from "@/lib/pricing";
import { fmtInt, money } from "@/lib/format";
import { waLink } from "@/data/site";
import { unitFloorPlan, unitGallery } from "@/data/unitMedia";
import { getLenis } from "@/components/motion/SmoothScroll";

export type UnitTab = "gallery" | "floorplan" | "payment";

export const UNIT_TABS: { id: UnitTab; label: string }[] = [
  { id: "gallery", label: "Gallery" },
  { id: "floorplan", label: "Floor plan" },
  { id: "payment", label: "Payment plan" },
];

/** Tonal ramp for the composition bar — booking first, possession last. */
const SEGMENT_COLORS = [
  "var(--color-ink)",
  "var(--color-gold)",
  "var(--color-gold-2)",
  "var(--color-gold-3)",
  "var(--color-ink-2)",
];
const segColor = (i: number) => SEGMENT_COLORS[i % SEGMENT_COLORS.length];

type Props = {
  /** The open unit, or null when the dialog is closed. */
  unit: Unit | null;
  tab: UnitTab;
  onTab: (tab: UnitTab) => void;
  onClose: () => void;
  projectName: string;
  plan?: PlanConfig;
  brochure?: Brochure;
  /** Follows the switch on the section behind it; the schedule stays PKR-based. */
  currency?: CurrencyCode;
  /**
   * Drops every outbound link and call to action — the WhatsApp button, the
   * brochure download, the open-full-size link. Set by the standalone
   * e-brochure, which is a document rather than a page that sends anyone
   * anywhere.
   */
  noCta?: boolean;
};

/**
 * One overlay per residence, with the three things a buyer actually asks for:
 * the renders, the drawing, and the numbers. It stays mounted so the panel can
 * fade out, and keeps rendering the last unit while it does.
 */
export default function UnitDialog({
  unit,
  tab,
  onTab,
  onClose,
  projectName,
  plan,
  brochure,
  currency = "PKR",
  noCta = false,
}: Props) {
  const open = unit !== null;
  /** Signed for the sentences that carry one figure; bare inside the ledger,
   *  where the lead line above has already said what the money is. */
  const amount = (n: number) => money(n, currency);
  const cell = (n: number) => money(n, currency, { symbol: false });

  // The panel fades out rather than vanishing, so it keeps rendering the unit
  // it was opened with until the transition is over.
  const [shown, setShown] = useState<Unit | null>(unit);
  if (unit && unit !== shown) setShown(unit);
  const u = unit ?? shown;

  const panel = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  const images = useMemo(() => (u ? unitGallery(u) : []), [u]);

  // `loaded` keeps every render that has been viewed mounted, so moving through
  // the gallery cross-fades instead of flashing an empty frame.
  const [view, setView] = useState({ id: "", idx: 0, loaded: [0] as number[] });
  if (u && view.id !== u.id) setView({ id: u.id, idx: 0, loaded: [0] });
  const idx = view.idx;
  const loaded = view.loaded;

  const go = useCallback(
    (next: number) => {
      const count = images.length;
      if (!count) return;
      setView((v) => {
        const i = (next + count) % count;
        return { ...v, idx: i, loaded: v.loaded.includes(i) ? v.loaded : [...v.loaded, i] };
      });
    },
    [images.length],
  );

  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [tab, unit]);

  // Page scroll stays put while the overlay is up — Lenis needs telling too.
  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      restoreTo.current = document.activeElement as HTMLElement | null;
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
      panel.current?.focus();
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
      restoreTo.current?.focus?.();
    }
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        trapTab(e, panel.current);
        return;
      }
      if (tab !== "gallery") return;
      if (e.key === "ArrowRight") go(idx + 1);
      if (e.key === "ArrowLeft") go(idx - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, tab, idx, go, onClose]);

  // Swipe between renders on touch.
  const swipeX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    swipeX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (swipeX.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeX.current;
    swipeX.current = null;
    if (Math.abs(dx) > 45) go(idx + (dx < 0 ? 1 : -1));
  };

  const cfg = planConfig({ plan });
  const schedule = u ? planFor(u, listedStop(u, cfg.downOptions), plan) : null;
  const rows = schedule ? scheduleFor(schedule) : [];
  const floorPlan = u ? unitFloorPlan(u) : undefined;
  const image = images[idx];

  const waMsg =
    u && schedule
      ? [
          `Hi Zee99 — I'm interested in the ${u.name} at ${projectName} (~${u.area} sq ft).`,
          `Total price: ₨ ${fmtInt(schedule.total)}`,
          ...rows.map((r) =>
            r.count > 1
              ? `${r.label}: ${r.count} × ₨ ${fmtInt(r.amount)} = ₨ ${fmtInt(r.total)}`
              : `${r.label}: ₨ ${fmtInt(r.amount)}`,
          ),
          `Handover: month ${schedule.handoverMonths}`,
        ].join("\n")
      : "";

  return (
    // data-lenis-prevent: while the overlay is up Lenis is stopped, and a
    // stopped Lenis still swallows every wheel/touch event on the page — which
    // would leave the schedule and the thumbnail rail unscrollable. The
    // attribute makes it hand events inside the dialog back to the browser.
    <div
      data-lenis-prevent
      className={cn(
        "fixed inset-0 z-[80] flex items-end justify-center transition-[opacity,visibility] duration-400 sm:items-center sm:p-5",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-night/72 backdrop-blur-[3px]" />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={u ? `${u.name} — gallery, floor plan and payment plan` : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          // Bottom sheet on a phone (hugs its content), centred panel above sm.
          "relative flex max-h-[94dvh] w-full max-w-[980px] flex-col border border-ink/12 bg-paper shadow-[0_40px_120px_rgba(18,16,11,0.4)] outline-none",
          "transition-transform duration-500 ease-[var(--ease-out-expo)] sm:h-[92dvh] sm:max-h-[880px]",
          open ? "translate-y-0 sm:scale-100" : "translate-y-6 sm:translate-y-0 sm:scale-[0.97]",
        )}
      >
        {/* header */}
        <header className="shrink-0 border-b border-ink/10 px-5 pt-4 sm:px-9 sm:pt-6">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-ink-2">
                {projectName}
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
                <h2 className="font-display text-[clamp(1.5rem,3vw,2.05rem)] font-[380] leading-none tracking-[-0.01em] text-ink">
                  {u?.name}
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2">
                  ~{u?.area} sq ft ·{" "}
                  {schedule ? money(schedule.total, currency, { compact: true }) : "—"}
                  {cfg.tenureLabel && (
                    <span className="hidden sm:inline"> · {cfg.tenureLabel}</span>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="group relative -mr-1 h-10 w-10 shrink-0 rounded-full border border-ink/12 transition-colors duration-300 hover:border-ink/40"
            >
              <span className="absolute left-1/2 top-1/2 h-px w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ink transition-colors group-hover:bg-gold" />
              <span className="absolute left-1/2 top-1/2 h-px w-3.5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-ink transition-colors group-hover:bg-gold" />
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Residence details"
            className="-mb-px mt-5 flex gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {UNIT_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`unit-tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`unit-panel-${t.id}`}
                onClick={() => onTab(t.id)}
                className={cn(
                  "relative shrink-0 whitespace-nowrap pb-3.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors duration-300",
                  tab === t.id ? "text-ink" : "text-ink-2/70 hover:text-ink",
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-px origin-left bg-gold transition-transform duration-500 ease-[var(--ease-out-expo)]",
                    tab === t.id ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            ))}
          </div>
        </header>

        {/* body */}
        <div
          ref={body}
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-9 sm:py-7",
            // Media tabs fill the panel instead of scrolling; on a phone the
            // content is short, so it sits centred rather than stranded up top.
            tab !== "payment" && "flex flex-col justify-center sm:justify-start sm:overflow-hidden",
          )}
        >
          {/* gallery */}
          {tab === "gallery" && (
            <section
              role="tabpanel"
              id="unit-panel-gallery"
              aria-labelledby="unit-tab-gallery"
              className="flex flex-col sm:min-h-0 sm:flex-1"
            >
              {images.length === 0 ? (
                <Empty>Renders for this residence are being photographed.</Empty>
              ) : (
                <>
                  {/* The plate takes its width from the height left over, so a
                      render is never cropped and never pushes the rail off-screen. */}
                  <div className="flex justify-center sm:min-h-0 sm:flex-1">
                    <div
                      className="relative aspect-[137/100] w-full overflow-hidden border border-ink/10 bg-paper-2 sm:h-full sm:w-auto sm:max-w-full"
                      onTouchStart={onTouchStart}
                      onTouchEnd={onTouchEnd}
                    >
                      {images.map((im, i) =>
                        loaded.includes(i) ? (
                          <Image
                            key={im.image}
                            src={im.image}
                            alt={`${u?.name} — ${im.alt}`}
                            fill
                            sizes="(max-width: 1080px) 100vw, 900px"
                            className={cn(
                              "object-cover transition-opacity duration-500 ease-[var(--ease-out-expo)]",
                              i === idx ? "opacity-100" : "opacity-0",
                            )}
                            priority={i === 0}
                          />
                        ) : null,
                      )}
                      {images.length > 1 && (
                        <>
                          <Arrow dir="prev" onClick={() => go(idx - 1)} />
                          <Arrow dir="next" onClick={() => go(idx + 1)} />
                          <p className="pointer-events-none absolute right-4 top-4 bg-night/55 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-paper backdrop-blur-sm">
                            {String(idx + 1).padStart(2, "0")} /{" "}
                            {String(images.length).padStart(2, "0")}
                          </p>
                        </>
                      )}
                      <p className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-night/55 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.24em] text-paper/85 backdrop-blur-sm">
                        <span className="truncate">{image?.alt}</span>
                        <span className="hidden shrink-0 sm:block">Render</span>
                      </p>
                    </div>
                  </div>

                  {images.length > 1 && (
                    <div className="mt-4 flex shrink-0 justify-start gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin] sm:mt-5 sm:justify-center">
                      {images.map((im, i) => (
                        <button
                          key={im.image}
                          type="button"
                          onClick={() => go(i)}
                          aria-label={`View ${im.alt}`}
                          aria-current={i === idx}
                          className={cn(
                            "relative h-14 w-[5.25rem] shrink-0 overflow-hidden border transition-all duration-300 sm:h-[3.9rem] sm:w-[5.35rem]",
                            i === idx
                              ? "border-gold opacity-100"
                              : "border-ink/15 opacity-75 hover:opacity-100",
                          )}
                        >
                          <Image src={im.image} alt="" fill sizes="96px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* floor plan */}
          {tab === "floorplan" && (
            <section
              role="tabpanel"
              id="unit-panel-floorplan"
              aria-labelledby="unit-tab-floorplan"
              className="flex flex-col sm:min-h-0 sm:flex-1"
            >
              {!floorPlan ? (
                <Empty>The drawing for this residence is issued at booking.</Empty>
              ) : (
                <>
                  <div className="flex border border-ink/10 bg-white p-3 sm:min-h-0 sm:flex-1 sm:p-5">
                    <div className="relative aspect-[4/3] w-full sm:aspect-auto sm:min-h-0 sm:w-auto sm:flex-1">
                      <Image
                        src={floorPlan}
                        alt={`${u?.name} floor plan drawing, ~${u?.area} sq ft`}
                        fill
                        sizes="(max-width: 1080px) 100vw, 1000px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-x border-b border-ink/10 px-4 py-2.5">
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink-2/85">
                      Indicative drawing
                      <span className="hidden sm:inline"> · final plans issued at booking</span>
                    </span>
                    {!noCta && (
                      <a
                        href={floorPlan}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink transition-colors hover:text-gold"
                      >
                        Open full size ↗
                      </a>
                    )}
                  </div>
                </>
              )}
            </section>
          )}

          {/* payment plan */}
          {tab === "payment" && schedule && (
            <section role="tabpanel" id="unit-panel-payment" aria-labelledby="unit-tab-payment">
              <p className="max-w-3xl font-display text-[clamp(1.25rem,2.4vw,1.9rem)] font-[380] leading-[1.45] tracking-[-0.01em] text-ink">
                Pay <span className="text-gold">{amount(schedule.down)}</span> at booking, then{" "}
                <span className="text-gold">{amount(schedule.monthly)}</span> a month.{" "}
                <em className="italic">The keys are yours in month {schedule.handoverMonths}.</em>
              </p>

              {/* Each/No. fold away on a phone so the amount is never scrolled off. */}
              <div className="mt-9 overflow-x-auto">
                <table className="w-full border-collapse text-left sm:min-w-[440px]">
                  <thead>
                    <tr className="border-y border-ink/10 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-2">
                      <th className="py-3 pr-4 font-normal">Payment</th>
                      <th className="hidden py-3 pr-4 text-right font-normal sm:table-cell">Each</th>
                      <th className="hidden py-3 pr-4 text-right font-normal sm:table-cell">No.</th>
                      <th className="py-3 text-right font-normal">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.key} className="border-b border-ink/10">
                        <td className="py-3.5 pr-4 text-[0.9rem] text-ink">
                          <span className="flex items-baseline gap-2.5">
                            <span
                              className="h-[7px] w-[7px] shrink-0 rounded-full"
                              style={{ background: segColor(i) }}
                            />
                            <span>
                              {r.label}
                              {whenLabel(r) && (
                                <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-2/70">
                                  {whenLabel(r)}
                                </span>
                              )}
                              {r.count > 1 && (
                                <span className="mt-1 block font-mono text-[11px] tracking-[0.06em] text-ink-2 sm:hidden">
                                  {r.count} × {cell(r.amount)}
                                </span>
                              )}
                            </span>
                          </span>
                        </td>
                        <td className="hidden py-3.5 pr-4 text-right font-mono text-[12.5px] tracking-[0.04em] text-ink-2 sm:table-cell">
                          {cell(r.amount)}
                        </td>
                        <td className="hidden py-3.5 pr-4 text-right font-mono text-[12.5px] text-ink-2 sm:table-cell">
                          {r.count}
                        </td>
                        <td className="py-3.5 text-right font-mono text-[12.5px] tracking-[0.04em] text-ink">
                          {cell(r.total)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-4 pr-4 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink">
                        Total price
                      </td>
                      <td className="hidden sm:table-cell" colSpan={2} />
                      <td className="py-4 text-right font-mono text-[13.5px] tracking-[0.05em] text-gold">
                        {cell(schedule.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-9">
                <p className="eyebrow mb-4">Where the money goes</p>
                <div className="flex h-3 w-full overflow-hidden bg-ink/5">
                  {rows.map((r, i) => (
                    <span
                      key={r.key}
                      title={`${r.label} — ${amount(r.total)}`}
                      className="h-full"
                      style={{
                        width: `${(r.total / schedule.total) * 100}%`,
                        background: segColor(i),
                      }}
                    />
                  ))}
                </div>
                <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {rows.map((r, i) => (
                    <li key={r.key} className="flex items-baseline gap-2.5">
                      <span
                        className="h-[7px] w-[7px] shrink-0 rounded-full"
                        style={{ background: segColor(i) }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[0.84rem] text-ink-2">
                        {r.label}
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.06em] text-ink">
                        {Math.round((r.total / schedule.total) * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-9 max-w-2xl text-[11px] leading-[1.85] text-ink-2/85">
                The price is fixed. The structure, half-yearly and possession payments are tied to
                construction, never to a rate — no interest, no premium for paying over time. Every
                schedule is issued in writing at booking
                {currency === "PKR" ? "." : ", in PKR; the figures above are converted at today’s rate."}
              </p>
              {!noCta && <BrochureDownload brochure={brochure} className="mt-6" />}
            </section>
          )}
        </div>

        {/* footer */}
        <footer className="shrink-0 border-t border-ink/10 px-5 py-4 sm:px-9 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p
              className={cn(
                "font-mono text-[9px] uppercase tracking-[0.22em] text-ink-2/80",
                // With the CTA gone this line is the whole footer, so it earns
                // its place on a phone too.
                noCta ? "block" : "hidden sm:block",
              )}
            >
              {tab === "gallery"
                ? "Use ← → to move through the renders"
                : tab === "floorplan"
                  ? "Drawing · not to scale"
                  : cfg.handoverLabel || "Schedule issued at booking"}
            </p>
            {!noCta && (
              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                <Button external href={waLink(waMsg)} size="md" arrow className="flex-1 sm:flex-none">
                  Ask about this plan
                </Button>
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- bits */

function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const next = dir === "next";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={next ? "Next render" : "Previous render"}
      className={cn(
        "group absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-paper/35 bg-night/40 text-paper backdrop-blur-sm transition-colors duration-300 hover:bg-paper hover:text-ink",
        next ? "right-3 sm:right-5" : "left-3 sm:left-5",
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

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-dashed border-ink/15 px-6 py-16 text-center text-[0.95rem] text-ink-2">
      {children}
    </p>
  );
}

/** "Month 18" / "Months 6–36, every 6" — when a scheduled row is charged. */
function whenLabel(r: ScheduleRow): string {
  if (r.key === "booking") return ""; // the row label already says it
  if (r.key === "monthly") return `Months 1–${r.count}`;
  if (r.count === 1) return `Month ${r.months[0]}`;
  const gap = r.months.length > 1 ? r.months[1] - r.months[0] : 0;
  return `Months ${r.months[0]}–${r.months[r.months.length - 1]}${gap ? `, every ${gap}` : ""}`;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

/** Keeps Tab inside the panel while the overlay is up. */
function trapTab(e: KeyboardEvent, root: HTMLElement | null) {
  if (!root) return;
  const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null,
  );
  if (!items.length) return;
  const first = items[0];
  const lastItem = items[items.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && (active === first || active === root)) {
    e.preventDefault();
    lastItem.focus();
  } else if (!e.shiftKey && active === lastItem) {
    e.preventDefault();
    first.focus();
  }
}
