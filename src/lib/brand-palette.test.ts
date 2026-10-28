import { describe, expect, it } from "vitest";
import { brandDark, brandLight, surfacesDark, surfacesLight } from "./brand-palette";
import { contrastRatio } from "./color";

/** Compose un voile rgba() sur un fond opaque. */
function flatten(rgba: string, bg: string): string {
  const m = rgba.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)!;
  const [r, g, b, a] = [+m[1], +m[2], +m[3], +m[4]];
  const h = bg.slice(1);
  const base = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const out = [r, g, b].map((c, i) => Math.round(c * a + base[i] * (1 - a)));
  return `#${out.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

describe.each([
  ["clair", brandLight, surfacesLight],
  ["sombre", brandDark, surfacesDark],
] as const)("palette rouge rosé - thème %s (WCAG AA)", (_name, B, S) => {
  it("texte sur bouton (fg sur strong / hover / active) ≥ 4.5:1", () => {
    for (const k of ["strong", "hover", "active"] as const) expect(contrastRatio(B.fg, B[k])).toBeGreaterThanOrEqual(4.5);
  });

  it("texte d'accent ≥ 4.5:1 sur toutes les surfaces", () => {
    for (const [s, bg] of Object.entries(S)) expect(contrastRatio(B.text, bg), `text sur ${s}`).toBeGreaterThanOrEqual(4.5);
  });

  it("texte d'accent ≥ 4.5:1 sur son voile (soft) posé sur chaque surface", () => {
    for (const [s, bg] of Object.entries(S))
      expect(contrastRatio(B.text, flatten(B.soft, bg)), `text sur soft/${s}`).toBeGreaterThanOrEqual(4.5);
  });

  it("couleur de marque (UI, icônes) ≥ 3:1 sur canvas et raised", () => {
    expect(contrastRatio(B.base, S.canvas)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(B.base, S.raised)).toBeGreaterThanOrEqual(3);
  });
});
