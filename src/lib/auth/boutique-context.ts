import "server-only";
import { cookies } from "next/headers";
import type { Boutique, Organization, User } from "@prisma/client";
import { db } from "../db";
import {
  BOUTIQUE_CONTEXT_COOKIE,
  CONSOLIDATED_BOUTIQUE,
  type BoutiqueViewMode,
} from "./boutique-constants";

export { BOUTIQUE_CONTEXT_COOKIE, CONSOLIDATED_BOUTIQUE, type BoutiqueViewMode } from "./boutique-constants";

export async function listAccessibleBoutiques(user: User, organizationId: string): Promise<Boutique[]> {
  if (user.role === "EMPLOYEE") {
    if (!user.boutiqueId) return [];
    const b = await db.boutique.findFirst({
      where: { id: user.boutiqueId, organizationId, active: true },
    });
    return b ? [b] : [];
  }
  return db.boutique.findMany({
    where: { organizationId, active: true },
    orderBy: { name: "asc" },
  });
}

export async function resolveBoutiqueContext(
  user: User,
  organization: Organization,
  boutiques: Boutique[],
): Promise<{ mode: BoutiqueViewMode; boutique: Boutique | null }> {
  if (user.role === "EMPLOYEE") {
    const boutique = boutiques[0] ?? null;
    return { mode: "boutique", boutique };
  }

  const jar = await cookies();
  const raw = jar.get(BOUTIQUE_CONTEXT_COOKIE)?.value;

  if (raw === CONSOLIDATED_BOUTIQUE) {
    return { mode: "consolidated", boutique: null };
  }

  if (raw) {
    const picked = boutiques.find((b) => b.id === raw);
    if (picked) return { mode: "boutique", boutique: picked };
  }

  if (boutiques.length === 1) {
    return { mode: "boutique", boutique: boutiques[0] };
  }

  return { mode: "consolidated", boutique: null };
}

export function boutiqueIdsForQuery(
  mode: BoutiqueViewMode,
  boutique: Boutique | null,
  boutiques: Boutique[],
): string[] {
  if (mode === "consolidated") return boutiques.map((b) => b.id);
  if (boutique) return [boutique.id];
  return [];
}
