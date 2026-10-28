import type { ReactNode } from "react";

type AuthCardProps = {
  /** Logo ou marque centré au-dessus du formulaire */
  brand: ReactNode;
  children: ReactNode;
};

/** Carte auth Onime : logo + contenu (connexion, inscription). */
export function AuthCard({ brand, children }: AuthCardProps) {
  return (
    <div className="onime-card p-4 sm:p-6">
      <div className="mb-6 flex justify-center border-b border-border pb-6">{brand}</div>
      {children}
    </div>
  );
}
