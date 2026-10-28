import { Logo } from "@/components/ui/logo";

/** Carte auth : logo centré au-dessus du titre et du formulaire. */
export function AuthCard({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`onime-card card-pad ${wide ? "max-w-lg w-full" : ""}`}>
      <div className="mb-6 flex justify-center border-b border-border pb-6 pt-2">
        <Logo href="/connexion" />
      </div>
      {children}
    </div>
  );
}
