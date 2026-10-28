/** Transforme un nom de Boutique en slug d'URL (a-z, 0-9, tirets). */
export function slugify(input: string): string {
  const s = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  return s || "entreprise";
}

const RESERVED = new Set(["api", "admin", "superadmin", "dashboard", "pointage", "connexion", "inscription", "invitation"]);

/** Renvoie un slug libre en suffixant -2, -3… (isTaken est injecté pour les tests). */
export async function uniqueSlug(base: string, isTaken: (slug: string) => Promise<boolean>): Promise<string> {
  const root = slugify(base);
  for (let i = 1; i < 200; i++) {
    const candidate = i === 1 ? root : `${root}-${i}`;
    if (RESERVED.has(candidate)) continue;
    if (!(await isTaken(candidate))) return candidate;
  }
  return `${root}-${Math.random().toString(36).slice(2, 8)}`;
}
