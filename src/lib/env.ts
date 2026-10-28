/** Accès centralisé aux variables d'environnement (jamais de valeur par défaut secrète). */

export function superadminEmails(): string[] {
  return (process.env.SUPERADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperadminEmail(email: string): boolean {
  return superadminEmails().includes(email.trim().toLowerCase());
}

export function appUrl(fallbackOrigin?: string): string {
  let url = (process.env.NEXT_PUBLIC_APP_URL || fallbackOrigin || "http://localhost:3000").trim();
  url = url.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  return url;
}

export function authSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET manquant ou trop court (32 caractères minimum). Voir .env.example.");
  }
  return new TextEncoder().encode(s);
}
