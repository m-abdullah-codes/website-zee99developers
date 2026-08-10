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

/**
 * Format a PKR amount in the chosen currency. `symbol: false` drops the sign
 * for ledgers that name their currency once in a heading or footnote rather
 * than on every one of thirty cells.
 */
export function money(
  amountPKR: number,
  currency: CurrencyCode = "PKR",
  opts: { compact?: boolean; symbol?: boolean } = {},
): string {
  const cur = CURRENCIES[currency];
  const sign = opts.symbol === false ? "" : null;
  if (currency === "PKR") {
    const body =
      opts.compact && amountPKR >= 1e5 ? pkrCompact(amountPKR) : fmtInt(amountPKR);
    return sign === null ? `₨ ${body}` : body;
  }
  const v = amountPKR / cur.pkrPerUnit;
  const rounded = v >= 1000 ? Math.round(v / 10) * 10 : Math.round(v);
  return `${sign ?? cur.symbol}${rounded.toLocaleString("en-US")}`;
}

/** "1.28 – 1.45 Cr" style range in PKR. */
export function pkrRange(low: number, high: number): string {
  return `${pkrCompact(low)} – ${pkrCompact(high)}`;
}

/**
 * The same range in whichever currency is on. PKR keeps the crore/lac shorthand
 * with one rupee sign for the pair; every other currency prints both figures in
 * full, since "$45,000 – $51,000" is how they are read.
 */
export function moneyRange(low: number, high: number, currency: CurrencyCode = "PKR"): string {
  if (currency === "PKR") return `₨ ${pkrRange(low, high)}`;
  return `${money(low, currency, { compact: true })} – ${money(high, currency, { compact: true })}`;
}
