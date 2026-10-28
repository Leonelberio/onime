import { requireBoutiqueScope } from "@/lib/tenancy/require-boutique-scope";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { PageHeader } from "@/components/ui";
import { SectionSubNav } from "@/components/app/section-subnav";
import { SaleFormModal, toScannableProduct } from "@/components/app/inventory-forms";
import { VENTES_SECTION } from "@/lib/commerce-sections";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(d);
}

export default async function VentesPage() {
  const me = await requireBoutiqueScope({ ownerOnly: true });
  const [products, customers, sales] = await Promise.all([
    db.product.findMany({ where: { boutiqueId: me.boutique.id, active: true }, orderBy: { name: "asc" } }),
    db.customer.findMany({ where: { boutiqueId: me.boutique.id }, orderBy: { name: "asc" } }),
    db.sale.findMany({
      where: { boutiqueId: me.boutique.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { lines: { include: { product: true } } },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Ventes"
        description="Enregistrez les sorties stock liées aux ventes."
        actions={
          <SaleFormModal
            products={products.map(toScannableProduct)}
            customers={customers.map((c) => ({ id: c.id, name: c.name }))}
          />
        }
      />
      <SectionSubNav items={VENTES_SECTION} />
      <ul className="divide-y divide-border rounded-card border border-border">
        {sales.map((s) => (
          <li key={s.id} className="p-4 text-body-sm">
            <div className="flex flex-wrap justify-between gap-2 font-medium">
              <span>{s.customerName ?? "Vente comptoir"} · {formatMoney(s.total, me.organization.currency)}</span>
              <span className="text-muted-foreground">{s.confirmedAt ? fmt(s.confirmedAt) : fmt(s.createdAt)}</span>
            </div>
            <p className="mt-1 text-muted-foreground">{s.lines.map((l) => `${l.quantity}× ${l.product.name}`).join(", ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
