/**
 * Audit accessibilité (axe-core, WCAG 2 A/AA) + captures clair/sombre en 390 et 1280 px.
 *   BASE_URL=http://localhost:3511 SUPERADMIN_EMAIL=… SUPERADMIN_PASSWORD=… node scripts/audit.mjs
 * Utilise les comptes du seed (`npm run db:seed`). Écrit dans OUT_DIR (défaut /workspace/design/captures/menu).
 * Exit 1 si une violation « color-contrast » (ou toute violation sérieuse/critique) est trouvée.
 */
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.OUT_DIR ?? "/workspace/design/captures/menu";
const PASS = "demo-onime-2026";
fs.mkdirSync(OUT, { recursive: true });

const sizes = { 390: { width: 390, height: 844 }, 1280: { width: 1280, height: 800 } };
const themes = ["light", "dark"];
const roles = {
  public: { pages: [["accueil", "/"], ["menu-public", "/r/demo?table=4"], ["menu-public-mon-resto", "/r/mon-resto?table=3"], ["connexion", "/connexion"], ["inscription", "/inscription"]] },
  owner: { login: ["demo@onime-menu.test", PASS], pages: [["dashboard", "/dashboard"], ["gestion-menu", "/dashboard/menu"], ["qr-codes", "/dashboard/qr"], ["equipe", "/dashboard/equipe"], ["Company", "/dashboard/entreprise"], ["abonnement", "/dashboard/abonnement"], ["cuisine", "/cuisine"], ["prise-de-commande", "/serveur"]] },
  EMPLOYEE: { login: ["serveur@onime-menu.test", PASS], pages: [["serveur", "/serveur"], ["serveur-cuisine", "/cuisine"]] },
  superadmin: { login: [process.env.SUPERADMIN_EMAIL, process.env.SUPERADMIN_PASSWORD], pages: [["superadmin", "/superadmin"], ["superadmin-Companys", "/superadmin/Companys"], ["superadmin-plans", "/superadmin/plans"]] },
};

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome", args: ["--no-sandbox"] });
let contrast = 0, serious = 0, shots = 0;
const summary = [];

const only = (process.env.ROLES ?? "").split(",").filter(Boolean);
for (const [role, cfg] of Object.entries(roles)) {
  if (only.length && !only.includes(role)) continue;
  if (cfg.login && !cfg.login[0]) { console.log(`(rôle ${role} ignoré : identifiants absents)`); continue; }
  for (const theme of themes) {
    for (const [sizeName, viewport] of Object.entries(sizes)) {
      const ctx = await browser.newContext({ baseURL: BASE, viewport, colorScheme: theme, isMobile: viewport.width < 600, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      page.setDefaultTimeout(25000);
      if (cfg.login) {
        await page.goto("/connexion");
        await page.fill("#email", cfg.login[0]); await page.fill("#password", cfg.login[1]);
        await page.click("button[type=submit]");
        await page.waitForURL((u) => !u.pathname.startsWith("/connexion"));
      }
      for (const [name, path] of cfg.pages) {
        await page.goto(path, { waitUntil: "networkidle" }).catch(() => page.goto(path));
        await page.waitForTimeout(400);
        const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]).analyze();
        const cc = res.violations.filter((v) => v.id === "color-contrast").reduce((n, v) => n + v.nodes.length, 0);
        const bad = res.violations.filter((v) => v.id !== "color-contrast" && ["serious", "critical"].includes(v.impact ?? ""));
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 1) { serious++; summary.push(`✗ ${name} ${theme} ${sizeName}: débordement horizontal de ${overflow}px`); }
        contrast += cc; serious += bad.length;
        const minor = res.violations.filter((v) => v.id !== "color-contrast" && !["serious", "critical"].includes(v.impact ?? ""));
        summary.push(`${cc === 0 && !bad.length ? "✓" : "✗"} ${name.padEnd(24)} ${theme.padEnd(5)} ${String(sizeName).padStart(4)}  color-contrast=${cc}${bad.length ? "  graves: " + bad.map((v) => `${v.id}(${v.nodes.length})`).join(",") : ""}${minor.length ? "  mineures: " + minor.map((v) => v.id).join(",") : ""}`);
        if (cc || bad.length) for (const v of [...res.violations.filter((v) => v.id === "color-contrast"), ...bad]) for (const n of v.nodes.slice(0, 3)) summary.push(`     · ${v.id}: ${n.target.join(" ")} - ${(n.any[0]?.message ?? n.failureSummary ?? "").split("\n")[0].slice(0, 160)}`);
        await page.screenshot({ path: `${OUT}/${name}-${theme === "light" ? "clair" : "sombre"}-${sizeName}.png`, fullPage: false });
        shots++;
      }
      if (cfg.login && viewport.width < 600) {
        // Barre basse : feuille « Plus » / « Compte » ouverte (axe + capture)
        await page.goto(cfg.pages[0][1], { waitUntil: "networkidle" }).catch(() => {});
        await page.getByRole("navigation", { name: "Navigation principale" }).filter({ visible: true }).getByRole("button", { name: /^(Plus|Compte)$/ }).click();
        await page.waitForTimeout(400);
        const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]).analyze();
        const cc = res.violations.filter((v) => v.id === "color-contrast").reduce((n, v) => n + v.nodes.length, 0);
        const bad = res.violations.filter((v) => v.id !== "color-contrast" && ["serious", "critical"].includes(v.impact ?? ""));
        contrast += cc; serious += bad.length;
        summary.push(`${cc === 0 && !bad.length ? "✓" : "✗"} ${(role + "-feuille-plus").padEnd(24)} ${theme.padEnd(5)} ${String(sizeName).padStart(4)}  color-contrast=${cc}${bad.length ? "  graves: " + bad.map((v) => `${v.id}(${v.nodes.length})`).join(",") : ""}`);
        for (const v of [...res.violations.filter((v) => v.id === "color-contrast"), ...bad]) for (const n of v.nodes.slice(0, 3)) summary.push(`     · ${v.id}: ${n.target.join(" ")} - ${(n.any[0]?.message ?? "").split("\n")[0].slice(0, 160)}`);
        await page.screenshot({ path: `${OUT}/${role}-feuille-plus-${theme === "light" ? "clair" : "sombre"}-${sizeName}.png` });
        shots++;
      }
      await ctx.close();
    }
  }
}
await browser.close();
console.log(summary.join("\n"));
console.log(`\n${shots} captures dans ${OUT}\ncolor-contrast total = ${contrast} ; violations graves/critiques hors contraste = ${serious}`);
process.exit(contrast || serious ? 1 : 0);
