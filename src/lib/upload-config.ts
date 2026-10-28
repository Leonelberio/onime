export type UploadProviderKind = "local" | "uploadthing" | "vercel-blob" | "s3" | "r2";

export function uploadProvider(): UploadProviderKind {
  const kind = (process.env.UPLOAD_PROVIDER || "local").toLowerCase();
  if (kind === "uploadthing" || kind === "vercel-blob" || kind === "s3" || kind === "r2" || kind === "local") {
    return kind;
  }
  return "local";
}

export function isUploadThingProvider(): boolean {
  return uploadProvider() === "uploadthing";
}
