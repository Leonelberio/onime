import type { Metadata } from "next";
import Link from "next/link";
import { Card, PageHeader, Stat } from "@/components/ui";
import { SubBadge } from "@/components/superadmin/sub-badge";
import { db } from "@/lib/db";
import { formatFcfa } from "@/lib/money";
import { computeMrr, listCompanies } from "@/lib/superadmin-data";

export const metadata: Metadata = { title: "Super-admin" };
export const dynamic = "force-dynamic";

export default async function SuperadminHome() {
  const rows = await listCompanies();
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [sales30, revenue] = await Promise.all([
    db.sale.count({ where: { createdAt: { gte: since }, status: "CONFIRMED" } }),
    db.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
  ]);
  const count = (s: string) => rows.filter((r) => r.sub.status === s).length;
  const expiringSoon = rows.filter((r) => r.sub.status === "trial" && r.sub.trialDaysLeft <= 2);

  return (
    <>
      <PageHeader title="Vue d'ensemble" description="Entreprises, abonnements et activité de la plateforme." />
      <section aria-label="Statistiques" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Entreprises" value={rows.length} hint={`${count("active")} actifs · ${count("trial")} en essai`} />
        <Stat label="MRR (FCFA / mois)" value={formatFcfa(computeMrr(rows))} hint="Abonnements actifs" />
        <Stat label="Ventes (30 j)" value={sales30} hint="Toutes entreprises" />
        <Stat label="Paiements encaissés" value={formatFcfa(revenue._sum.amount ?? 0)} hint="Total enregistré" />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card as="section">
          <h2 className="font-display text-lg font-bold">Répartition</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-body-sm">
            {([["trial", "Essai"], ["active", "Actifs"], ["expired", "Expirés"], ["suspended", "Suspendus"]] as const).map(([k, label]) => (
              <div key={k} className="rounded-button bg-surface px-3 py-2"><dt className="text-muted-foreground">{label}</dt><dd className="font-display text-2xl font-bold">{count(k)}</dd></div>
            ))}
          </dl>
        </Card>
        <Card as="section">
          <h2 className="font-display text-lg font-bold">À relancer</h2>
          {expiringSoon.length === 0 ? (
            <p className="mt-3 text-body-sm text-muted-foreground">Aucun essai n&apos;expire dans les 2 prochains jours.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {expiringSoon.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/superadmin/entreprises/${r.id}`} className="onime-link truncate font-medium">{r.name}</Link>
                  <SubBadge sub={r.sub} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
