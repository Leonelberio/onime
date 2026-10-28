"use client";

import { MoneyProvider } from "@/lib/money-context";

export function StaffMoneyProvider({ currency, children }: { currency: string; children: React.ReactNode }) {
  return <MoneyProvider currency={currency}>{children}</MoneyProvider>;
}
