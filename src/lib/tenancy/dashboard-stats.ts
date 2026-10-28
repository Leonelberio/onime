import { db } from "../db";

function aggregateCount(value: number | { _all: number } | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : value._all;
}

function aggregateSum(value: number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value);
}

export async function dashboardDayStats(boutiqueIds: string[]) {
  if (boutiqueIds.length === 0) {
    return {
      productCount: 0,
      salesToday: { _count: 0, _sum: { total: 0 } },
      purchasesToday: { _count: 0, _sum: { total: 0 } },
      openClocks: 0,
      staffCount: 0,
      lowStockCount: 0,
    };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [productCount, salesToday, purchasesToday, openClocks, staffCount, lowStockProducts] = await Promise.all([
    db.product.count({ where: { boutiqueId: { in: boutiqueIds }, active: true } }),
    db.sale.aggregate({
      where: {
        boutiqueId: { in: boutiqueIds },
        status: "CONFIRMED",
        confirmedAt: { gte: startOfDay },
      },
      _count: true,
      _sum: { total: true },
    }),
    db.purchase.aggregate({
      where: {
        boutiqueId: { in: boutiqueIds },
        status: "RECEIVED",
        receivedAt: { gte: startOfDay },
      },
      _count: true,
      _sum: { total: true },
    }),
    db.timeEntry.count({ where: { boutiqueId: { in: boutiqueIds }, checkOutAt: null } }),
    db.user.count({
      where: { organizationId: { not: null }, boutiqueId: { in: boutiqueIds }, role: "EMPLOYEE", disabled: false },
    }),
    db.product.findMany({
      where: { boutiqueId: { in: boutiqueIds }, active: true },
      select: { stockQty: true, minStock: true },
    }),
  ]);

  const lowStockCount = lowStockProducts.filter((p) => p.stockQty <= p.minStock).length;

  return {
    productCount,
    salesToday: {
      _count: aggregateCount(salesToday._count as number | { _all: number }),
      _sum: { total: aggregateSum(salesToday._sum.total as number | null) },
    },
    purchasesToday: {
      _count: aggregateCount(purchasesToday._count as number | { _all: number }),
      _sum: { total: aggregateSum(purchasesToday._sum.total as number | null) },
    },
    openClocks,
    staffCount,
    lowStockCount,
  };
}
