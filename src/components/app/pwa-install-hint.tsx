"use client";

import { useEffect, useState } from "react";
import { CLIENT_NAME } from "@/lib/branding";

type InstallPromptEvent = Event & { prompt: () => Promise<void> };

/** Bouton « Installer » quand le navigateur propose l’ajout à l’écran d’accueil (Android / Chrome). */
export function PwaInstallHint() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!deferred || dismissed) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-40 rounded-card border border-primary/30 bg-card p-3 lg:bottom-6 lg:left-6 lg:right-auto lg:max-w-sm">
      <p className="text-body-sm">
        Installez {CLIENT_NAME} sur votre téléphone pour un accès rapide au pointage et à votre boutique.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className="onime-btn onime-btn--primary flex-1 !min-h-10"
          onClick={async () => {
            await deferred.prompt();
            setDeferred(null);
          }}
        >
          Installer
        </button>
        <button type="button" className="onime-btn onime-btn--secondary !min-h-10" onClick={() => setDismissed(true)}>
          Plus tard
        </button>
      </div>
    </div>
  );
}
