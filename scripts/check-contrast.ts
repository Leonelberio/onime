/** Rapport de contraste WCAG AA de la palette Onime Menu : `npm run check:contrast` (exit 1 si échec). */
import { brandDark, brandLight, surfacesDark, surfacesLight } from "../src/lib/brand-palette";
import { contrastRatio } from "../src/lib/color";

let failed = 0;
const row = (theme: string, label: string, fg: string, bg: string, min: number) => {
  const r = contrastRatio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✗"} [${theme}] ${label.padEnd(34)} ${fg} / ${bg}  ${r.toFixed(2)}:1 (min ${min})`);
};

for (const [theme, B, S] of [["clair", brandLight, surfacesLight], ["sombre", brandDark, surfacesDark]] as const) {
  for (const k of ["strong", "hover", "active"] as const) row(theme, `bouton ${k}`, B.fg, B[k], 4.5);
  for (const [s, bg] of Object.entries(S)) row(theme, `texte accent sur ${s}`, B.text, bg, 4.5);
  for (const [s, bg] of Object.entries(S)) {
    const m = B.soft.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)!;
    const base = [1, 3, 5].map((i) => parseInt(bg.slice(i, i + 2), 16));
    const flat = "#" + [+m[1], +m[2], +m[3]].map((c, i) => Math.round(c * +m[4] + base[i] * (1 - +m[4])).toString(16).padStart(2, "0")).join("");
    row(theme, `texte accent sur soft/${s}`, B.text, flat, 4.5);
  }
  row(theme, "marque sur canvas (UI)", B.base, S.canvas, 3);
  row(theme, "marque sur raised (UI)", B.base, S.raised, 3);
}
console.log(failed ? `\n✗ ${failed} paire(s) sous le seuil AA` : "\n✓ Palette rouge rosé conforme WCAG AA");
process.exit(failed ? 1 : 0);
