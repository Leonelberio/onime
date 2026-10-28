import type { Metadata } from "next";
import { EmployeeAccountModal } from "@/components/app/employee-account-modal";
import { InviteFormModal } from "@/components/app/invite-form-modal";
import { StaffRoster } from "@/components/app/staff-roster";
import { PageHeader } from "@/components/ui";
import { requireBoutiqueScope } from "@/lib/tenancy/require-boutique-scope";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Équipe" };
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { boutique } = await requireBoutiqueScope({ ownerOnly: true });
  const employees = await db.user.findMany({
    where: { boutiqueId: boutique.id, role: "EMPLOYEE" },
    orderBy: { createdAt: "asc" },
  });
  const devices = await db.employeeDevice.findMany({
    where: { userId: { in: employees.map((e) => e.id) } },
    orderBy: { registeredAt: "desc" },
  });
  const devicesByUserId: Record<string, typeof devices> = {};
  for (const d of devices) {
    (devicesByUserId[d.userId] ??= []).push(d);
  }
  const ro = false;

  return (
    <>
      <PageHeader
        title="Équipe"
        description={`Employés de ${boutique.name} — un appareil mobile autorisé par personne.`}
        actions={
          <>
            <EmployeeAccountModal />
            <InviteFormModal
              readOnly={ro}
              inviteRole="EMPLOYEE"
              fieldLabel="Nom de l'employé (optionnel)"
              labelPlaceholder="Ex. Kossi"
            />
          </>
        }
      />
      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-bold">Employés ({employees.length})</h2>
        <StaffRoster
          members={employees}
          role="EMPLOYEE"
          readOnly={ro}
          emptyTitle="Aucun employé"
          emptyHint="Créez un compte ou une invitation."
          devicesByUserId={devicesByUserId}
        />
      </section>
    </>
  );
}
