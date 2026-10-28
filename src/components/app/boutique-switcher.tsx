"use client";

import { CONSOLIDATED_BOUTIQUE } from "@/lib/auth/boutique-constants";
import type { Boutique } from "@prisma/client";
import { setActiveBoutiqueAndRedirect } from "@/lib/actions/boutique-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  boutiques: Pick<Boutique, "id" | "name">[];
  viewMode: "boutique" | "consolidated";
  activeBoutiqueId: string | null;
};

export function BoutiqueSwitcher({ boutiques, viewMode, activeBoutiqueId }: Props) {
  if (boutiques.length <= 1) return null;

  const current =
    viewMode === "consolidated" ? CONSOLIDATED_BOUTIQUE : (activeBoutiqueId ?? CONSOLIDATED_BOUTIQUE);

  function onValueChange(value: string) {
    if (value === current) return;
    const fd = new FormData();
    fd.set("boutiqueId", value);
    void setActiveBoutiqueAndRedirect(fd);
  }

  return (
    <Select value={current} onValueChange={onValueChange}>
      <SelectTrigger id="boutique-switcher" aria-label="Boutique active" className="w-full max-w-xs">
        <SelectValue placeholder="Choisir une boutique" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={CONSOLIDATED_BOUTIQUE}>Vue consolidée (toutes)</SelectItem>
        {boutiques.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
