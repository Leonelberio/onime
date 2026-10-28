/**
 * Palette rouge Pinterest (#E60023) - source de vérité marque Onime Menu.
 * `scripts/build-menu-domain.ts` génère src/styles/menu-domain.css ; `brand-palette.test.ts`
 * (et `npm run check:contrast`) vérifient le contraste WCAG AA de chaque paire.
 */
export interface BrandTheme {
  /** Couleur de marque (logo, icônes, bordures UI ≥ 3:1). */
  base: string;
  /** Fond de bouton principal (texte `fg` dessus ≥ 4.5:1). */
  strong: string;
  hover: string;
  active: string;
  /** Texte / liens colorés (≥ 4.5:1 sur canvas, surface, raised, hover et sur `soft`). */
  text: string;
  /** Voile pour sélection / badge (rgba). */
  soft: string;
  /** Texte sur `strong`/`hover`/`active`. */
  fg: string;
}

export const BRAND_NAME = "Rouge Pinterest (Onime Menu)";

/** Rouge de marque Pinterest. */
export const PINTEREST_RED = "#E60023";

export const brandLight: BrandTheme = {
  base: PINTEREST_RED,
  strong: PINTEREST_RED,
  hover: "#AD081B",
  active: "#8A0616",
  text: "#9E0A1E",
  soft: "rgba(230, 0, 35, 0.10)",
  fg: "#FFFFFF",
};

export const brandDark: BrandTheme = {
  base: "#FF385F",
  strong: PINTEREST_RED,
  hover: "#AD081B",
  active: "#8A0616",
  text: "#FF8A9E",
  soft: "rgba(230, 0, 35, 0.18)",
  fg: "#FFFFFF",
};

/** Surfaces de la charte ONIME (design-system/tokens.mjs) sur lesquelles on contrôle le contraste. */
export const surfacesLight = { canvas: "#f8f7f4", surface: "#f0efec", raised: "#ffffff", hover: "#eceae6" };
export const surfacesDark = { canvas: "#0a0a0a", surface: "#141414", raised: "#1a1a1a", hover: "#1f1f1f" };
