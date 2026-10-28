"use client";

import { CONSOLIDATED_BOUTIQUE } from "@/lib/auth/boutique-context";
import type { Boutique } from "@prisma/client";
import { setActiveBoutiqueAndRedirect } from "@/lib/actions/boutique-context";

type Props = {
  boutiques: Pick<Boutique, "id" | "name">[];
  viewMode: "boutique" | "consolidated";
  activeBoutiqueId: string | null;
};

export function BoutiqueSwitcher({ boutiques, viewMode, activeBoutiqueId }: Props) {
  if (boutiques.length <= 1) return null;

  const current =
    viewMode === "consolidated" ? CONSOLIDATED_BOUTIQUE : (activeBoutiqueId ?? CONSOLIDATED_BOUTIQUE);

  return (
    <form action={setActiveBoutiqueAndRedirect} className="w-full max-w-xs">
      <label className="sr-only" htmlFor="boutique-switcher">
        Boutique active
      </label>
      <select
        id="boutique-switcher"
        name="boutiqueId"
        defaultValue={current}
        className="onime-input w-full text-body-sm"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value={CONSOLIDATED_BOUTIQUE}>Vue consolidée (toutes)</option>
        {boutiques.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </form>
  );
}
