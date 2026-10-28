import type { Metadata } from "next";
import { LinkButton, PageHeader, Stat, Alert } from "@/components/ui";
import { OnboardingChecklist } from "@/components/app/onboarding-checklist";
import { boutiqueIdsForQuery } from "@/lib/auth/boutique-context";
import { requireStaff } from "@/lib/auth/session";
import { formatMoney } from "@/lib/money";
import { dashboardDayStats } from "@/lib/tenancy/dashboard-stats";

export const metadata: Metadata = { title: "Tableau de bord" };
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenue?: string; choix_boutique?: string; onboarding?: string }>;
}) {
  const me = await requireStaff({ ownerOnly: true });
  const { organization, viewMode, boutique, boutiques } = me;
  const sp = await searchParams;

  const boutiqueIds = boutiqueIdsForQuery(viewMode, boutique, boutiques);
  const stats = await dashboardDayStats(boutiqueIds);

  const title =
    viewMode === "consolidated"
      ? "Vue consolidée"
      : sp.bienvenue
        ? `Bienvenue, ${me.user.name.split(" ")[0]}`
        : "Tableau de bord";

  const description =
    viewMode === "consolidated"
      ? `${organization.name} · ${boutiques.length} boutique${boutiques.length > 1 ? "s" : ""}`
      : (boutique?.name ?? organization.name);

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <LinkButton href="/dashboard/stock" variant="secondary">Stock</LinkButton>
            <LinkButton href="/dashboard/pointage">Pointages</LinkButton>
          </>
        }
      />

      {sp.onboarding === "1" && boutique && (
        <OnboardingChecklist
          organizationName={organization.name}
          boutiqueName={boutique.name}
          productCount={stats.productCount}
          staffCount={stats.staffCount}
        />
      )}

      {sp.choix_boutique === "1" && viewMode === "consolidated" && (
        <Alert tone="caution" className="mb-5" title="Sélectionnez une boutique">
          Choisissez une boutique dans le menu pour modifier le stock, les ventes ou les achats.
        </Alert>
      )}

      {viewMode === "consolidated" && (
        <p className="mb-4 text-body-sm text-muted-foreground">
          Totaux du jour sur l&apos;ensemble de vos boutiques. Changez de contexte pour agir sur une boutique précise.
        </p>
      )}

      <section aria-label="Statistiques du jour" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Ventes du jour" value={stats.salesToday._count} />
        <Stat
          label="CA du jour"
          value={formatMoney(stats.salesToday._sum.total ?? 0, organization.currency)}
          className="col-span-2 lg:col-span-1"
        />
        <Stat label="Achats du jour" value={stats.purchasesToday._count} />
        <Stat label="Pointages ouverts" value={stats.openClocks} hint={stats.openClocks ? "Employés encore pointés" : "Tous clôturés"} />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-border p-5">
          <h2 className="page-title mb-2 text-lg">Stock</h2>
          <p className="mb-4 text-body-sm text-muted-foreground">
            {stats.productCount} produit{stats.productCount > 1 ? "s" : ""} actif{stats.productCount > 1 ? "s" : ""}
            {stats.lowStockCount > 0 ? ` · ${stats.lowStockCount} en alerte` : ""}
          </p>
          <LinkButton href="/dashboard/stock" variant="secondary">Gérer le stock</LinkButton>
        </div>
        <div className="rounded-card border border-border p-5">
          <h2 className="page-title mb-2 text-lg">Équipe</h2>
          <p className="mb-4 text-body-sm text-muted-foreground">
            {stats.staffCount} employé{stats.staffCount > 1 ? "s" : ""} (contexte sélectionné)
          </p>
          <LinkButton href="/dashboard/equipe" variant="secondary">Inviter des employés</LinkButton>
        </div>
      </section>
    </>
  );
}
