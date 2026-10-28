/** Génère src/styles/menu-domain.css depuis src/lib/brand-palette.ts : `npx tsx scripts/build-menu-domain.ts` */
import { writeFileSync } from "node:fs";
import { brandDark, brandLight, type BrandTheme } from "../src/lib/brand-palette";

const rgb = (hex: string) => {
  const h = hex.slice(1);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(" ");
};

const vars = (b: BrandTheme) => `  --onime-accent: ${b.base};
  --onime-accent-rgb: ${rgb(b.base)};
  --onime-accent-text: ${b.text};
  --onime-accent-text-rgb: ${rgb(b.text)};
  --onime-accent-strong: ${b.strong};
  --onime-accent-strong-rgb: ${rgb(b.strong)};
  --onime-accent-strong-hover: ${b.hover};
  --onime-accent-strong-hover-rgb: ${rgb(b.hover)};
  --onime-accent-fg: ${b.fg};
  --onime-accent-fg-rgb: ${rgb(b.fg)};
  --onime-accent-soft: ${b.soft};
  --accent: var(--onime-accent);
  --accent-text: var(--onime-accent-text);
  --accent-strong: var(--onime-accent-strong);
  --accent-strong-hover: var(--onime-accent-strong-hover);
  --accent-fg: var(--onime-accent-fg);
  --accent-soft: var(--onime-accent-soft);
  /* Vert ONIME → remappe « primary » (CTA, sélection, liens) */
  --onime-primary: ${b.strong};
  --onime-primary-rgb: ${rgb(b.strong)};
  --onime-primary-hover: ${b.hover};
  --onime-primary-hover-rgb: ${rgb(b.hover)};
  --onime-primary-active: ${b.active};
  --onime-primary-active-rgb: ${rgb(b.active)};
  --onime-primary-text: ${b.text};
  --onime-primary-text-rgb: ${rgb(b.text)};
  --onime-primary-soft: ${b.soft};
  --onime-on-primary: ${b.fg};
  --onime-on-primary-rgb: ${rgb(b.fg)};
  --primary: var(--onime-primary);
  --primary-deep: var(--onime-primary-hover);
  --primary-active: var(--onime-primary-active);
  --primary-tint: var(--onime-primary-soft);
  --primary-muted: var(--onime-primary-text);`;

const css = `/*
 * ONIME Stock — vert logo #44D600 (data-domain="menu").
 * GÉNÉRÉ par scripts/build-menu-domain.ts depuis src/lib/brand-palette.ts - NE PAS ÉDITER À LA MAIN.
 * Posé sur <html data-domain="menu">. Spécificité alignée sur design-system/tokens.css (sombre : système + forcé).
 */

:root[data-domain="menu"] {
${vars(brandLight)}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not(.light)[data-domain="menu"] {
${vars(brandDark)}
  }
}

:root[data-theme="dark"][data-domain="menu"],
:root.dark[data-domain="menu"] {
${vars(brandDark)}
}
`;
writeFileSync(new URL("../src/styles/menu-domain.css", import.meta.url), css);
console.log("✓ src/styles/menu-domain.css généré");
