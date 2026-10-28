import { requireBoutiqueScope } from "@/lib/tenancy/require-boutique-scope";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { PageHeader } from "@/components/ui";
import { SectionSubNav } from "@/components/app/section-subnav";
import { PurchaseFormModal, toScannableProduct } from "@/components/app/inventory-forms";
import { ACHATS_SECTION } from "@/lib/commerce-sections";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(d);
}

export default async function AchatsPage() {
  const me = await requireBoutiqueScope({ ownerOnly: true });
  const [products, suppliers, purchases] = await Promise.all([
    db.product.findMany({ where: { boutiqueId: me.boutique.id, active: true }, orderBy: { name: "asc" } }),
    db.supplier.findMany({ where: { boutiqueId: me.boutique.id }, orderBy: { name: "asc" } }),
    db.purchase.findMany({
      where: { boutiqueId: me.boutique.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { supplier: true, lines: { include: { product: true } } },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Achats"
        description="Réceptions fournisseurs et entrées en stock."
        actions={
          <PurchaseFormModal
            products={products.map(toScannableProduct)}
            suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
          />
        }
      />
      <SectionSubNav items={ACHATS_SECTION} />
      <ul className="divide-y divide-border rounded-card border border-border">
        {purchases.map((p) => (
          <li key={p.id} className="p-4 text-body-sm">
            <div className="flex flex-wrap justify-between gap-2 font-medium">
              <span>{p.supplier?.name ?? "Sans fournisseur"} · {formatMoney(p.total, me.organization.currency)}</span>
              <span className="text-muted-foreground">{p.receivedAt ? fmt(p.receivedAt) : fmt(p.createdAt)}</span>
            </div>
            <p className="mt-1 text-muted-foreground">{p.lines.map((l) => `${l.quantity}× ${l.product.name}`).join(", ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
