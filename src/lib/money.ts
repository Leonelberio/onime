import { getCurrency, normalizeCurrency, type CurrencyCode } from "./currencies";

function majorFromMinor(minor: number, minorUnits: number): number {
  return minorUnits === 0 ? minor : minor / 10 ** minorUnits;
}

function minorFromMajor(major: number, minorUnits: number): number {
  return minorUnits === 0 ? Math.round(major) : Math.round(major * 10 ** minorUnits);
}

/** Affiche un montant stocké (plus petite unité) avec la devise du Boutique. */
export function formatMoney(amount: number, currencyCode: string | null | undefined): string {
  const c = getCurrency(currencyCode);
  const major = majorFromMinor(Math.round(amount), c.minorUnits);
  const formatted = new Intl.NumberFormat(c.locale, {
    style: "currency",
    currency: c.code,
    minimumFractionDigits: c.minorUnits,
    maximumFractionDigits: c.minorUnits,
  }).format(major);
  return formatted.replace(/[\u00a0]/g, "\u202f");
}

/** @deprecated Préférez formatMoney(amount, currency). Conservé pour la facturation super-admin (FCFA). */
export function formatFcfa(amount: number): string {
  return formatMoney(amount, "XOF");
}

/** Valeur pour un champ `<input>` (édition d'un prix en base). */
export function formatMoneyInput(amount: number, currencyCode: string | null | undefined): string {
  const c = getCurrency(currencyCode);
  if (c.minorUnits === 0) return String(Math.round(amount));
  const major = majorFromMinor(Math.round(amount), c.minorUnits);
  return major.toLocaleString("fr-FR", { minimumFractionDigits: c.minorUnits, maximumFractionDigits: c.minorUnits });
}

/** Parse une saisie utilisateur en montant stocké (plus petite unité), ou null. */
export function parseMoney(input: string, currencyCode: string | null | undefined): number | null {
  const c = getCurrency(currencyCode);
  const raw = input.trim();
  if (!raw) return null;

  if (c.minorUnits === 0) {
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits) return null;
    const n = Number(digits);
    return Number.isSafeInteger(n) && n >= 0 ? n : null;
  }

  const cleaned = raw.replace(/\s/g, "").replace(",", ".");
  if (!/^\d*(\.\d{0,2})?$/.test(cleaned) || cleaned === "." || cleaned === "") return null;
  const major = Number(cleaned);
  if (!Number.isFinite(major) || major < 0) return null;
  const minor = minorFromMajor(major, c.minorUnits);
  return Number.isSafeInteger(minor) ? minor : null;
}

/** @deprecated Utilisez parseMoney(input, currency). */
export function parseFcfa(input: string): number | null {
  return parseMoney(input, "XOF");
}

export function priceFieldLabel(currencyCode: string | null | undefined): string {
  const code = normalizeCurrency(currencyCode);
  return `Prix (${code})`;
}

export function pricesHint(currencyCode: string | null | undefined): string {
  const c = getCurrency(currencyCode);
  if (c.minorUnits === 0) return "Montant entier, sans décimales.";
  return "Vous pouvez saisir des décimales (ex. 12,50).";
}

export function currencyShortLabel(currencyCode: string | null | undefined): string {
  return normalizeCurrency(currencyCode);
}

export type { CurrencyCode };
