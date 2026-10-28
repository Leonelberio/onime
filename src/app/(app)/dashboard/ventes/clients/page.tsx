import { requireBoutiqueScope } from "@/lib/tenancy/require-boutique-scope";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { SectionSubNav } from "@/components/app/section-subnav";
import { CustomerFormModal } from "@/components/app/contacts-forms";
import { VENTES_SECTION } from "@/lib/commerce-sections";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const me = await requireBoutiqueScope({ ownerOnly: true });
  const customers = await db.customer.findMany({
    where: { boutiqueId: me.boutique.id },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Clients" description="Clients de la clinique pour les ventes." actions={<CustomerFormModal />} />
      <SectionSubNav items={VENTES_SECTION} />
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
            {customers.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-muted-foreground">
                  Aucun client. Ajoutez-en un avec « Nouveau client ».
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="row-hover border-b border-border last:border-0">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-muted-foreground">{c.phone ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{c.email ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
