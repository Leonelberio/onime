import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { OnboardingWizard } from "@/components/auth/onboarding-wizard";
import { getCurrentUser, homeFor } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Créer votre espace ONIME" };

export default async function SignUpPage() {
  const me = await getCurrentUser();
  if (me) redirect(homeFor(me.role));
  return (
    <AuthCard wide>
      <h1 className="font-display text-2xl font-bold">Créer votre espace</h1>
      <p className="mt-1 text-body-sm text-muted-foreground">Organisation, première boutique, puis votre compte propriétaire.</p>
      <div className="mt-6">
        <OnboardingWizard />
      </div>
      <p className="mt-6 text-center text-body-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-primary-text underline-offset-2 hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthCard>
  );
}
