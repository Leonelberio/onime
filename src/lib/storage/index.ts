import type { StorageProvider } from "./types";

/**
 * Sélection du fournisseur via UPLOAD_PROVIDER :
 *  - "uploadthing" : UploadThing (UPLOADTHING_TOKEN) - voir /api/uploadthing et ImageUploader
 *  - "vercel-blob" : @vercel/blob (BLOB_READ_WRITE_TOKEN)
 *  - "s3"          : S3 / Cloudflare R2 / MinIO (S3_* )
 *  - "local"       : écrit dans .uploads/ (UPLOAD_DIR), servi par /api/files (DÉVELOPPEMENT uniquement, non persistant sur Vercel)
 */
export function getStorage(): StorageProvider {
  const kind = (process.env.UPLOAD_PROVIDER || "local").toLowerCase();
  switch (kind) {
    case "uploadthing":
      throw new Error("UPLOAD_PROVIDER=uploadthing utilise /api/uploadthing (pas /api/upload).");
    case "vercel-blob":
      return vercelBlobProvider();
    case "s3":
    case "r2":
      return s3Provider();
    case "local":
      if (process.env.NODE_ENV === "production" && process.env.VERCEL)
        throw new Error("UPLOAD_PROVIDER=local n'est pas utilisable sur Vercel. Configurez vercel-blob ou s3.");
      return localProvider();
    default:
      throw new Error(`UPLOAD_PROVIDER inconnu : ${kind}`);
  }
}

function vercelBlobProvider(): StorageProvider {
  return {
    name: "vercel-blob",
    async put({ key, body, contentType }) {
      const { put } = await import("@vercel/blob");
      const res = await put(key, body, { access: "public", contentType, addRandomSuffix: false });
      return { url: res.url, key };
    },
    async remove(urlOrKey) {
      const { del } = await import("@vercel/blob");
      await del(urlOrKey);
    },
  };
}

function s3Provider(): StorageProvider {
  const need = (n: string) => {
    const v = process.env[n];
    if (!v) throw new Error(`Variable ${n} requise pour UPLOAD_PROVIDER=s3`);
    return v;
  };
  return {
    name: "s3",
    async put({ key, body, contentType }) {
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const client = new S3Client({
        region: process.env.S3_REGION || "auto",
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: Boolean(process.env.S3_ENDPOINT),
        credentials: { accessKeyId: need("S3_ACCESS_KEY_ID"), secretAccessKey: need("S3_SECRET_ACCESS_KEY") },
      });
      await client.send(
        new PutObjectCommand({ Bucket: need("S3_BUCKET"), Key: key, Body: body, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }),
      );
      const base = need("S3_PUBLIC_BASE_URL").replace(/\/+$/, "");
      return { url: `${base}/${key}`, key };
    },
    async remove(urlOrKey) {
      const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
      const client = new S3Client({
        region: process.env.S3_REGION || "auto",
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: Boolean(process.env.S3_ENDPOINT),
        credentials: { accessKeyId: need("S3_ACCESS_KEY_ID"), secretAccessKey: need("S3_SECRET_ACCESS_KEY") },
      });
      const base = (process.env.S3_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
      const key = urlOrKey.startsWith(base) ? urlOrKey.slice(base.length + 1) : urlOrKey;
      await client.send(new DeleteObjectCommand({ Bucket: need("S3_BUCKET"), Key: key }));
    },
  };
}

/** Dossier des fichiers du fournisseur local (hors `public/`, car `next start` ne sert pas les fichiers ajoutés après le démarrage). */
export function localUploadDir(): string {
  return process.env.UPLOAD_DIR || `${process.cwd()}/.uploads`;
}

function localProvider(): StorageProvider {
  return {
    name: "local",
    async put({ key, body }) {
      const { mkdir, writeFile } = await import("node:fs/promises");
      const path = await import("node:path");
      const file = path.join(localUploadDir(), key);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, body);
      return { url: `/api/files/${key}`, key };
    },
    async remove(urlOrKey) {
      const { rm } = await import("node:fs/promises");
      const path = await import("node:path");
      const key = urlOrKey.replace(/^\/api\/files\//, "");
      if (key.includes("..")) return;
      await rm(path.join(localUploadDir(), key), { force: true });
    },
  };
}
