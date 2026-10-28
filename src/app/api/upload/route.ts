import { getCurrentUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/auth/rate-limit";
import { isUploadThingProvider } from "@/lib/upload-config";
import { getStorage } from "@/lib/storage";
import { sniffImage } from "@/lib/storage/sniff";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/storage/types";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (isUploadThingProvider()) {
    return Response.json({ error: "Utilisez UploadThing (UPLOAD_PROVIDER=uploadthing)." }, { status: 400 });
  }
  const me = await getCurrentUser();
  if (!me?.organization || me.role !== "OWNER") return Response.json({ error: "Non autorisé" }, { status: 401 });
  if (!me.subscription?.canWrite) return Response.json({ error: "Abonnement terminé : lecture seule." }, { status: 403 });
  if (!rateLimit(`upload:${me.user.id}`, 40, 10 * 60 * 1000)) return Response.json({ error: "Trop d'envois, patientez." }, { status: 429 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const kind = form?.get("kind") === "logo" ? "logo" : "item";
  if (!(file instanceof File)) return Response.json({ error: "Fichier manquant" }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return Response.json({ error: "Image trop lourde (4 Mo max)." }, { status: 413 });

  const body = Buffer.from(await file.arrayBuffer());
  const type = sniffImage(body);
  if (!type) return Response.json({ error: "Format non supporté (JPEG, PNG ou WebP)." }, { status: 415 });

  const key = `${me.organization.id}/${kind}-${Date.now().toString(36)}-${randomBytes(4).toString("hex")}.${ALLOWED_IMAGE_TYPES[type]}`;
  try {
    const stored = await getStorage().put({ key, body, contentType: type });
    return Response.json({ url: stored.url });
  } catch (e) {
    console.error("[upload]", e);
    return Response.json({ error: "Stockage indisponible. Vérifiez UPLOAD_PROVIDER." }, { status: 500 });
  }
}
