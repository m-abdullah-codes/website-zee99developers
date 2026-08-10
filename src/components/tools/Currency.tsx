"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { CURRENCY_ORDER, type CurrencyCode } from "@/data/rates";

/**
 * One currency choice per page.
 *
 * The project page shows the same money twice — the published payment plans in
 * the residences section, then the projection in the returns section — and each
 * carries its own switch. They read and write this one value, so an overseas
 * buyer picks their currency once and the whole page follows; two switches
 * disagreeing about what a rupee is would be worse than one.
 */
type Ctx = { cur: CurrencyCode; setCur: (c: CurrencyCode) => void };

const CurrencyCtx = createContext<Ctx | null>(null);

export function CurrencyProvider({
  children,
  initial = "PKR",
}: {
  children: React.ReactNode;
  initial?: CurrencyCode;
}) {
  const [cur, setCur] = useState<CurrencyCode>(initial);
  return <CurrencyCtx.Provider value={{ cur, setCur }}>{children}</CurrencyCtx.Provider>;
}

/** Page-wide currency when a provider is up, component-local otherwise. */
export function useCurrency(): [CurrencyCode, (c: CurrencyCode) => void] {
  const shared = useContext(CurrencyCtx);
  const local = useState<CurrencyCode>("PKR");
  return shared ? [shared.cur, shared.setCur] : local;
}

/** The pill row. Same control wherever a currency can be chosen. */
export default function CurrencySwitch({
  value,
  onChange,
  className,
}: {
  value: CurrencyCode;
  onChange: (c: CurrencyCode) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)} role="group" aria-label="Currency">
      {CURRENCY_ORDER.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-pressed={value === c}
          className={cn(
            "rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] transition-colors duration-300",
            value === c ? "bg-ink text-paper" : "text-ink-2 hover:text-ink",
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
