/**
 * Static FX table — PKR per one unit of currency.
 * Update monthly (see content spec). Placeholder mid-2026 rates;
 * reconcile with finance before launch.
 */
export const CURRENCIES = {
  PKR: { code: "PKR", symbol: "₨ ", flag: "🇵🇰", pkrPerUnit: 1, label: "Pakistani Rupee" },
  GBP: { code: "GBP", symbol: "£", flag: "🇬🇧", pkrPerUnit: 357, label: "British Pound" },
  USD: { code: "USD", symbol: "$", flag: "🇺🇸", pkrPerUnit: 283, label: "US Dollar" },
  AUD: { code: "AUD", symbol: "A$", flag: "🇦🇺", pkrPerUnit: 186, label: "Australian Dollar" },
  EUR: { code: "EUR", symbol: "€", flag: "🇪🇺", pkrPerUnit: 306, label: "Euro" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const CURRENCY_ORDER: CurrencyCode[] = ["PKR", "GBP", "USD", "AUD", "EUR"];
