import { CompanyForm } from "@/components/app/company-form";
import { Alert, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/submit-button";
import { addBoutiqueAction } from "@/lib/actions/organization";
import { requireStaff } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { SUBSCRIPTION_ENABLED } from "@/lib/branding";

export const dynamic = "force-dynamic";

export default async function EntreprisePage() {
  const me = await requireStaff({ ownerOnly: true });
  const { organization, subscription: sub } = me;
  const readOnly = SUBSCRIPTION_ENABLED && !sub.canWrite;

  const boutiques = await db.boutique.findMany({
    where: { organizationId: organization.id },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader title="Organisation" description="Marque globale, devise et boutiques" />

      <CompanyForm
        r={{
          name: organization.name,
          description: organization.description,
          phone: null,
          address: null,
          brandColor: organization.brandColor,
          currency: organization.currency,
          logoUrlLight: organization.logoUrlLight,
          logoUrlDark: organization.logoUrlDark,
        }}
        readOnly={readOnly}
      />

      <section className="onime-card card-pad mt-8 space-y-4">
        <h2 className="font-display text-lg font-bold">Boutiques</h2>
        <ul className="divide-y divide-border text-body-sm">
          {boutiques.map((b) => (
            <li key={b.id} className="flex items-center justify-between py-2">
              <span className="font-medium">{b.name}</span>
              <span className="text-muted-foreground">{b.slug}</span>
            </li>
          ))}
        </ul>
        {!readOnly && (
          <form action={addBoutiqueAction} className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
            <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-body-sm">
              Nouvelle boutique
              <input name="name" required maxLength={80} className="onime-input" placeholder="Ex. Boutique Almadies" />
            </label>
            <SubmitButton pendingLabel="…">Ajouter</SubmitButton>
          </form>
        )}
        {readOnly && <Alert tone="caution">Mode lecture : impossible d&apos;ajouter une boutique.</Alert>}
      </section>
    </>
  );
}
