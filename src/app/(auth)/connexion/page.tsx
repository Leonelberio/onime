import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser, homeFor } from "@/lib/auth/session";
import { signIn } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage() {
  const me = await getCurrentUser();
  if (me) redirect(homeFor(me.role));
  return (
    <AuthCard>
      <h1 className="text-center font-display text-2xl font-bold tracking-tight">Connexion</h1>
      <p className="mb-6 mt-1 text-center text-body-sm text-muted-foreground">Gérant, employé ou administrateur.</p>
      <AuthForm
        action={signIn}
        submitLabel="Se connecter"
        pendingLabel="Connexion…"
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Mot de passe", type: "password", autoComplete: "current-password" },
        ]}
      />
      <p className="mt-6 text-center text-body-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-primary-text underline-offset-2 hover:underline">
          Créer votre espace vendeur
        </Link>
      </p>
    </AuthCard>
  );
}
