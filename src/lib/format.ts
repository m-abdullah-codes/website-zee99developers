import { CURRENCIES, type CurrencyCode } from "@/data/rates";

/** 550000 -> "550,000" */
export const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

/**
 * Compact PKR the way the market speaks:
 * >= 1 crore -> "1.61 Cr", else -> "72 Lacs" (or "5.5 Lacs").
 */
export function pkrCompact(n: number): string {
  if (n >= 1e7) {
    const cr = n / 1e7;
    return `${trim(cr)} Cr`;
  }
  const lacs = n / 1e5;
  return `${trim(lacs)} ${lacs === 1 ? "Lac" : "Lacs"}`;
}

function trim(v: number): string {
  const r = Math.round(v * 100) / 100;
  return r.toFixed(2).replace(/\.?0+$/, "");
}

/** Ledger-style fixed formats: "1.20 Cr" / "107 Lacs" — unit chosen per series, as the market speaks. */
export const crFmt = (n: number) => `${(n / 1e7).toFixed(2)} Cr`;
export const lacFmt = (n: number) => `${Math.round(n / 1e5)} Lacs`;

/** Format a PKR amount in the chosen currency. */
export function money(
  amountPKR: number,
  currency: CurrencyCode = "PKR",
  opts: { compact?: boolean } = {},
): string {
  const cur = CURRENCIES[currency];
  if (currency === "PKR") {
    return opts.compact && amountPKR >= 1e5
      ? `₨ ${pkrCompact(amountPKR)}`
      : `₨ ${fmtInt(amountPKR)}`;
  }
  const v = amountPKR / cur.pkrPerUnit;
  const rounded = v >= 1000 ? Math.round(v / 10) * 10 : Math.round(v);
  return `${cur.symbol}${rounded.toLocaleString("en-US")}`;
}

/** "1.28 – 1.45 Cr" style range in PKR. */
export function pkrRange(low: number, high: number): string {
  return `${pkrCompact(low)} – ${pkrCompact(high)}`;
}
