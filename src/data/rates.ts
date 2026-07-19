// FX table sourced from D1 at build time (settings.rates) — PKR per one unit.
// Edit monthly in the dashboard under Settings → Rates.
import settings from "../../content/settings.json";

export type Currency = {
  code: string;
  symbol: string;
  flag: string;
  pkrPerUnit: number;
  label: string;
};

export type CurrencyCode = string;

const list = (settings.rates as { currencies: Currency[] }).currencies;

export const CURRENCIES: Record<CurrencyCode, Currency> = Object.fromEntries(
  list.map((c) => [c.code, c]),
);

export const CURRENCY_ORDER: CurrencyCode[] = list.map((c) => c.code);
