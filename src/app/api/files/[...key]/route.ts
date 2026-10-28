import { readFile } from "node:fs/promises";
import path from "node:path";
import { localUploadDir } from "@/lib/storage";
import { sniffImage } from "@/lib/storage/sniff";

export const runtime = "nodejs";

/** Sert les images du fournisseur de stockage « local » (développement / auto-hébergement). */
export async function GET(_req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  if ((process.env.UPLOAD_PROVIDER || "local").toLowerCase() !== "local") return new Response("Not found", { status: 404 });
  const { key } = await ctx.params;
  const parts = key.map((k) => decodeURIComponent(k));
  if (parts.some((p) => !p || p === "." || p === ".." || p.includes("/") || p.includes("\\"))) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(path.join(localUploadDir(), ...parts));
    const type = sniffImage(body);
    if (!type) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(body), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
