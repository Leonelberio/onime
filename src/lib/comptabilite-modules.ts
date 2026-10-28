export type ComptabiliteModuleId =
  | "tenue-de-livres"
  | "rattrapage"
  | "fin-exercice"
  | "comptes"
  | "par-projet";

export interface ComptabiliteModule {
  id: ComptabiliteModuleId;
  label: string;
  description: string;
}

export const COMPTABILITE_MODULES: ComptabiliteModule[] = [
  {
    id: "tenue-de-livres",
    label: "Tenue de livres",
    description: "Saisie quotidienne, journaux et grand livre.",
  },
  {
    id: "rattrapage",
    label: "Rattrapage",
    description: "Reprise d'historique et régularisation des périodes passées.",
  },
  {
    id: "fin-exercice",
    label: "Fin d'exercice",
    description: "Clôture, reports et bilan de fin de période.",
  },
  {
    id: "comptes",
    label: "Comptes clients et fournisseurs",
    description: "Balances auxiliaires, échéances et lettrage.",
  },
  {
    id: "par-projet",
    label: "Comptabilité par projet",
    description: "Suivi des coûts et marges par activité ou chantier.",
  },
];

export function comptabiliteModule(id: string | undefined): ComptabiliteModule {
  return COMPTABILITE_MODULES.find((m) => m.id === id) ?? COMPTABILITE_MODULES[0];
}
