import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { PlanForm } from "@/components/superadmin/forms";
import { deletePlan } from "@/lib/actions/superadmin";
import { db } from "@/lib/db";
import { formatFcfa } from "@/lib/money";

export const metadata: Metadata = { title: "Plans · Super-admin" };
export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const plans = await db.plan.findMany({ orderBy: [{ position: "asc" }, { priceMonthly: "asc" }], include: { _count: { select: { organizations: true } } } });
  return (
    <>
      <PageHeader title="Plans & tarifs" description="Définissez les plans et le prix mensuel (FCFA). Les Gérants voient les plans actifs dans leur page Abonnement." />
      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((p) => (
          <Card as="section" key={p.id}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold">{p.name}</h2>
                <p className="text-body-sm text-muted-foreground">{formatFcfa(p.priceMonthly)} / mois · {p._count.organizations} entreprise{p._count.organizations > 1 ? "s" : ""}{p.active ? "" : " · inactif"}</p>
              </div>
              <form action={deletePlan}><input type="hidden" name="id" value={p.id} />
                <ConfirmButton className="onime-btn onime-btn--tertiary" confirm={p._count.organizations ? "Ce plan est utilisé : il sera seulement désactivé. Continuer ?" : `Supprimer le plan « ${p.name} » ?`}>{p._count.organizations ? "Désactiver" : "Supprimer"}</ConfirmButton></form>
            </div>
            <PlanForm plan={p} />
          </Card>
        ))}
        <Card as="section" flat>
          <h2 className="mb-3 font-display text-lg font-bold">Nouveau plan</h2>
          <PlanForm />
        </Card>
      </div>
    </>
  );
}
