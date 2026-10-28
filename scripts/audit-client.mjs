/**
 * (v3 : onglet Menu = grille de catégories puis grille de plats.)
 * Audit du parcours client public (/r/<slug>?table=N) : axe (WCAG 2 A/AA) + captures clair/sombre en 390 et 1280 px
 * pour chaque onglet (Accueil, Menu, Menu+filtres, Commande vide/avec panier/suivi, Favoris, Infos, sélecteur de table).
 *   BASE_URL=http://localhost:3511 SLUGS=mon-resto,demo OUT_DIR=/workspace/design/captures/menu-v3/apres node scripts/audit-client.mjs
 * Exit 1 si color-contrast ≠ 0 ou violation grave/critique. NB : passe une commande réelle (base de test uniquement).
 */
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3511";
const OUT = process.env.OUT_DIR ?? "/workspace/design/captures/menu-v3/apres";
const SLUGS = (process.env.SLUGS ?? "mon-resto,demo").split(",");
const SEND = process.env.SEND_ORDER !== "0";
fs.mkdirSync(OUT, { recursive: true });
const sizes = { 390: { width: 390, height: 844 }, 1280: { width: 1280, height: 800 } };

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome", args: ["--no-sandbox"] });
let contrast = 0, serious = 0, shots = 0, minTarget = 0;
const lines = [];

for (const slug of SLUGS) for (const theme of ["light", "dark"]) for (const [sizeName, viewport] of Object.entries(sizes)) {
  const ctx = await browser.newContext({ baseURL: BASE, viewport, colorScheme: theme, isMobile: viewport.width < 600, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);
  const tag = `${slug}-${theme === "light" ? "clair" : "sombre"}-${sizeName}`;

  const check = async (name, opts = {}) => {
    await page.waitForTimeout(350);
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]).analyze();
    const cc = res.violations.filter((v) => v.id === "color-contrast").reduce((n, v) => n + v.nodes.length, 0);
    const bad = res.violations.filter((v) => v.id !== "color-contrast" && ["serious", "critical"].includes(v.impact ?? ""));
    const minor = res.violations.filter((v) => v.id !== "color-contrast" && !["serious", "critical"].includes(v.impact ?? ""));
    contrast += cc; serious += bad.length;
    // cibles tactiles < 44 px (boutons, liens, champs visibles)
    const small = await page.evaluate(() => [...document.querySelectorAll("button, a[href], input:not([type=hidden]), select, textarea, summary")].filter((e) => {
      const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      if (!r.width || !r.height || cs.visibility === "hidden" || e.closest("dialog:not([open])") || e.closest(".sr-only") || e.classList.contains("sr-only")) return false;
      if (e.type === "checkbox") { const l = e.closest("label"); if (l) { const lr = l.getBoundingClientRect(); return lr.height < 44; } }
      return r.height < 43.5 || r.width < 43.5;
    }).map((e) => `${e.tagName.toLowerCase()}[${(e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 30)}] ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`));
    minTarget += small.length;
    lines.push(`${cc === 0 && !bad.length ? "✓" : "✗"} ${tag.padEnd(26)} ${name.padEnd(16)} color-contrast=${cc}${bad.length ? " graves:" + bad.map((v) => `${v.id}(${v.nodes.length})`).join(",") : ""}${minor.length ? " mineures:" + minor.map((v) => v.id).join(",") : ""}${small.length ? `  cibles<44: ${small.slice(0, 4).join(" | ")}` : ""}`);
    for (const v of [...res.violations.filter((v) => v.id === "color-contrast"), ...bad]) for (const n of v.nodes.slice(0, 3)) lines.push(`     · ${v.id}: ${n.target.join(" ")} - ${(n.any[0]?.message ?? "").slice(0, 140)}`);
    await page.screenshot({ path: `${OUT}/${tag}-${name}.png`, fullPage: opts.full ?? false });
    shots++;
  };
  const tab = async (label) => { await page.getByRole("navigation", { name: "Navigation du menu" }).getByRole("button", { name: new RegExp(`^${label}`) }).click(); await page.waitForTimeout(250); };

  await page.goto(`/r/${slug}?table=3`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { level: 1 }).waitFor();
  await check("1-accueil");

  await tab("Menu");
  await page.getByRole("heading", { name: "Notre menu" }).waitFor();
  await check("2-menu", { full: true });
  await page.getByRole("button", { name: /^Plats \d/ }).click();
  await page.getByRole("heading", { level: 1, name: "Plats" }).waitFor();
  await check("2b-categorie", { full: true });
  await page.getByRole("button", { name: /Filtres et tri/ }).click();
  await check("3-menu-filtres");
  await page.getByRole("button", { name: /Filtres et tri/ }).click();

  // favoris + panier
  const favBtn = page.getByRole("button", { name: /^Favori : / }).first();
  await favBtn.click();
  const add = page.getByRole("button", { name: /^Ajouter (?!un )/ });
  await add.nth(0).click(); await add.nth(0).click().catch(() => {});
  await page.getByRole("button", { name: /^Ajouter (?!un )/ }).nth(1).click().catch(() => {});
  await check("4-menu-panier");

  await tab("Favoris");
  await page.getByRole("heading", { name: "Mes favoris" }).waitFor();
  await check("5-favoris");

  await tab("Commande");
  await page.getByRole("heading", { name: "Votre commande" }).waitFor();
  await check("6-commande", { full: true });

  await page.getByRole("button", { name: /^Table 3/ }).first().click();
  await check("7-table");
  await page.keyboard.press("Escape");

  if (SEND && theme === "light" && slug === SLUGS[0]) {
    await page.getByRole("button", { name: "Valider la commande" }).click();
    await page.getByRole("heading", { name: "Commande envoyée !" }).waitFor();
    await check("8-suivi", { full: true });
  }

  await tab("Favoris");
  await check("9-favoris");
  await ctx.close();
}
await browser.close();
console.log(lines.join("\n"));
console.log(`\n${shots} captures dans ${OUT}\ncolor-contrast total = ${contrast} ; violations graves/critiques = ${serious} ; cibles < 44 px = ${minTarget}`);
process.exit(contrast || serious || minTarget ? 1 : 0);
