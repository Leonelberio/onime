import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";
import { Alert, LinkButton } from "@/components/ui";
import { acceptInvitation } from "@/lib/actions/auth";
import { db } from "@/lib/db";
import { staffRoleLabel } from "@/lib/staff-roles";

export const metadata: Metadata = { title: "Invitation équipe", robots: { index: false } };

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await db.invitation.findUnique({
    where: { token },
    include: { organization: { select: { name: true } }, boutique: { select: { name: true } } },
  });
  const valid = inv && !inv.usedAt && inv.expiresAt > new Date();
  const roleLabel = inv ? staffRoleLabel(inv.role) : "Employé";

  if (!valid)
    return (
      <AuthCard>
        <div className="space-y-4">
        <h1 className="text-center font-display text-2xl font-bold">Invitation invalide</h1>
        <Alert tone="caution">Ce lien est expiré ou a déjà été utilisé. Demandez un nouveau lien au Gérant.</Alert>
        <LinkButton href="/connexion" variant="secondary" className="w-full justify-center">Aller à la connexion</LinkButton>
        </div>
      </AuthCard>
    );

  return (
    <AuthCard>
      <h1 className="text-center font-display text-2xl font-bold tracking-tight">
        Rejoindre {inv.boutique?.name ?? inv.organization.name}
      </h1>
      <p className="mb-6 mt-1 text-center text-body-sm text-muted-foreground">
        Créez votre compte employé pour pointer vos entrées et sorties.
      </p>
      <AuthForm
        action={acceptInvitation}
        hidden={{ token }}
        submitLabel={`Créer mon compte ${roleLabel.toLowerCase()}`}
        pendingLabel="Création…"
        fields={[
          { name: "name", label: "Votre nom", autoComplete: "name", defaultValue: inv.label ?? "" },
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Mot de passe", type: "password", autoComplete: "new-password", hint: "8 caractères minimum." },
        ]}
      />
    </AuthCard>
  );
}
