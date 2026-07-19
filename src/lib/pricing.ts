import type { DownPct, Unit } from "@/data/projects";

/** Full plan value: booking amount + every installment. */
export const unitTotal = (u: Unit) => u.down + u.monthly * u.months;

/**
 * Derive a 10/15/20% plan from the unit's total.
 * The property total is fixed — a smaller down payment only redistributes the
 * same amount into larger installments, it never adds a premium. The 20% stop
 * returns the official listed plan (poster figures). For 10/15 the monthly is
 * rounded to a clean 250 step and the down payment absorbs the remainder, so
 * `down + monthly × months` always equals the total exactly, at every stop.
 * Schedules are issued in writing at booking.
 */
export function planFor(u: Unit, pct: DownPct) {
  const total = unitTotal(u);
  if (pct === 20) {
    return { pct, down: u.down, monthly: u.monthly, months: u.months, total };
  }
  const monthly = Math.round((total * (1 - pct / 100)) / u.months / 250) * 250;
  const down = total - monthly * u.months;
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
