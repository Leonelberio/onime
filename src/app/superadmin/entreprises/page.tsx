import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/ui";
import { SubBadge } from "@/components/superadmin/sub-badge";
import { formatFcfa } from "@/lib/money";
import { listCompanies } from "@/lib/superadmin-data";
import { Store } from "lucide-react";

export const metadata: Metadata = { title: "Entreprises · Super-admin" };
export const dynamic = "force-dynamic";

const FILTERS = [["", "Tous"], ["trial", "Essai"], ["active", "Actifs"], ["expired", "Expirés"], ["suspended", "Suspendus"]] as const;
const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

export default async function EntreprisesPage({ searchParams }: { searchParams: Promise<{ statut?: string; q?: string }> }) {
  const sp = await searchParams;
  const all = await listCompanies();
  const q = (sp.q ?? "").trim().toLowerCase();
  const rows = all.filter((r) => (!sp.statut || r.sub.status === sp.statut) && (!q || `${r.name} ${r.slug} ${r.ownerEmail ?? ""}`.toLowerCase().includes(q)));

  return (
    <>
      <PageHeader title="Entreprises" description={`${all.length} entreprise${all.length > 1 ? "s" : ""} inscrite${all.length > 1 ? "s" : ""}.`} />

      <form className="mb-4 flex flex-wrap items-center gap-2" role="search">
        <label htmlFor="q" className="sr-only">Rechercher</label>
        <input id="q" name="q" defaultValue={sp.q} placeholder="Rechercher (nom, email, lien)…" className="onime-input max-w-xs" />
        {sp.statut && <input type="hidden" name="statut" value={sp.statut} />}
        <button className="onime-btn onime-btn--secondary">Rechercher</button>
      </form>
      <nav aria-label="Filtrer par statut" className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(([k, label]) => (
          <Link key={k} href={k ? `?statut=${k}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}` : sp.q ? `?q=${encodeURIComponent(sp.q)}` : "?"} className="chip" aria-current={(sp.statut ?? "") === k ? "true" : undefined}>{label}</Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState icon={<Store className="h-6 w-6" aria-hidden="true" />} title="Aucune entreprise">Aucun résultat pour ces filtres.</EmptyState>
      ) : (
        <div className="onime-card overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-body-sm">
            <thead><tr className="border-b border-border">
              {["Entreprise", "Statut", "Fin essai", "Abonnement", "Plan", "Effectif", "Inscrit le"].map((h) => <th key={h} scope="col" className="table-head px-4 py-3">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="row-hover">
                  <td className="px-4 py-3">
                    <Link href={`/superadmin/entreprises/${r.id}`} className="onime-link font-semibold">{r.name}</Link>
                    <p className="text-caption text-muted-foreground">{r.ownerEmail}</p>
                  </td>
                  <td className="px-4 py-3"><SubBadge sub={r.sub} /></td>
                  <td className="px-4 py-3">{fmt(r.trialEndsAt)}</td>
                  <td className="px-4 py-3">{r.subscriptionEndsAt ? fmt(r.subscriptionEndsAt) : "-"}</td>
                  <td className="px-4 py-3">{r.planName ? `${r.planName} · ${formatFcfa(r.planPrice ?? 0)}` : "-"}</td>
                  <td className="px-4 py-3">{r.staffCount}</td>
                  <td className="px-4 py-3">{fmt(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
