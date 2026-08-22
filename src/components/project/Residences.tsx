"use client";

import { useState } from "react";
import Image from "next/image";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import UnitDialog, { type UnitTab } from "@/components/project/UnitDialog";
import CurrencySwitch, { useCurrency } from "@/components/tools/Currency";
import TapCue, { Verb } from "@/components/ui/TapCue";
import { cn } from "@/lib/utils";
import type { Brochure, Milestone, PlanConfig, Unit } from "@/data/projects";
import type { CurrencyCode } from "@/data/rates";
import { milestoneTotal, planConfig, unitTotal } from "@/lib/pricing";
import { money } from "@/lib/format";
import { unitGallery } from "@/data/unitMedia";

const ACTIONS: { id: UnitTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "gallery",
    label: "Gallery",
    icon: (
      <>
        <rect x="2.5" y="4" width="19" height="16" rx="1" />
        <path d="M2.5 16.5 8 11l4.5 4.5L16 12l5.5 5.5" />
        <circle cx="8.5" cy="8.5" r="1.4" />
      </>
    ),
  },
  {
    id: "floorplan",
    label: "Floor plan",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <path d="M3 14h7m0-11v18m0-7h11M14 21v-7" />
      </>
    ),
  },
  {
    id: "payment",
    label: "Payment plan",
    icon: (
      <>
        <rect x="2.5" y="6" width="19" height="12" rx="1" />
        <circle cx="12" cy="12" r="2.6" />
        <path d="M6 10.5v3M18 10.5v3" />
      </>
    ),
  },
];

export default function Residences({
  units,
  projectName,
  plan,
  brochure,
  no = "02",
  noCta = false,
  lede = "Open any residence for the interiors, the floor plan and the full payment schedule — the three things worth seeing before you decide.",
  cue,
}: {
  units: Unit[];
  projectName: string;
  plan?: PlanConfig;
  brochure?: Brochure;
  no?: string;
  /** Passed to the dialog: no WhatsApp button, no brochure download, no links. */
  noCta?: boolean;
  lede?: string;
  /**
   * What the cards open, said in one line beside the section head. Set on the
   * e-brochure, where the page carries no other controls and the cards are the
   * only thing on it that does anything; the site's own project page leaves it
   * off, because a visitor there has already met a dozen buttons.
   */
  cue?: string;
}) {
  const [open, setOpen] = useState<{ unit: Unit; tab: UnitTab } | null>(null);
  const [compared, setCompared] = useState(0);
  const [cur, setCur] = useCurrency();
  // The cue has done its job the moment anything is opened, and a reader who
  // has opened one card does not need telling about the next two.
  const [taught, setTaught] = useState(false);
  const cfg = planConfig({ plan });
  const rows = compareRows(units, cur);
  const picked = Math.min(compared, units.length - 1);

  const show = (unit: Unit, tab: UnitTab) => {
    setTaught(true);
    setOpen({ unit, tab });
  };

  return (
    <section id="residences" className="border-t border-ink/10 bg-paper-2/55 py-24 md:py-32">
      <div className="container-x">
        <SectionHead
          no={no}
          label="The residences"
          title={
            <>
              Three ways <em className="italic text-gold">in.</em>
            </>
          }
          lede={lede}
          className={cue ? "mb-8" : "mb-16"}
        />

        {/* The fade is on the chip, not on the `Reveal` around it: `Reveal`
            finishes by writing `opacity: 1` inline, and an inline style beats a
            class — so a `taught` fade put on the wrapper would never land. */}
        {cue && (
          <Reveal delay={0.24} className="mb-10 flex print:hidden">
            <TapCue
              tone="paper"
              className={cn("transition-opacity duration-700", taught && "opacity-0")}
            >
              <Verb /> {cue}
            </TapCue>
          </Reveal>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {units.map((u, i) => {
            const gallery = unitGallery(u);
            const cover = gallery[0];
            return (
              <Reveal
                key={u.id}
                delay={i * 0.1}
                className="group flex flex-col border border-ink/15 bg-paper transition-colors duration-500 hover:border-gold-2/60 has-[:focus-visible]:border-gold-2"
              >
                {cover && (
                  <button
                    type="button"
                    onClick={() => show(u, "gallery")}
                    aria-label={`Open the ${u.name} gallery`}
                    className="relative block aspect-[137/100] w-full overflow-hidden border-b border-ink/10 bg-paper-2"
                  >
                    <Image
                      src={cover.image}
                      alt={`${u.name} — ${cover.alt}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                    />
                    <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-night/60 to-transparent" />
                    <span className="absolute bottom-4 left-4 flex items-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-paper transition-colors duration-500 group-hover:text-gold-3">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        className="h-3.5 w-3.5"
                        aria-hidden
                      >
                        <rect x="2.5" y="4" width="19" height="16" rx="1" />
                        <path d="M2.5 16.5 8 11l4.5 4.5L16 12l5.5 5.5" />
                      </svg>
                      {gallery.length} renders
                    </span>
                    {/* Drawn, not hovered into existence: on a phone there is no
                        hover, and a picture with nothing on it is a picture. */}
                    <span
                      aria-hidden
                      className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-paper/95 text-ink shadow-[0_10px_28px_-12px_color-mix(in_srgb,var(--color-ink)_80%,transparent)] transition-colors duration-500 group-hover:bg-gold group-hover:text-paper"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-[17px] w-[17px]"
                      >
                        <path d="M14 4h6v6M20 4l-7.5 7.5M10 20H4v-6M4 20l7.5-7.5" />
                      </svg>
                    </span>
                  </button>
                )}

                <div className="flex flex-1 flex-col p-7 sm:p-8">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-mono text-[12px] uppercase tracking-[0.3em] text-ink">
                      {u.name}
                    </h3>
                    <span className="font-mono text-[10px] tracking-[0.12em] text-ink-2">
                      ~{u.area} sq ft
                    </span>
                  </div>

                  <p className="mt-7 font-display text-[2rem] font-[380] leading-none tracking-[-0.01em] text-ink">
                    {money(unitTotal(u), cur, { compact: true })}
                    <span className="mt-2 block font-sans text-[0.8rem] font-normal tracking-normal text-ink-2">
                      total price
                    </span>
                  </p>

                  <dl className="mt-6 space-y-2.5 border-t border-ink/10 pt-6 font-mono text-[13px] tracking-[0.06em] text-ink">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="font-sans text-[0.8rem] tracking-normal text-ink-2">Down</dt>
                      <dd>{money(u.down, cur)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="font-sans text-[0.8rem] tracking-normal text-ink-2">Monthly</dt>
                      <dd>
                        {u.months} × {money(u.monthly, cur)}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-6 flex-1 text-[0.94rem] leading-[1.8] text-ink-2">{u.blurb}</p>
                </div>

                {/* Three buttons, drawn as three buttons. They used to be bare
                    icons on the card's own ground, which on a desktop the
                    cursor explained and on a phone nothing did — so they now
                    sit on a toned bar under a gold rule, take the ink the rest
                    of the card's small type does not, and answer a press with
                    a colour rather than with a dialog appearing out of
                    nowhere. */}
                <div className="grid grid-cols-3 divide-x divide-ink/12 border-t-2 border-gold-2/70 bg-paper-2/70">
                  {ACTIONS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => show(u, a.id)}
                      className="group/act flex flex-col items-center gap-2.5 px-2 py-5 text-ink transition-colors duration-300 hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper active:bg-ink active:text-paper"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-[19px] w-[19px] text-gold transition-colors duration-300 group-hover/act:text-gold-3 group-focus-visible/act:text-gold-3 group-active/act:text-gold-3"
                        aria-hidden
                      >
                        {a.icon}
                      </svg>
                      <span className="text-center font-mono text-[9.5px] uppercase leading-[1.4] tracking-[0.16em]">
                        {a.label}
                      </span>
                      <span className="sr-only">for the {u.name}</span>
                    </button>
                  ))}
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* the poster plan, side by side */}
        <Reveal delay={0.1} className="mt-16 border border-ink/10 bg-paper">
          {/* The currency sits with the plans, not only with the projection
              further down — an overseas buyer meets the figures here first. */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-ink/10 px-5 py-4 sm:px-7">
            <p className="eyebrow text-ink">Payment plans, side by side</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-2">
                {[cfg.tenureLabel, cfg.handoverLabel].filter(Boolean).join(" · ")}
              </p>
              <CurrencySwitch value={cur} onChange={setCur} className="-my-1.5" />
            </div>
          </div>

          {/* phone + tablet: one plan at a time, nothing to scroll sideways */}
          <div className="lg:hidden">
            <div
              role="tablist"
              aria-label="Compare payment plans"
              className="grid grid-cols-3 divide-x divide-ink/10 border-b border-ink/10"
            >
              {units.map((u, i) => (
                <button
                  key={u.id}
                  type="button"
                  role="tab"
                  aria-selected={picked === i}
                  onClick={() => setCompared(i)}
                  className={cn(
                    "relative px-2 py-4 transition-colors duration-300",
                    picked === i ? "bg-paper text-ink" : "text-ink-2/75 hover:text-ink",
                  )}
                >
                  <span className="block font-mono text-[10px] uppercase tracking-[0.2em]">
                    {u.name}
                  </span>
                  <span className="mt-1.5 block font-mono text-[9px] tracking-[0.12em] text-ink-2">
                    ~{u.area} sq ft
                  </span>
                  <span
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-px origin-center bg-gold transition-transform duration-500 ease-[var(--ease-out-expo)]",
                      picked === i ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </button>
              ))}
            </div>

            <dl className="divide-y divide-ink/10">
              {rows.map((r) => (
                <div
                  key={r.label}
                  className={cn(
                    "flex items-baseline justify-between gap-4 px-5 py-3.5",
                    r.strong && "bg-paper-2/50",
                  )}
                >
                  <dt className="text-[0.9rem] text-ink">
                    {r.label}
                    {r.note && (
                      <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-2/70">
                        {r.note}
                      </span>
                    )}
                  </dt>
                  <dd
                    className={cn(
                      "shrink-0 font-mono tracking-[0.04em]",
                      r.strong ? "text-[13.5px] text-gold" : "text-[12.5px] text-ink",
                    )}
                  >
                    {r.values[picked]}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="border-t border-ink/10 px-5 py-4">
              <button
                type="button"
                onClick={() => show(units[picked], "payment")}
                className="link-mono text-ink hover:text-gold"
              >
                Full schedule
                <span aria-hidden>→</span>
                <span className="sr-only">for the {units[picked]?.name}</span>
              </button>
            </div>
          </div>

          {/* desktop: all three columns at once */}
          <div className="hidden lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-ink/10">
                  <th className="px-7 py-4 font-mono text-[9px] font-normal uppercase tracking-[0.2em] text-ink-2">
                    Payment
                  </th>
                  {units.map((u) => (
                    <th key={u.id} className="px-5 py-4 text-right font-normal">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-ink">
                        {u.name}
                      </span>
                      <span className="mt-1.5 block font-mono text-[9px] tracking-[0.14em] text-ink-2">
                        ~{u.area} sq ft
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.label}
                    className={cn(
                      "border-b border-ink/10",
                      r.strong && "bg-paper-2/45",
                    )}
                  >
                    <th
                      scope="row"
                      className="px-7 py-3.5 text-left text-[0.9rem] font-normal text-ink"
                    >
                      {r.label}
                      {r.note && (
                        <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-2/70">
                          {r.note}
                        </span>
                      )}
                    </th>
                    {r.values.map((v, i) => (
                      <td
                        key={units[i]?.id ?? i}
                        className={cn(
                          "px-5 py-3.5 text-right font-mono tracking-[0.04em]",
                          r.strong ? "text-[13.5px] text-gold" : "text-[12.5px] text-ink",
                        )}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="px-7 py-4" />
                  {units.map((u) => (
                    <td key={u.id} className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => show(u, "payment")}
                        className="link-mono text-ink hover:text-gold"
                      >
                        Full schedule
                        <span aria-hidden>→</span>
                        <span className="sr-only">for the {u.name}</span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <p className="border-t border-ink/10 px-5 py-4 font-mono text-[9px] uppercase leading-[1.8] tracking-[0.18em] text-ink-2/80 sm:px-7">
            {cur === "PKR"
              ? "All figures in PKR"
              : `All figures in ${cur}, converted from PKR at today's rate`}{" "}
            · construction-linked, never rate-linked · schedules issued in writing at booking
          </p>
        </Reveal>
      </div>

      <UnitDialog
        unit={open?.unit ?? null}
        tab={open?.tab ?? "gallery"}
        onTab={(tab) => setOpen((o) => (o ? { ...o, tab } : o))}
        onClose={() => setOpen(null)}
        projectName={projectName}
        plan={plan}
        brochure={brochure}
        currency={cur}
        noCta={noCta}
      />
    </section>
  );
}

/* ------------------------------------------------------------- comparison */

type CompareRow = { label: string; note?: string; values: string[]; strong?: boolean };

/** Milestone labels across every unit, in the order they first appear. */
function milestoneOrder(units: Unit[]): string[] {
  const seen: string[] = [];
  units.forEach((u) =>
    (u.milestones ?? []).forEach((m) => {
      const label = m.label || "Milestone payment";
      if (!seen.includes(label)) seen.push(label);
    }),
  );
  return seen;
}

const findMilestone = (u: Unit, label: string): Milestone | undefined =>
  (u.milestones ?? []).find((m) => (m.label || "Milestone payment") === label);

/** The poster table: one row per payment stream, one column per unit. The
 *  currency is named once in the footnote, not thirty times in the cells. */
function compareRows(units: Unit[], cur: CurrencyCode): CompareRow[] {
  const amount = (n: number) => (n > 0 ? money(n, cur, { symbol: false }) : "—");
  const months = units.every((u) => u.months === units[0]?.months) ? units[0]?.months : null;

  const rows: CompareRow[] = [
    { label: "Total price", values: units.map((u) => amount(unitTotal(u))), strong: true },
    { label: "Down payment", note: "At booking", values: units.map((u) => amount(u.down)) },
    {
      label: "Monthly instalment",
      note: months ? `× ${months}` : "Each",
      values: units.map((u) => amount(u.monthly)),
    },
  ];

  milestoneOrder(units).forEach((label) => {
    const counts = units.map((u) => findMilestone(u, label)?.count ?? 0);
    const count = Math.max(...counts, 0);
    rows.push({
      label,
      note: count > 1 ? `× ${count}` : undefined,
      values: units.map((u) => {
        const m = findMilestone(u, label);
        return m && milestoneTotal(m) > 0 ? amount(m.amount) : "—";
      }),
    });
  });

  return rows;
}
