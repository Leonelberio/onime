"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="contenu" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-bold">Un problème est survenu</h1>
      <p className="mb-6 mt-2 text-body-sm text-muted-foreground">Veuillez réessayer. Si cela persiste, contactez le support.</p>
      <button type="button" className="onime-btn onime-btn--primary" onClick={reset}>Réessayer</button>
    </main>
  );
}
