import "server-only";
import { redirect } from "next/navigation";
import type { Boutique } from "@prisma/client";
import { requireStaff, type StaffContext } from "../auth/session";

/** Pages opérationnelles (stock, ventes…) : une boutique doit être sélectionnée. */
export async function requireBoutiqueScope(opts: { ownerOnly?: boolean } = {}): Promise<StaffContext & { boutique: Boutique }> {
  const me = await requireStaff(opts);
  if (me.viewMode === "consolidated" || !me.boutique) {
    redirect("/dashboard?choix_boutique=1");
  }
  return me as StaffContext & { boutique: Boutique };
}
