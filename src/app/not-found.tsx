import { LinkButton } from "@/components/ui";
import { LogoMark } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main id="contenu" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <LogoMark size={56} />
      <h1 className="mt-4 font-display text-2xl font-bold">Page introuvable</h1>
      <p className="mb-6 mt-2 text-body-sm text-muted-foreground">Le lien est peut-être incorrect ou la page a été déplacée.</p>
      <LinkButton href="/">Retour à l&apos;accueil</LinkButton>
    </main>
  );
}
