import { requireStaff } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { PageHeader, Alert } from "@/components/ui";
import { PointageEmployee } from "@/components/app/pointage-employee";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function PointagePage() {
  const me = await requireStaff();
  if (me.role === "OWNER") {
    return (
      <div>
        <PageHeader title="Pointage" description="Réservé aux comptes employés" />
        <Alert tone="info">Connectez-vous avec un compte employé sur votre téléphone, ou ouvrez le suivi depuis Pointage (admin).</Alert>
      </div>
    );
  }

  const open = await db.timeEntry.findFirst({
    where: { userId: me.user.id, boutiqueId: me.boutique!.id, checkOutAt: null },
    orderBy: { checkInAt: "desc" },
  });
  const recent = await db.timeEntry.findMany({
    where: { userId: me.user.id, boutiqueId: me.boutique!.id },
    orderBy: { checkInAt: "desc" },
    take: 15,
  });

  return (
    <div>
      <PageHeader title="Pointage" description="Arrivée et départ depuis votre téléphone." />
      {open ? (
        <Alert tone="info" title="Session en cours" className="mb-5">
          Arrivée enregistrée à {fmt(open.checkInAt)}.
        </Alert>
      ) : null}
      <PointageEmployee hasOpen={Boolean(open)} />
      <section>
        <h2 className="page-title mb-3 text-lg">Mon historique</h2>
        <ul className="divide-y divide-border rounded-card border border-border">
          {recent.length === 0 ? (
            <li className="p-4 text-body-sm text-muted-foreground">Aucun pointage.</li>
          ) : (
            recent.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-body-sm">
                <span>{fmt(e.checkInAt)}</span>
                <span className="text-muted-foreground">{e.checkOutAt ? `→ ${fmt(e.checkOutAt)}` : "En cours"}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
