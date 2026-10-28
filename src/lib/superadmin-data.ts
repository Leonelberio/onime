import { db } from "./db";
import { getSubscriptionState, type SubscriptionState } from "./subscription";

export interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string | null;
  createdAt: Date;
  trialEndsAt: Date;
  subscriptionEndsAt: Date | null;
  planName: string | null;
  planPrice: number | null;
  boutiqueCount: number;
  staffCount: number;
  sub: SubscriptionState;
}

export async function listOrganizations(now = new Date()): Promise<OrganizationRow[]> {
  const rows = await db.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      plan: true,
      staff: { where: { role: "OWNER" }, select: { email: true }, take: 1 },
      _count: { select: { staff: true, boutiques: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    ownerEmail: r.staff[0]?.email ?? null,
    createdAt: r.createdAt,
    trialEndsAt: r.trialEndsAt,
    subscriptionEndsAt: r.subscriptionEndsAt,
    planName: r.plan?.name ?? null,
    planPrice: r.plan?.priceMonthly ?? null,
    boutiqueCount: r._count.boutiques,
    staffCount: r._count.staff,
    sub: getSubscriptionState(r, now),
  }));
}

export function computeMrr(rows: Pick<OrganizationRow, "sub" | "planPrice">[]): number {
  return rows.reduce((s, r) => s + (r.sub.status === "active" ? r.planPrice ?? 0 : 0), 0);
}

/** @deprecated alias interne */
export const listCompanies = listOrganizations;
export type CompanyRow = OrganizationRow;
