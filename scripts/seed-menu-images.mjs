/**
 * Télécharge des photos libres (Wikimedia Commons) pour les plats d'un menu public.
 * Usage:
 *   node scripts/seed-menu-images.mjs demo
 *   node scripts/seed-menu-images.mjs mon-resto --force
 */
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";

const rawArgv = process.argv.slice(2);
const FORCE = rawArgv.includes("--force");
const onlyEq = rawArgv.find((a) => a.startsWith("--only="));
const onlyIdx = rawArgv.indexOf("--only");
const onlyFromNext = onlyIdx >= 0 ? rawArgv[onlyIdx + 1] : null;
const onlyRaw = onlyEq ? onlyEq.slice("--only=".length) : onlyFromNext;
const ONLY_NAMES = onlyRaw ? onlyRaw.split(",").map((s) => s.trim()).filter(Boolean) : null;
const argv = rawArgv.filter((a, i) => a !== "--force" && !a.startsWith("--only=") && a !== "--only" && i !== onlyIdx + 1);
const SLUG = argv[0] || "mon-resto";
const UA = "OnimeMenu/1.0 (https://onime-menu.test; demo seed script)";

/** Nom exact du plat → requête Wikimedia Commons */
const SEARCH_BY_NAME = {
  "Salade d'avocat": "avocado salad",
  "Beignets de poisson": "fish fritters food",
  "Alloco sauce piquante": "fried plantain alloco",
  "Salade de crudités": "vegetable salad plate",
  "Soupe de poisson": "african fish soup",
  "Riz sauce graine": "egusi soup nigeria",
  "Attiéké poisson braisé": "attieke fish",
  "Attiéké": "attieke couscous",
  "Foufou sauce arachide": "fufu peanut soup",
  "Fufu sauce arachide": "fufu peanut soup",
  "Riz gras (jollof)": "jollof rice",
  "Riz au gras": "jollof rice",
  "Poulet DG": "poulet dg cameroon",
  "Poulet braisé": "rotisserie chicken plate",
  "Poulet braisé (demi)": "rotisserie chicken plate",
  "Capitaine grillé": "grilled whole fish plate",
  "Akoumé sauce gombo": "okra soup seafood",
  "Brochettes de bœuf": "beef skewers kebab",
  "Brochettes de bœuf (5)": "beef skewers kebab",
  "Alloco": "fried plantain alloco",
  "Frites de patate douce": "sweet potato fries",
  "Eau minérale 1,5 L": "plastic water bottle 1 liter",
  "Soda (33 cl)": "soft drink aluminum can",
  "Soda 33 cl": "soft drink aluminum can",
  "Soda 33 cl": "coca cola can",
  "Jus de bissap": "bissap hibiscus drink",
  "Jus de gingembre": "ginger juice drink",
  "Bière locale (65 cl)": "beer glass",
  "Bière locale 65 cl": "beer glass",
  "Poisson braisé (tilapia)": "grilled tilapia fish",
  "Côtelettes d'agneau": "lamb chops",
  "Salade de fruits frais": "fruit salad",
  "Salade de fruits": "fruit salad",
  "Beignets sucrés": "beignet new orleans",
  "Glace artisanale": "vanilla ice cream dessert",
};

/** URL directe quand la recherche Commons est trop bruitée */
const DIRECT_URL = {
  "Eau minérale 1,5 L": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Water_bottle_%2813779%29.jpg",
  "Soda 33 cl": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Soda_Can_Angle_1_%283549972877%29.jpg",
  "Soda (33 cl)": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Soda_Can_Angle_1_%283549972877%29.jpg",
};

function loadEnvFromDotenv() {
  if (process.env.UPLOADTHING_TOKEN) return;
  try {
    const raw = readFileSync(path.join(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m || process.env[m[1]]) continue;
      let v = m[2].trim();
      if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  } catch {
    /* ignore */
  }
}

function uploadDir() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), ".uploads");
}

function mimeForExt(ext) {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function utPublicUrl(result) {
  const row = Array.isArray(result) ? result[0] : result;
  if (!row || typeof row !== "object") return "";
  const data = row.data ?? row;
  return data.ufsUrl ?? data.url ?? "";
}

async function storeMenuImage({ slug, itemId, buf, ext }) {
  loadEnvFromDotenv();
  if (process.env.UPLOADTHING_TOKEN) {
    const { UTApi, UTFile } = await import("uploadthing/server");
    const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
    const uploaded = await utapi.uploadFiles(
      new UTFile([buf], `${slug}-${itemId.slice(-8)}.${ext}`, { type: mimeForExt(ext) }),
      { acl: "public-read" },
    );
    const url = utPublicUrl(uploaded);
    if (!url) throw new Error("UploadThing : pas d'URL");
    return url;
  }
  const key = `${slug}/item-seed-${itemId.slice(-8)}.${ext}`;
  const file = path.join(uploadDir(), key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buf);
  return `/api/files/${key}`;
}

function extFromContentType(ct) {
  if (ct?.includes("webp")) return "webp";
  if (ct?.includes("png")) return "png";
  return "jpg";
}

async function commonsImageUrl(search) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: search,
    gsrnamespace: "6",
    gsrlimit: "5",
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "800",
    format: "json",
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`API HTTP ${res.status}`);
  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) throw new Error("Aucun résultat Commons");
  const sorted = Object.values(pages).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  for (const page of sorted) {
    const info = page.imageinfo?.[0];
    const raw = info?.url || info?.thumburl;
    if (!raw) continue;
    const url = raw.split("?")[0];
    if (url.match(/\.(jpe?g|png|webp)$/i)) return url;
  }
  throw new Error("Pas de JPEG/PNG dans les résultats");
}

async function download(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) throw new Error("Fichier trop petit");
  const ext = extFromContentType(res.headers.get("content-type"));
  return { buf, ext };
}

async function seedSlug(slug) {
  const db = new PrismaClient();
  const resto = await db.Company.findUnique({
    where: { slug },
    include: { items: true },
  });
  if (!resto) {
    console.error("Company introuvable:", slug);
    await db.$disconnect();
    return;
  }

  console.log(`\n=== ${resto.name} (/r/${slug}) ===`);
  let ok = 0;
  let skip = 0;
  for (const item of resto.items) {
    if (ONLY_NAMES && !ONLY_NAMES.includes(item.name)) continue;
    const search = SEARCH_BY_NAME[item.name];
    if (!search) {
      console.warn("Pas de recherche mappée:", item.name);
      skip++;
      continue;
    }
    const hasImage =
      item.imageUrl &&
      (item.imageUrl.startsWith("/api/files/") ||
        item.imageUrl.includes("utfs.io") ||
        item.imageUrl.includes("ufs.sh"));
    if (!FORCE && hasImage) {
      console.log("Déjà une image:", item.name);
      skip++;
      continue;
    }
    try {
      const src = DIRECT_URL[item.name] ?? (await commonsImageUrl(search));
      const { buf, ext } = await download(src);
      const url = await storeMenuImage({ slug, itemId: item.id, buf, ext });
      await db.menuItem.update({ where: { id: item.id }, data: { imageUrl: url } });
      console.log("✓", item.name, "←", src.split("/").pop(), "→", url.includes("ufs.sh") ? "UploadThing" : "local");
      ok++;
    } catch (e) {
      console.error("✗", item.name, e.message);
    }
  }
  console.log(`Terminé ${slug}: ${ok} mis à jour, ${skip} ignorés.`);
  await db.$disconnect();
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) await seedSlug(SLUG);
