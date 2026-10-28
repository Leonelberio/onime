import type { SectionSubNavItem } from "@/components/app/section-subnav";

export const VENTES_SECTION: SectionSubNavItem[] = [
  { href: "/dashboard/ventes", label: "Ventes", exact: true },
  { href: "/dashboard/ventes/clients", label: "Clients" },
];

export const ACHATS_SECTION: SectionSubNavItem[] = [
  { href: "/dashboard/achats", label: "Achats", exact: true },
  { href: "/dashboard/achats/fournisseurs", label: "Fournisseurs" },
];
