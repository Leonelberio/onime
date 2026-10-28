import { requireBoutiqueScope } from "@/lib/tenancy/require-boutique-scope";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { SectionSubNav } from "@/components/app/section-subnav";
import { SupplierFormModal } from "@/components/app/contacts-forms";
import { ACHATS_SECTION } from "@/lib/commerce-sections";

export const dynamic = "force-dynamic";

export default async function FournisseursPage() {
  const me = await requireBoutiqueScope({ ownerOnly: true });
  const suppliers = await db.supplier.findMany({
    where: { boutiqueId: me.boutique.id },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Fournisseurs"
        description="Partenaires et réapprovisionnement."
        actions={<SupplierFormModal />}
      />
      <SectionSubNav items={ACHATS_SECTION} />
      <div className="overflow-x-auto rounded-card border border-border">
        <table className="w-full min-w-[480px] text-left text-body-sm">
          <thead className="table-head border-b border-border">
            <tr>
              <th className="p-3">Nom</th>
              <th className="p-3">Téléphone</th>
              <th className="p-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-muted-foreground">
                  Aucun fournisseur. Ajoutez-en un avec « Nouveau fournisseur ».
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="row-hover border-b border-border last:border-0">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 text-muted-foreground">{s.phone ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{s.email ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
