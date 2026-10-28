/** Normalise une lecture scanner (espaces, tirets courants). */
export function normalizeBarcode(raw: string): string {
  return raw.trim().replace(/\s+/g, "");
}
