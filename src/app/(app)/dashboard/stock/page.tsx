import { requireBoutiqueScope } from "@/lib/tenancy/require-boutique-scope";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { PageHeader } from "@/components/ui";
import { StockToolbar } from "@/components/app/stock-toolbar";
import { toScannableProduct } from "@/components/app/inventory-forms";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const me = await requireBoutiqueScope({ ownerOnly: true });
  const products = await db.product.findMany({
    where: { boutiqueId: me.boutique.id },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  const scannable = products.map(toScannableProduct);

  return (
    <div>
      <PageHeader
        title="Stock"
        description="Produits, scan code-barres et niveaux de stock."
        actions={<StockToolbar products={scannable} currency={me.organization.currency} />}
      />
      <div className="overflow-x-auto rounded-card border border-border">
        <table className="w-full min-w-[640px] text-left text-body-sm">
          <thead className="table-head border-b border-border">
            <tr>
              <th className="p-3">Produit</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Code-barres</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Prix</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="row-hover border-b border-border last:border-0">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.sku ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{p.barcode ?? "—"}</td>
                <td className="p-3">{p.stockQty}{p.stockQty <= p.minStock ? " ⚠" : ""}</td>
                <td className="p-3">{formatMoney(p.unitPrice, me.organization.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
