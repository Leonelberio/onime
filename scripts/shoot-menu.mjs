/** Captures de l'onglet Menu v3 : grille de catégories puis grille de plats (clair/sombre, 390/1280). BASE_URL, SLUGS, OUT_DIR, CAT (nom, ex. Plats), SHOTS=1 pour vue unique. */
import { chromium } from "@playwright/test";
import fs from "node:fs";
const BASE = process.env.BASE_URL ?? "http://localhost:3511";
const OUT = process.env.OUT_DIR ?? "/workspace/design/captures/menu-v3/apres";
const SLUGS = (process.env.SLUGS ?? "mon-resto,demo").split(",");
const CAT = process.env.CAT ?? "Plats";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
for (const slug of SLUGS) for (const theme of ["light", "dark"]) for (const w of [390, 1280]) {
  const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: w, height: w === 390 ? 844 : 800 }, colorScheme: theme, isMobile: w < 600 });
  const page = await ctx.newPage();
  const tag = `${slug}-${theme === "light" ? "clair" : "sombre"}-${w}`;
  await page.goto(`/r/${slug}?table=3#menu`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Notre menu/ }).waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${tag}-1-categories.png`, fullPage: true });
  await page.getByRole("button", { name: new RegExp(`^${CAT} \\d`) }).click();
  await page.getByRole("heading", { level: 1, name: CAT }).waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${tag}-2-plats.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
