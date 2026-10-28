"use client";

import { useEffect, useState } from "react";

/** Enregistre le SW en prod et recharge une fois quand une nouvelle version est prête. */
export function PwaLifecycle() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    void navigator.serviceWorker.register("/sw.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateReady(true);
          }
        });
      });
    });

    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);

  if (!updateReady) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-40 rounded-card border border-border bg-card p-3 shadow-lg lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-sm">
      <p className="text-body-sm font-medium">Mise à jour disponible</p>
      <button
        type="button"
        className="onime-btn onime-btn--primary mt-2 w-full !min-h-10"
        onClick={() => window.location.reload()}
      >
        Recharger l&apos;application
      </button>
    </div>
  );
}
