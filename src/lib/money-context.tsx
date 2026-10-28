"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getCurrency } from "./currencies";
import { formatMoney, formatMoneyInput, parseMoney, priceFieldLabel, pricesHint } from "./money";

type MoneyContextValue = {
  currency: string;
  format: (amount: number) => string;
  formatInput: (amount: number) => string;
  parse: (input: string) => number | null;
  priceFieldLabel: string;
  pricesHint: string;
  currencyLabel: string;
};

const MoneyContext = createContext<MoneyContextValue | null>(null);

export function MoneyProvider({ currency, children }: { currency: string; children: ReactNode }) {
  const value = useMemo(() => {
    const meta = getCurrency(currency);
    const code = meta.code;
    return {
      currency: code,
      format: (amount: number) => formatMoney(amount, code),
      formatInput: (amount: number) => formatMoneyInput(amount, code),
      parse: (input: string) => parseMoney(input, code),
      priceFieldLabel: priceFieldLabel(code),
      pricesHint: pricesHint(code),
      currencyLabel: meta.label,
    };
  }, [currency]);

  return <MoneyContext.Provider value={value}>{children}</MoneyContext.Provider>;
}

export function useMoney(): MoneyContextValue {
  const ctx = useContext(MoneyContext);
  if (!ctx) {
    return {
      currency: "XOF",
      format: (n) => formatMoney(n, "XOF"),
      formatInput: (n) => formatMoneyInput(n, "XOF"),
      parse: (s) => parseMoney(s, "XOF"),
      priceFieldLabel: priceFieldLabel("XOF"),
      pricesHint: pricesHint("XOF"),
      currencyLabel: getCurrency("XOF").label,
    };
  }
  return ctx;
}
