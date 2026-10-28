"use client";

import { Alert } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="space-y-4">
      <Alert tone="error" title="Une erreur est survenue">
        {error.digest ? `Référence : ${error.digest}. ` : ""}Réessayez ; si le problème persiste, contactez le support.
      </Alert>
      <button type="button" className="onime-btn onime-btn--secondary" onClick={reset}>Réessayer</button>
    </div>
  );
}
