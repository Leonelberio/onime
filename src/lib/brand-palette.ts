/**
 * Vert néon ONIME (#44D600) — source de vérité pour le thème produit.
 * `scripts/build-menu-domain.ts` génère src/styles/menu-domain.css ; `brand-palette.test.ts`
 * vérifie le contraste WCAG AA de chaque paire.
 */
import { ONIME_BRAND_COLOR } from "./branding";

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

export const BRAND_NAME = "Vert ONIME";

/** Vert du logo. */
export const ONIME_GREEN = ONIME_BRAND_COLOR;

/** Vert légèrement assombri pour texte et icônes sur fond clair (AA). */
const GREEN_UI_LIGHT = "#2E8F00";

export const brandLight: BrandTheme = {
  base: GREEN_UI_LIGHT,
  strong: ONIME_GREEN,
  hover: "#3BC400",
  active: "#32A800",
  text: "#1F5C00",
  soft: "rgba(68, 214, 0, 0.14)",
  fg: "#0f172a",
};

export const brandDark: BrandTheme = {
  base: "#5AE818",
  strong: ONIME_GREEN,
  hover: "#3BC400",
  active: "#32A800",
  text: "#8AFF52",
  soft: "rgba(68, 214, 0, 0.18)",
  fg: "#0f172a",
};

/** Surfaces de la charte ONIME (design-system/tokens.mjs) sur lesquelles on contrôle le contraste. */
export const surfacesLight = { canvas: "#f8f7f4", surface: "#f0efec", raised: "#ffffff", hover: "#eceae6" };
export const surfacesDark = { canvas: "#0a0a0a", surface: "#141414", raised: "#1a1a1a", hover: "#1f1f1f" };
