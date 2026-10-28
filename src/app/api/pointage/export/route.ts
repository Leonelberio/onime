import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

function csvEscape(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export async function GET(req: Request) {
  const me = await getCurrentUser();
  if (!me?.organization || me.role !== "OWNER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const url = new URL(req.url);
  const boutiqueId = url.searchParams.get("boutiqueId");
  if (!boutiqueId) {
    return NextResponse.json({ error: "Paramètre boutiqueId requis (export par boutique)." }, { status: 400 });
  }
  const allowed = await db.boutique.findFirst({
    where: { id: boutiqueId, organizationId: me.organization.id },
    select: { id: true },
  });
  if (!allowed) return NextResponse.json({ error: "Boutique invalide." }, { status: 403 });

  const userId = url.searchParams.get("userId") ?? undefined;
  const from = url.searchParams.get("from") ? new Date(url.searchParams.get("from")!) : new Date(Date.now() - 30 * 86_400_000);
  const to = url.searchParams.get("to") ? new Date(url.searchParams.get("to")!) : new Date();
  to.setHours(23, 59, 59, 999);

  const entries = await db.timeEntry.findMany({
    where: {
      boutiqueId,
      checkInAt: { gte: from, lte: to },
      ...(userId ? { userId } : {}),
    },
    orderBy: { checkInAt: "asc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const header = [
    "employe",
    "email",
    "entree",
    "sortie",
    "lat_entree",
    "lng_entree",
    "precision_entree_m",
    "ip_entree",
    "lat_sortie",
    "lng_sortie",
    "precision_sortie_m",
    "ip_sortie",
    "corrige",
    "motif_correction",
  ].join(",");

  const lines = entries.map((e) =>
    [
      e.user.name,
      e.user.email,
      e.checkInAt.toISOString(),
      e.checkOutAt?.toISOString() ?? "",
      e.checkInLat ?? "",
      e.checkInLng ?? "",
      e.checkInAccuracyM ?? "",
      e.checkInIp ?? "",
      e.checkOutLat ?? "",
      e.checkOutLng ?? "",
      e.checkOutAccuracyM ?? "",
      e.checkOutIp ?? "",
      e.correctedAt ? "oui" : "non",
      e.correctionReason ?? "",
    ]
      .map((c) => csvEscape(String(c)))
      .join(","),
  );

  const body = `\uFEFF${header}\n${lines.join("\n")}`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pointages-${from.toISOString().slice(0, 10)}.csv"`,
    },
  });
}
