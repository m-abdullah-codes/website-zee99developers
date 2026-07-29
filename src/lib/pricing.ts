import {
  DOWN_OPTIONS,
  type DownPct,
  type Milestone,
  type PlanConfig,
  type PlannerConfig,
  type Project,
  type Unit,
} from "@/data/projects";

/* ------------------------------------------------------------------ totals */

const num = (v: unknown, fallback = 0) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

/** Occurrences × amount, guarded against half-filled dashboard rows. */
export const milestoneTotal = (m: Milestone) =>
  num(m.amount) * Math.max(0, Math.round(num(m.count, 1)));

export const milestonesTotal = (u: Unit) =>
  (u.milestones ?? []).reduce((s, m) => s + milestoneTotal(m), 0);

/** Everything the schedule adds up to: booking + instalments + milestones. */
export const scheduleTotal = (u: Unit) =>
  num(u.down) + num(u.monthly) * Math.max(0, num(u.months)) + milestonesTotal(u);

/**
 * The unit's price. The listed total wins when it is set, so the headline
 * figure on the poster is always what the site shows; the schedule is
 * reconciled against it in the dashboard rather than silently re-derived.
 */
export const unitTotal = (u: Unit) => (num(u.price) > 0 ? u.price! : scheduleTotal(u));

/** Signed gap between the schedule and the listed price — 0 when balanced. */
export const reconcile = (u: Unit) => scheduleTotal(u) - unitTotal(u);

/* ------------------------------------------------------------- plan config */

const DEFAULTS = { roundTo: 500 };

export function planConfig(project?: Pick<Project, "plan" | "units">): Required<
  Pick<PlanConfig, "downOptions" | "roundTo">
> &
  PlanConfig {
  const p = project?.plan ?? {};
  const options = (p.downOptions ?? DOWN_OPTIONS)
    .map((n) => Math.round(num(n)))
    .filter((n) => n > 0 && n < 100)
    .sort((a, b) => a - b);
  return {
    ...p,
    downOptions: options.length ? Array.from(new Set(options)) : [...DOWN_OPTIONS],
    roundTo: Math.max(1, Math.round(num(p.roundTo, DEFAULTS.roundTo))),
  };
}

/** The stop that reproduces the listed poster plan — the nearest one to it. */
export function listedStop(u: Unit, options: number[]): DownPct {
  const total = unitTotal(u);
  if (!total || !options.length) return options[options.length - 1] ?? 20;
  const actual = (num(u.down) / total) * 100;
  return options.reduce((best, o) =>
    Math.abs(o - actual) < Math.abs(best - actual) ? o : best,
  );
}

/* ------------------------------------------------------------------- plans */

export type Plan = {
  pct: DownPct;
  /** True when these are the published poster figures, not derived ones. */
  listed: boolean;
  down: number;
  monthly: number;
  months: number;
  milestones: Milestone[];
  milestonesTotal: number;
  total: number;
  handoverMonths: number;
};

/**
 * Derive the plan for a given down-payment stop.
 *
 * The price is fixed, and so are the construction-linked milestones — only the
 * booking cheque and the monthly run flex against each other. A smaller down
 * payment therefore redistributes the same money into larger instalments and
 * never adds a premium. The monthly is rounded to a clean step and the down
 * payment absorbs the remainder, so `down + monthly × months + milestones`
 * equals the total exactly at every stop. Schedules are issued in writing at
 * booking.
 */
export function planFor(u: Unit, pct: DownPct, cfg?: PlanConfig): Plan {
  const { roundTo, downOptions, handoverMonths } = planConfig({ plan: cfg });
  const months = Math.max(1, Math.round(num(u.months, 1)));
  const milestones = u.milestones ?? [];
  const msTotal = milestonesTotal(u);
  const total = unitTotal(u);
  const base = {
    pct,
    months,
    milestones,
    milestonesTotal: msTotal,
    total,
    handoverMonths: Math.max(1, Math.round(num(handoverMonths, months))),
  };

  if (pct === listedStop(u, downOptions)) {
    return { ...base, listed: true, down: num(u.down), monthly: num(u.monthly) };
  }

  // Pool the booking cheque and the monthly run share; milestones stay put.
  const flex = Math.max(0, total - msTotal);
  const target = Math.min(flex, Math.max(0, (total * pct) / 100));
  const monthly = Math.max(0, Math.round((flex - target) / months / roundTo) * roundTo);
  const down = Math.max(0, flex - monthly * months);
  return { ...base, listed: false, down, monthly };
}

/** Every stop for a unit, cheapest booking cheque first. */
export const plansFor = (u: Unit, cfg?: PlanConfig) =>
  planConfig({ plan: cfg }).downOptions.map((p) => planFor(u, p, cfg));

/* --------------------------------------------------------------- schedules */

export type ScheduleRow = {
  key: string;
  label: string;
  /** PKR per occurrence. */
  amount: number;
  count: number;
  total: number;
  /** Months at which this row is charged — drives the timeline markers. */
  months: number[];
};

/** Months at which a milestone falls, evenly spread when timing is unset. */
export function milestoneMonths(m: Milestone, term: number): number[] {
  const count = Math.max(1, Math.round(num(m.count, 1)));
  const step = num(m.everyMonths) > 0 ? m.everyMonths! : term / count;
  const first = num(m.atMonth) > 0 ? m.atMonth! : step;
  return Array.from({ length: count }, (_, i) =>
    Math.min(term, Math.round(first + i * step)),
  );
}

/** The plan as line items, in the order a buyer pays them. */
export function scheduleFor(plan: Plan): ScheduleRow[] {
  const rows: ScheduleRow[] = [
    {
      key: "booking",
      label: "Down payment, at booking",
      amount: plan.down,
      count: 1,
      total: plan.down,
      months: [0],
    },
  ];
  if (plan.monthly > 0) {
    rows.push({
      key: "monthly",
      label: `Monthly instalments`,
      amount: plan.monthly,
      count: plan.months,
      total: plan.monthly * plan.months,
      months: Array.from({ length: plan.months }, (_, i) => i + 1),
    });
  }
  plan.milestones.forEach((m, i) => {
    if (!milestoneTotal(m)) return;
    rows.push({
      key: `milestone-${i}`,
      label: m.label || "Milestone payment",
      amount: num(m.amount),
      count: Math.max(1, Math.round(num(m.count, 1))),
      total: milestoneTotal(m),
      months: milestoneMonths(m, plan.months),
    });
  });
  return rows;
}

/* ----------------------------------------------------------- planner rows */

export type PlannerRow = { key: string; label: string };

/** Stable key for a milestone row, so hiding survives a label edit poorly but
 *  an amount edit fine — labels are what the admin actually toggles. */
export const milestoneRowKey = (label: string) => `milestone:${label || "Milestone payment"}`;

/**
 * Every result row the planner can show, in display order, for a whole
 * project. The admin's visibility toggles and the calculator both read this,
 * so the two can never drift apart.
 */
export function plannerRows(units: Unit[]): PlannerRow[] {
  const rows: PlannerRow[] = [{ key: "down", label: "Down payment, at booking" }];
  const seen = new Set<string>();
  units.forEach((u) =>
    (u.milestones ?? []).forEach((m) => {
      const label = m.label || "Milestone payment";
      const key = milestoneRowKey(label);
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({ key, label: m.count > 1 ? `${label} (×${m.count})` : label });
    }),
  );
  rows.push(
    { key: "total", label: "Total investment" },
    { key: "projected", label: "Projected value at handover" },
    { key: "yield", label: "Est. rental yield" },
    { key: "schedule", label: "“See the full schedule” disclosure" },
  );
  return rows;
}

/** Row-visibility test shared by the calculator and the dashboard preview. */
export function rowVisible(cfg: PlannerConfig | undefined, key: string) {
  return !(cfg?.hiddenRows ?? []).includes(key);
}

/* ------------------------------------------------------------- projections */

export function projectedRange(
  total: number,
  months: number,
  band: { low: number; high: number },
) {
  const years = months / 12;
  return {
    low: total * Math.pow(1 + band.low, years),
    high: total * Math.pow(1 + band.high, years),
  };
}

export const yieldPct = (rentMonthly: number, total: number) =>
  total > 0 ? ((rentMonthly * 12) / total) * 100 : 0;
