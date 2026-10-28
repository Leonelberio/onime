import Link from "next/link";
import { boutiqueIdsForQuery } from "@/lib/auth/boutique-context";
import { requireStaff } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { isLate } from "@/lib/pointage/geofence";
import { PageHeader, Stat, LinkButton } from "@/components/ui";
import { AdminCorrectEntryForm } from "@/components/app/admin-correct-entry-form";
import { PointageFilters } from "@/components/app/pointage-filters";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function PointageAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; from?: string; to?: string }>;
}) {
  const me = await requireStaff({ ownerOnly: true });
  const sp = await searchParams;
  const boutiqueIds = boutiqueIdsForQuery(me.viewMode, me.boutique, me.boutiques);
  const scope = { boutiqueId: { in: boutiqueIds } };

  const from = sp.from ? new Date(sp.from) : new Date(Date.now() - 7 * 86_400_000);
  const to = sp.to ? new Date(sp.to) : new Date();
  to.setHours(23, 59, 59, 999);

  const [employees, entries, attempts, openNow] = await Promise.all([
    db.user.findMany({
      where: { ...scope, role: "EMPLOYEE", disabled: false },
      orderBy: { name: "asc" },
    }),
    db.timeEntry.findMany({
      where: {
        ...scope,
        checkInAt: { gte: from, lte: to },
        ...(sp.userId ? { userId: sp.userId } : {}),
      },
      orderBy: { checkInAt: "desc" },
      take: 100,
      include: { user: { select: { name: true } } },
    }),
    db.pointageAttempt.findMany({
      where: { ...scope, accepted: false, createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { name: true } } },
    }),
    db.timeEntry.count({ where: { ...scope, checkOutAt: null } }),
  ]);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const checkedInToday = new Set(
    (
      await db.timeEntry.findMany({
        where: { ...scope, checkInAt: { gte: startOfDay } },
        select: { userId: true },
      })
    ).map((e) => e.userId),
  );
  const absentCount = employees.filter((e) => !checkedInToday.has(e.id)).length;
  const workStart = me.boutique?.workDayStartTime ?? null;
  const lateCount = workStart
    ? entries.filter((e) => e.checkInAt >= startOfDay && isLate(e.checkInAt, workStart)).length
    : 0;

  const exportQs = new URLSearchParams();
  if (sp.userId) exportQs.set("userId", sp.userId);
  exportQs.set("from", from.toISOString());
  exportQs.set("to", to.toISOString());
  if (me.boutique) exportQs.set("boutiqueId", me.boutique.id);

  return (
    <div>
      <PageHeader
        title="Pointage équipe"
        description={
          me.viewMode === "consolidated"
            ? "Vue consolidée — toutes les boutiques"
            : "Présences, GPS, IP et tentatives refusées."
        }
        actions={
          <>
            <LinkButton href="/dashboard/pointage/reglages" variant="secondary">
              Réglages GPS
            </LinkButton>
            <LinkButton href={`/api/pointage/export?${exportQs.toString()}`} variant="secondary">
              Export CSV
            </LinkButton>
          </>
        }
      />

      <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Présents (session ouverte)" value={openNow} />
        <Stat label="Absents aujourd'hui" value={absentCount} />
        <Stat label="Retards (période filtrée)" value={lateCount} />
        <Stat label="Tentatives refusées" value={attempts.length} />
      </section>

      <PointageFilters
        employees={employees.map((e) => ({ id: e.id, name: e.name }))}
        userId={sp.userId}
        from={from.toISOString().slice(0, 10)}
        to={to.toISOString().slice(0, 10)}
      />

      {attempts.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-lg font-bold">Pointages refusés / suspects</h2>
          <ul className="divide-y divide-border rounded-card border border-border text-body-sm">
            {attempts.map((a) => (
              <li key={a.id} className="p-3">
                <span className="font-medium">{a.user?.name ?? "—"}</span> · {a.kind} · {a.reason}
                <span className="ml-2 text-muted-foreground">{fmt(a.createdAt)}</span>
                {a.ip && <span className="ml-2 text-muted-foreground">IP {a.ip}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-lg font-bold">Historique</h2>
        <div className="overflow-x-auto rounded-card border border-border">
          <table className="w-full min-w-[900px] text-left text-body-sm">
            <thead className="table-head border-b border-border">
              <tr>
                <th className="p-3">Employé</th>
                <th className="p-3">Entrée</th>
                <th className="p-3">Sortie</th>
                <th className="p-3">GPS in</th>
                <th className="p-3">IP in / out</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Aucun pointage sur la période.
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="row-hover border-b border-border last:border-0">
                    <td className="p-3 font-medium">{e.user.name}</td>
                    <td className="p-3">{fmt(e.checkInAt)}</td>
                    <td className="p-3">{e.checkOutAt ? fmt(e.checkOutAt) : "En cours"}</td>
                    <td className="p-3 text-muted-foreground">
                      {e.checkInLat != null
                        ? `${e.checkInLat.toFixed(5)}, ${e.checkInLng?.toFixed(5)} (±${Math.round(e.checkInAccuracyM ?? 0)} m)`
                        : "—"}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {e.checkInIp ?? "—"}
                      {e.checkOutIp ? ` / ${e.checkOutIp}` : ""}
                    </td>
                    <td className="p-3 text-right">
                      {!e.checkOutAt && me.boutique ? <AdminCorrectEntryForm entryId={e.id} /> : null}
                      {e.correctedAt && (
                        <p className="mt-1 text-caption text-caution-text">Corrigé · {e.correctionReason}</p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-body-sm text-muted-foreground">
          <Link href="/dashboard/equipe" className="underline">
            Gérer les employés et appareils
          </Link>
        </p>
      </section>
    </div>
  );
}
