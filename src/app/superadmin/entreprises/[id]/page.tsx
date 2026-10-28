import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, PageHeader, Stat } from "@/components/ui";
import { ExtendTrialForm, PaymentForm } from "@/components/superadmin/forms";
import { SubBadge } from "@/components/superadmin/sub-badge";
import { setSuspended } from "@/lib/actions/superadmin";
import { db } from "@/lib/db";
import { formatFcfa } from "@/lib/money";
import { getSubscriptionState } from "@/lib/subscription";

export const metadata: Metadata = { title: "Organisation · Super-admin" };
export const dynamic = "force-dynamic";

const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function OrganizationAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await db.organization.findUnique({
    where: { id },
    include: {
      plan: true,
      staff: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" }, include: { plan: true }, take: 20 },
      boutiques: { select: { id: true, name: true } },
      _count: { select: { staff: true, boutiques: true } },
    },
  });
  if (!r) notFound();
  const plans = await db.plan.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { priceMonthly: "asc" }] });
  const sub = getSubscriptionState(r);
  const owner = r.staff.find((s) => s.role === "OWNER");

  const productCount = await db.product.count({
    where: { boutiqueId: { in: r.boutiques.map((b) => b.id) } },
  });

  return (
    <>
      <Link href="/superadmin/entreprises" className="onime-link mb-3 inline-flex items-center gap-1 text-body-sm"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Organisations</Link>
      <PageHeader
        title={r.name}
        description={<span className="flex flex-wrap items-center gap-2"><SubBadge sub={sub} /> {owner?.email}</span>}
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Chiffres">
        <Stat label="Essai" value={sub.status === "trial" ? `${sub.trialDaysLeft} j` : "Terminé"} hint={`Fin : ${fmt(r.trialEndsAt)}`} />
        <Stat label="Abonnement" value={r.subscriptionEndsAt && sub.subscriptionDaysLeft ? `${sub.subscriptionDaysLeft} j` : "-"} hint={r.subscriptionEndsAt ? `Jusqu'au ${fmt(r.subscriptionEndsAt)}` : "Aucun"} />
        <Stat label="Boutiques" value={r._count.boutiques} />
        <Stat label="Produits (toutes)" value={productCount} hint={r.plan ? `Plan ${r.plan.name}` : "Sans plan"} />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card as="section">
          <h2 className="mb-3 font-display text-lg font-bold">Enregistrer un paiement</h2>
          <PaymentForm organizationId={r.id} plans={plans} />
        </Card>
        <div className="space-y-4">
          <Card as="section">
            <h2 className="mb-3 font-display text-lg font-bold">Prolonger l&apos;essai</h2>
            <ExtendTrialForm organizationId={r.id} />
          </Card>
          <Card as="section">
            <h2 className="mb-3 font-display text-lg font-bold">Suspension</h2>
            <form action={setSuspended} className="flex flex-wrap gap-2">
              <input type="hidden" name="organizationId" value={r.id} />
              <input type="hidden" name="suspended" value={String(!r.suspended)} />
              <button type="submit" className="onime-btn onime-btn--secondary">{r.suspended ? "Réactiver" : "Suspendre"}</button>
            </form>
          </Card>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold">Paiements récents</h2>
        <ul className="divide-y divide-border rounded-card border border-border text-body-sm">
          {r.payments.length === 0 ? (
            <li className="p-4 text-muted-foreground">Aucun paiement.</li>
          ) : (
            r.payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <span>{formatFcfa(p.amount)} · {p.months} mois · {p.plan?.name ?? "—"}</span>
                <span className="text-muted-foreground">{p.createdAt.toLocaleDateString("fr-FR")}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </>
  );
}
