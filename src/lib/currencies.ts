/** Devises disponibles pour un Boutique (montants entiers = plus petite unité : centimes pour EUR, unité entière pour XOF). */
export type CurrencyCode =
  | "XOF"
  | "XAF"
  | "EUR"
  | "USD"
  | "GBP"
  | "MAD"
  | "NGN"
  | "GHS"
  | "GNF"
  | "CDF"
  | "MUR";

export interface CurrencyMeta {
  code: CurrencyCode;
  /** Libellé pour les listes (français). */
  label: string;
  /** Nombre de décimales (0 = pas de centimes, 2 = montants stockés en centimes). */
  minorUnits: 0 | 2;
  locale: string;
}

export const COMPANY_CURRENCIES: CurrencyMeta[] = [
  { code: "XOF", label: "Franc CFA (BCEAO) - XOF", minorUnits: 0, locale: "fr-FR" },
  { code: "XAF", label: "Franc CFA (BEAC) - XAF", minorUnits: 0, locale: "fr-FR" },
  { code: "EUR", label: "Euro - EUR", minorUnits: 2, locale: "fr-FR" },
  { code: "USD", label: "Dollar US - USD", minorUnits: 2, locale: "fr-FR" },
  { code: "GBP", label: "Livre sterling - GBP", minorUnits: 2, locale: "fr-FR" },
  { code: "MAD", label: "Dirham marocain - MAD", minorUnits: 2, locale: "fr-FR" },
  { code: "NGN", label: "Naira - NGN", minorUnits: 2, locale: "fr-FR" },
  { code: "GHS", label: "Cedi - GHS", minorUnits: 2, locale: "fr-FR" },
  { code: "GNF", label: "Franc guinéen - GNF", minorUnits: 0, locale: "fr-FR" },
  { code: "CDF", label: "Franc congolais - CDF", minorUnits: 0, locale: "fr-FR" },
  { code: "MUR", label: "Roupie mauricienne - MUR", minorUnits: 2, locale: "fr-FR" },
];

const BY_CODE = new Map(COMPANY_CURRENCIES.map((c) => [c.code, c]));

export function normalizeCurrency(code: string | null | undefined): CurrencyCode {
  const u = (code ?? "XOF").toUpperCase();
  return BY_CODE.has(u as CurrencyCode) ? (u as CurrencyCode) : "XOF";
}

export function getCurrency(code: string | null | undefined): CurrencyMeta {
  return BY_CODE.get(normalizeCurrency(code)) ?? BY_CODE.get("XOF")!;
}

export function isCompanyCurrency(code: string): code is CurrencyCode {
  return BY_CODE.has(code.toUpperCase() as CurrencyCode);
}
