/**
 * Parcours de bout en bout (Playwright + Chrome système) contre une app déjà démarrée.
 *   BASE_URL=http://localhost:3100 SUPERADMIN_EMAIL=… SUPERADMIN_PASSWORD=… node scripts/e2e.mjs
 * Crée un Company de test unique à chaque exécution (email horodaté).
 */
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SA_EMAIL = process.env.SUPERADMIN_EMAIL;
const SA_PASSWORD = process.env.SUPERADMIN_PASSWORD;
const stamp = Date.now().toString(36);
const email = `e2e-${stamp}@onime-menu.test`;
const password = "e2e-password-123";
const results = [];
const debugPages = {};
const step = async (name, fn) => {
  try { await fn(); results.push(["✓", name]); console.log("✓", name); }
  catch (e) {
    results.push(["✗", name]); console.log("✗", name, "\n   ", String(e.message).split("\n")[0]); process.exitCode = 1;
    if (process.env.E2E_DEBUG) for (const [n, p] of Object.entries(debugPages)) await p.screenshot({ path: `/tmp/e2e-${results.length}-${n}.png` }).catch(() => {});
  }
};

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const owner = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 800 } });
const page = await owner.newPage();
debugPages.owner = page;
if (process.env.E2E_DEBUG) { page.on("response", (r) => { if (r.request().method() === "POST") console.log("  POST", r.url().replace(BASE, ""), r.status()); }); page.on("console", (m) => { if (m.type() === "error") console.log("  console.error", m.text().slice(0, 200)); }); page.on("pageerror", (e) => console.log("  pageerror", String(e).slice(0, 200))); }
page.setDefaultTimeout(20000);
let slug = "";

await step("inscription Gérant → tableau de bord", async () => {
  await page.goto("/inscription");
  await page.fill("#CompanyName", `Resto E2E ${stamp}`);
  await page.fill("#tableCount", "6");
  await page.fill("#name", "Testeur E2E");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click("button[type=submit]");
  await page.waitForURL("**/dashboard**");
  await page.getByRole("heading", { name: /Bienvenue/ }).waitFor();
});

await step("création d'un plat (catégorie par défaut « Plats »)", async () => {
  await page.goto("/dashboard/menu");
  await page.getByRole("button", { name: /Plat$/ }).first().click();
  await page.fill("#item-name", "Riz sauce arachide");
  await page.fill("#item-price", "2 500");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.getByText("Riz sauce arachide").waitFor();
  await page.getByText("2 500").first().waitFor();
});

await step("ajout d'une catégorie + d'un plat indisponible", async () => {
  await page.fill("#new-category", "Desserts");
  await page.getByRole("button", { name: "Ajouter", exact: true }).last().click();
  await page.getByRole("heading", { name: "Desserts", includeHidden: true }).waitFor({ state: "attached" });
  await page.getByRole("button", { name: /Plat$/ }).last().click();
  await page.fill("#item-name", "Gâteau");
  await page.fill("#item-price", "1000");
  await page.getByLabel("Disponible à la commande").uncheck();
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.getByText("Indisponible").first().waitFor();
});

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAFklEQVR4nGN44RJFEmIY1TCqYfhqAADkC4YQtubaAQAAAABJRU5ErkJggg==", "base64");
await step("upload du logo (PNG → WebP) et enregistrement du Company", async () => {
  await page.goto("/dashboard/entreprise");
  await page.locator("input[type=file]").first().setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: PNG });
  await page.getByRole("button", { name: "Changer" }).waitFor();
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.getByText(/enregistr|mis à jour/i).first().waitFor();
});

await step("page QR codes + PNG/PDF téléchargeables", async () => {
  await page.goto("/dashboard/qr");
  await page.getByRole("heading", { name: "QR global" }).waitFor();
  const png = await owner.request.get("/api/qr?format=png&table=3");
  if (png.status() !== 200 || !(await png.body()).subarray(1, 4).toString().includes("PNG")) throw new Error("PNG invalide");
  const pdf = await owner.request.get("/api/qr?format=pdf&scope=all");
  const body = await pdf.body();
  if (pdf.status() !== 200 || body.subarray(0, 4).toString() !== "%PDF") throw new Error("PDF invalide");
  if ((await owner.request.get("/api/qr?format=png&table=99")).status() !== 400) throw new Error("table 99 acceptée");
});

await step("récupération du slug", async () => {
  await page.goto("/dashboard");
  const href = await page.getByRole("link", { name: "Voir mon menu" }).getAttribute("href");
  slug = href.split("/r/")[1];
  if (!slug) throw new Error("slug introuvable");
});

// Client anonyme
const guest = await browser.newContext({ baseURL: BASE, viewport: { width: 390, height: 844 }, isMobile: true });
const g = await guest.newPage();
debugPages.guest = g;
g.setDefaultTimeout(20000);

const tabBtn = (name) => g.getByRole("navigation", { name: "Navigation du menu" }).getByRole("button", { name: new RegExp(`^${name}`) });
const openCat = async (name) => { await g.getByRole("button", { name: new RegExp(`^${name} \\d`) }).click(); await g.getByRole("heading", { level: 1, name }).waitFor(); };
const toMenuTab = async () => { await g.goto(`/r/${slug}?table=3`); await g.reload(); await tabBtn("Menu").click(); await g.getByRole("heading", { name: "Notre menu" }).waitFor(); await openCat("Plats"); };

await step("menu public : accueil (nom, table, logo), onglets, plat indisponible non commandable", async () => {
  await g.goto(`/r/${slug}?table=3`);
  await g.getByRole("heading", { level: 1, name: new RegExp(`Resto E2E ${stamp}`) }).waitFor();
  await g.getByRole("button", { name: /Table 3/ }).first().waitFor();
  const logo = g.getByRole("img", { name: /Logo de/ });
  await logo.waitFor();
  if (!(await logo.evaluate((i) => i.complete && i.naturalWidth > 0))) throw new Error("logo non chargé");
  await tabBtn("Menu").click();
  await g.getByRole("heading", { name: "Notre menu" }).waitFor();
  await openCat("Plats");
  await g.getByRole("heading", { name: "Riz sauce arachide" }).first().waitFor();
  await g.getByRole("button", { name: "Catégories" }).click();
  await openCat("Desserts");
  if (await g.getByRole("button", { name: /Ajouter Gâteau/ }).count()) throw new Error("plat indisponible commandable");
  await g.getByText("Indisponible").first().waitFor();
});

await step("menu public : grille de catégories → grille de plats, lien ?cat= partageable, retour navigateur", async () => {
  await g.getByRole("button", { name: "Catégories" }).click();
  await g.getByRole("heading", { name: "Notre menu" }).waitFor();
  // vue 1 : cartes de catégorie avec nombre de plats
  await g.getByRole("button", { name: "Plats 1 plat" }).waitFor();
  await g.getByRole("button", { name: "Desserts 1 plat" }).waitFor();
  await openCat("Desserts");
  const url = new URL(g.url());
  const cat = url.searchParams.get("cat");
  if (!cat || !url.hash.includes("menu")) throw new Error(`URL de catégorie inattendue : ${g.url()}`);
  await g.getByRole("button", { name: "Partager la catégorie Desserts" }).waitFor();
  // lien partagé ouvert à froid : directement sur la catégorie
  const cold = await guest.newPage();
  await cold.goto(`${BASE}/r/${slug}?table=3&cat=${cat}`);
  await cold.getByRole("heading", { level: 1, name: "Desserts" }).waitFor();
  await cold.close();
  // retour / avant du navigateur
  await g.goBack();
  await g.getByRole("heading", { name: "Notre menu" }).waitFor();
  if (new URL(g.url()).searchParams.get("cat")) throw new Error("?cat= toujours présent après retour");
  await g.goForward();
  await g.getByRole("heading", { level: 1, name: "Desserts" }).waitFor();
  // ?cat= inconnu ignoré
  const bad = await guest.newPage();
  await bad.goto(`${BASE}/r/${slug}?table=3&cat=inconnu#menu`);
  await bad.getByRole("heading", { name: "Notre menu" }).waitFor();
  await bad.close();
});

await step("menu public : recherche et filtre par catégorie", async () => {
  await g.getByRole("button", { name: "Catégories" }).click();
  await g.getByLabel("Rechercher un plat").fill("riz");
  await g.getByRole("heading", { name: "Riz sauce arachide" }).waitFor();
  await g.getByRole("heading", { name: "Desserts" }).waitFor({ state: "detached" });
  await g.getByLabel("Rechercher un plat").fill("zzzz");
  await g.getByText("Aucun plat ne correspond").waitFor();
  await g.getByLabel("Rechercher un plat").fill("");
  await g.getByRole("button", { name: "Plats 1 plat" }).waitFor();
  await openCat("Plats");
});

await step("menu public : favoris et panier persistants (localStorage), stepper", async () => {
  await g.getByRole("button", { name: "Favori : Riz sauce arachide" }).first().click();
  await g.getByRole("button", { name: "Ajouter Riz sauce arachide" }).first().click();
  await g.getByRole("button", { name: "Ajouter un Riz sauce arachide" }).first().click();
  await g.getByRole("button", { name: "Retirer un Riz sauce arachide" }).first().click();
  await g.getByRole("button", { name: "Ajouter un Riz sauce arachide" }).first().click();
  await g.reload();
  await tabBtn("Favoris").click();
  await g.getByRole("heading", { name: "Riz sauce arachide" }).waitFor();
  await tabBtn("Commande").click();
  await g.getByRole("group", { name: "Quantité de Riz sauce arachide" }).waitFor();
  if (!/5\s?000/.test(await g.getByTestId("cart-total").innerText())) throw new Error("total panier incorrect après rechargement");
});

await step("menu public : table pré-remplie via ?table=3, validation de la commande", async () => {
  await g.getByRole("button", { name: /^Table 3/ }).waitFor();
  await g.getByRole("button", { name: "Valider la commande" }).click();
  await g.getByRole("heading", { name: "Commande envoyée !" }).waitFor();
  await g.getByRole("heading", { name: "Suivi de commande" }).waitFor();
});

await step("écran cuisine : la commande arrive en temps réel, changement de statut", async () => {
  await page.goto("/cuisine");
  await page.getByRole("heading", { name: "Table 3" }).waitFor();
  await page.getByText("Temps réel actif").waitFor();
  await page.getByRole("button", { name: "Lancer la préparation" }).click();
  await page.getByText("En préparation", { exact: true }).first().waitFor();
});

await step("menu public : le suivi reflète le statut cuisine (En préparation)", async () => {
  await g.getByText(/^En préparation -/).waitFor({ timeout: 15000 });
});

await step("SSE : une commande passée pendant que la cuisine est ouverte apparaît sans rechargement", async () => {
  await toMenuTab();
  await g.getByRole("button", { name: "Ajouter Riz sauce arachide" }).first().click();
  await tabBtn("Commande").click();
  await g.getByRole("button", { name: "Valider la commande" }).click();
  await g.getByRole("heading", { name: "Commande envoyée !" }).waitFor();
  await page.getByRole("heading", { name: "Nouvelles" }).first().waitFor();
  await page.getByRole("article", { name: /table 3/ }).nth(1).waitFor({ timeout: 15000 });
});

await step("validation serveur : table choisie dans le sélecteur (table 6), commande envoyée", async () => {
  await toMenuTab();
  await g.getByRole("button", { name: "Ajouter Riz sauce arachide" }).first().click();
  await tabBtn("Commande").click();
  await g.getByRole("button", { name: /^Table 3/ }).click();
  await g.getByRole("button", { name: "Table 6", exact: true }).click();
  await g.getByRole("button", { name: "Valider la commande" }).click();
  await g.getByRole("heading", { name: "Commande envoyée !" }).waitFor(); // table 6 valide (6 tables)
});

await step("back-office mobile : barre de navigation basse (onglet actif, feuille « Plus »)", async () => {
  const m = await browser.newContext({ baseURL: BASE, viewport: { width: 390, height: 844 }, isMobile: true });
  const mp = await m.newPage();
  mp.setDefaultTimeout(20000);
  await mp.goto("/connexion");
  await mp.fill("#email", email);
  await mp.fill("#password", password);
  await mp.click("button[type=submit]");
  await mp.waitForURL("**/dashboard**");
  const nav = mp.getByRole("navigation", { name: "Navigation principale" }).filter({ visible: true });
  await nav.getByRole("link", { name: "Accueil" }).waitFor();
  if ((await nav.getByRole("link", { name: "Accueil" }).getAttribute("aria-current")) !== "page") throw new Error("onglet actif non indiqué");
  await nav.getByRole("link", { name: "Menu", exact: true }).click();
  await mp.waitForURL("**/dashboard/menu");
  await nav.getByRole("button", { name: "Plus" }).click();
  await mp.getByRole("dialog").getByRole("link", { name: "Équipe" }).click();
  await mp.waitForURL("**/dashboard/equipe");
  if ((await nav.getByRole("button", { name: "Plus" }).getAttribute("aria-current")) !== "page") throw new Error("« Plus » non actif sur une page regroupée");
  const box = await nav.getByRole("link", { name: "Cuisine" }).boundingBox();
  if (!box || box.height < 44) throw new Error("cible < 44 px");
  await m.close();
});

await step("invitation serveur → compte serveur → prise de commande à table", async () => {
  await page.goto("/dashboard/equipe");
  await page.fill("#label", "Kossi");
  await page.getByRole("button", { name: /Créer un lien/ }).click();
  const link = await page.getByLabel("Lien d'invitation").inputValue();
  const w = await browser.newContext({ baseURL: BASE, viewport: { width: 390, height: 844 }, isMobile: true });
  const wp = await w.newPage();
  wp.setDefaultTimeout(20000);
  await wp.goto(new URL(link).pathname);
  await wp.fill("#name", "Kossi");
  await wp.fill("#email", `w-${stamp}@onime-menu.test`);
  await wp.fill("#password", password);
  await wp.click("button[type=submit]");
  await wp.waitForURL("**/serveur");
  const wnav = wp.getByRole("navigation", { name: "Navigation principale" }).filter({ visible: true });
  if ((await wnav.getByRole("link", { name: "Commande" }).getAttribute("aria-current")) !== "page") throw new Error("nav serveur : onglet actif manquant");
  await wnav.getByRole("button", { name: "Compte" }).click();
  await wp.getByRole("dialog").getByRole("button", { name: "Se déconnecter" }).waitFor();
  await wp.keyboard.press("Escape");
  await wp.getByRole("button", { name: "Table 2", exact: false }).first().click();
  await wp.getByRole("button", { name: "Ajouter Riz sauce arachide" }).click();
  await wp.getByRole("button", { name: /Récapitulatif/ }).click();
  await wp.getByRole("button", { name: "Envoyer en cuisine" }).click();
  await wp.getByText(/envoyée en cuisine pour la table 2/).waitFor();
  // le lien d'invitation est à usage unique
  const again = await w.newPage();
  await again.goto(new URL(link).pathname);
  await again.getByText("Invitation invalide").waitFor();
  // un serveur ne peut pas ouvrir le back-office propriétaire
  await wp.goto("/dashboard/menu");
  await wp.waitForURL("**/serveur");
});

if (SA_EMAIL && SA_PASSWORD) {
  const sa = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 800 } });
  const sp = await sa.newPage();
  debugPages.sa = sp;
  sp.setDefaultTimeout(20000);

  await step("super-admin : connexion, liste des Companys, statut essai", async () => {
    await sp.goto("/connexion");
    await sp.fill("#email", SA_EMAIL);
    await sp.fill("#password", SA_PASSWORD);
    await sp.click("button[type=submit]");
    await sp.waitForURL("**/superadmin");
    await sp.goto("/superadmin/Companys");
    await sp.getByRole("link", { name: `Resto E2E ${stamp}` }).click();
    await sp.getByText(/Essai gratuit · 7 j|Essai gratuit · 6 j/).first().waitFor();
  });
  await step("super-admin : prolonger l'essai de 7 jours", async () => {
    await sp.fill("#days", "7");
    await sp.getByRole("button", { name: /Prolonger l'essai/ }).click();
    await sp.getByText(/Essai prolongé de 7 jour/).waitFor();
  });
  await step("super-admin : enregistrer un paiement → abonnement actif", async () => {
    await sp.fill("#amount", "15000");
    await sp.fill("#reference", "MM-E2E");
    await sp.getByRole("button", { name: "Enregistrer le paiement" }).click();
    await sp.getByText("MM-E2E").first().waitFor();
    await sp.reload();
    await sp.getByText(/Abonnement actif/).first().waitFor();
  });
  await step("super-admin : suspendre → menu public indisponible ; réactiver", async () => {
    await sp.getByRole("button", { name: "Suspendre", exact: true }).click();
    await sp.getByRole("button", { name: "Réactiver", exact: true }).waitFor();
    await g.goto(`/r/${slug}`);
    await g.getByText("Menu momentanément indisponible").waitFor();
    await sp.getByRole("button", { name: "Réactiver", exact: true }).click();
    await sp.getByRole("button", { name: "Suspendre", exact: true }).waitFor();
    await g.goto(`/r/${slug}`);
    await g.getByRole("heading", { level: 1, name: new RegExp(`Resto E2E ${stamp}`) }).waitFor();
  });
  await step("super-admin : plans - création d'un plan (prix FCFA)", async () => {
    await sp.goto("/superadmin/plans");
    const f = sp.locator("form", { hasText: "Créer le plan" });
    await f.locator("input[name=name]").fill(`Plan E2E ${stamp}`);
    await f.locator("input[name=priceMonthly]").fill("9 900");
    await f.getByRole("button", { name: "Créer le plan" }).click();
    await sp.getByText(/9\s?900\s?FCFA/).first().waitFor();
  });
  await step("accès /superadmin refusé à un Gérant", async () => {
    await page.goto("/superadmin");
    await page.waitForURL((u) => !u.pathname.startsWith("/superadmin")); // renvoyé vers sa page d'accueil
    if (!/\/(dashboard|connexion)/.test(new URL(page.url()).pathname)) throw new Error("redirection inattendue : " + page.url());
  });
}

await browser.close();
const bad = results.filter((r) => r[0] === "✗").length;
console.log(`\n${results.length - bad}/${results.length} étapes OK`);
process.exit(bad ? 1 : 0);
