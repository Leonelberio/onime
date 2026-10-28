/** URLs d'images autorisées en base (logo / photos de plats). */
const HTTPS = /^https:\/\//i;
const LOCAL = /^\/api\/files\//;

const TRUSTED_SUFFIXES = [
  "utfs.io",
  "ufs.sh",
  "uploadthing.com",
  "public.blob.vercel-storage.com",
  "r2.dev",
  "r2.cloudflarestorage.com",
  "amazonaws.com",
] as const;

function isTrustedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return TRUSTED_SUFFIXES.some((s) => h === s || h.endsWith(`.${s}`));
}

export function isAllowedImageUrl(url: string): boolean {
  const u = url.trim();
  if (!u || u.length > 500) return false;
  if (LOCAL.test(u)) return !u.includes("..");
  if (!HTTPS.test(u)) return false;
  try {
    return isTrustedHost(new URL(u).hostname);
  } catch {
    return false;
  }
}
