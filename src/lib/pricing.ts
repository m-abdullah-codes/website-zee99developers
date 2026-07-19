import type { DownPct, Unit } from "@/data/projects";

/** Full plan value: booking amount + every installment. */
export const unitTotal = (u: Unit) => u.down + u.monthly * u.months;

/**
 * Derive a 10/15/20% plan from the unit's total.
 * The 20% stop returns the official listed plan (poster figures) so the UI
 * always reconciles with the published price list; 10/15 are derived, with
 * monthlies rounded to a clean 250 step. Schedules are issued in writing at booking.
 */
export function planFor(u: Unit, pct: DownPct) {
  const total = unitTotal(u);
  if (pct === 20) {
    return { pct, down: u.down, monthly: u.monthly, months: u.months, total };
  }
  const down = Math.round((total * pct) / 100 / 1000) * 1000;
  const monthly = Math.round((total - down) / u.months / 250) * 250;
  return { pct, down, monthly, months: u.months, total };
}

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
  ((rentMonthly * 12) / total) * 100;
