/** Utilitaires couleur + contraste WCAG (couleur de marque libre choisie par le Gérant). */

export const DEFAULT_BRAND = "#44D600"; // vert logo ONIME
export const INK = "#0f172a";

export function isHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

export function normalizeHex(v: string | null | undefined, fallback = DEFAULT_BRAND): string {
  if (!v) return fallback;
  const t = v.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(t)) return `#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`.toLowerCase();
  return isHex(t) ? t.toLowerCase() : fallback;
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex).slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (x: number) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Texte lisible (blanc ou ink) sur une couleur de fond : toujours ≥ 4.5:1 pour un fond « moyen », max des deux sinon. */
export function readableOn(bg: string): string {
  return contrastRatio("#ffffff", bg) >= contrastRatio(INK, bg) ? "#ffffff" : INK;
}

function mix(hex: string, target: [number, number, number], t: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (target[0] - r) * t, g + (target[1] - g) * t, b + (target[2] - b) * t);
}

/**
 * Variante de la couleur utilisable comme TEXTE sur `bg` (≥ 4.5:1) : on assombrit (fond clair)
 * ou on éclaircit (fond sombre) progressivement jusqu'à atteindre le ratio.
 */
export function textColorOn(color: string, bg: string, min = 4.5): string {
  const c = normalizeHex(color);
  if (contrastRatio(c, bg) >= min) return c;
  const towardBlack = luminance(bg) > 0.4;
  const target: [number, number, number] = towardBlack ? [0, 0, 0] : [255, 255, 255];
  for (let t = 0.05; t <= 1.0001; t += 0.05) {
    const m = mix(c, target, t);
    if (contrastRatio(m, bg) >= min) return m;
  }
  return towardBlack ? "#000000" : "#ffffff";
}

/** Variables CSS d'un thème Boutique (appliquées sur le conteneur du menu public). */
export function brandCssVars(brand: string): { light: Record<string, string>; dark: Record<string, string> } {
  const b = normalizeHex(brand);
  const fg = readableOn(b);
  const hover = fg === "#ffffff" ? mix(b, [0, 0, 0], 0.12) : mix(b, [255, 255, 255], 0.12);
  const make = (surface: string) => ({
    "--brand": b,
    "--brand-fg": fg,
    "--brand-hover": hover,
    "--brand-text": textColorOn(b, surface),
  });
  return { light: make("#f0efec"), dark: make("#1a1a1a") };
}
