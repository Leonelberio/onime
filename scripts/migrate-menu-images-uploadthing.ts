/**
 * Envoie les photos de plats (/api/files/…) vers UploadThing et met à jour la base.
 * Usage:
 *   pnpm exec tsx scripts/migrate-menu-images-uploadthing.ts
 *   pnpm exec tsx scripts/migrate-menu-images-uploadthing.ts demo mon-resto
 */
import { readFile, readFileSync } from "node:fs";
import { readFile as readFileAsync } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { UTApi, UTFile } from "uploadthing/server";
import { localUploadDir } from "../src/lib/storage";

const SLUGS = process.argv.slice(2).length ? process.argv.slice(2) : ["demo", "mon-resto"];
const FORCE = process.argv.includes("--force");

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
    /* .env optional if env already set */
  }
}

function mimeForExt(ext: string): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function publicUrl(result: unknown): string {
  const row = Array.isArray(result) ? result[0] : result;
  if (!row || typeof row !== "object") return "";
  const o = row as Record<string, unknown>;
  if ("error" in o && o.error) return "";
  const data = (o.data ?? o) as { ufsUrl?: string; url?: string };
  return data.ufsUrl ?? data.url ?? "";
}

async function main() {
  loadEnvFromDotenv();
  if (!process.env.UPLOADTHING_TOKEN) {
    console.error("UPLOADTHING_TOKEN manquant (.env)");
    process.exit(1);
  }

  const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
  const db = new PrismaClient();
  const uploadRoot = localUploadDir();

  for (const slug of SLUGS.filter((s) => s !== "--force")) {
    const resto = await db.boutique.findUnique({
      where: { slug },
      include: { items: true },
    });
    if (!resto) {
      console.warn("Boutique introuvable:", slug);
      continue;
    }

    console.log(`\n=== /r/${slug} (${resto.name}) ===`);
    for (const item of resto.items) {
      const current = item.imageUrl?.trim();
      if (!current) continue;

      const isLocal = current.startsWith("/api/files/");
      const isUt =
        current.includes("utfs.io") || current.includes("ufs.sh") || current.includes("uploadthing.com");
      if (!FORCE && isUt) {
        console.log("Déjà UploadThing:", item.name);
        continue;
      }
      if (!isLocal && !FORCE) {
        console.log("Ignoré (URL externe non locale):", item.name, current);
        continue;
      }

      try {
        let fileUrl = current;
        if (isLocal) {
          const key = current.replace(/^\/api\/files\//, "");
          if (key.includes("..")) throw new Error("Clé invalide");
          const abs = path.join(uploadRoot, ...key.split("/"));
          const body = await readFileAsync(abs);
          const ext = path.extname(abs).slice(1) || "jpg";
          const utFile = new UTFile([body], `${slug}-${item.id.slice(-8)}.${ext}`, {
            type: mimeForExt(ext),
          });
          const uploaded = await utapi.uploadFiles(utFile, { acl: "public-read" });
          fileUrl = publicUrl(uploaded);
          if (!fileUrl) throw new Error("Pas d'URL dans la réponse UploadThing");
        } else if (FORCE && isUt) {
          continue;
        }

        await db.menuItem.update({ where: { id: item.id }, data: { imageUrl: fileUrl } });
        console.log("✓", item.name, "→", fileUrl);
      } catch (e) {
        console.error("✗", item.name, e instanceof Error ? e.message : e);
      }
    }
  }

  await db.$disconnect();
}

main();
