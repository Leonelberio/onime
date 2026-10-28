"use client";

import { useActionState, useEffect, useState } from "react";
import clsx from "clsx";
import { Alert } from "@/components/ui";
import { clockIn, clockOut } from "@/lib/actions/timeclock";
import { DEVICE_ID_STORAGE_KEY } from "@/lib/pointage/device-constants";

function ensureDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
  }
  return id;
}

function readPosition(): Promise<{ latitude: number; longitude: number; accuracyM: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La géolocalisation n'est pas disponible sur cet appareil."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyM: pos.coords.accuracy,
        }),
      (err) => reject(new Error(err.message || "Impossible d'obtenir la position.")),
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 },
    );
  });
}

export function PointageEmployee({ hasOpen }: { hasOpen: boolean }) {
  const [inState, inAction] = useActionState(clockIn, undefined);
  const [outState, outAction] = useActionState(clockOut, undefined);
  const [busy, setBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const state = inState ?? outState;

  useEffect(() => {
    ensureDeviceId();
  }, []);

  async function handleClock(action: (fd: FormData) => void) {
    setGeoError(null);
    setBusy(true);
    try {
      const pos = await readPosition();
      const fd = new FormData();
      fd.set("clientDeviceId", ensureDeviceId());
      fd.set("latitude", String(pos.latitude));
      fd.set("longitude", String(pos.longitude));
      fd.set("accuracyM", String(pos.accuracyM));
      fd.set("userAgent", navigator.userAgent.slice(0, 200));
      action(fd);
    } catch (e) {
      setGeoError(e instanceof Error ? e.message : "Erreur GPS.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-8 max-w-md">
      <Alert tone="info" className="mb-4" title="Données collectées">
        Chaque pointage enregistre l&apos;heure serveur, votre position GPS (avec votre accord) et l&apos;adresse IP
        observée par le serveur, dans le cadre du contrôle des présences.
      </Alert>
      {geoError && <Alert tone="error" className="mb-3">{geoError}</Alert>}
      {state?.message && <Alert tone="success" className="mb-3">{state.message}</Alert>}
      {state?.error && <Alert tone="error" className="mb-3">{state.error}</Alert>}
      {!hasOpen ? (
        <button
          type="button"
          disabled={busy}
          aria-busy={busy}
          className={clsx("onime-btn onime-btn--primary !flex w-full !min-h-12 !justify-center")}
          onClick={() => void handleClock(inAction)}
        >
          {busy ? "Localisation…" : "Pointer mon arrivée"}
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          aria-busy={busy}
          className={clsx("onime-btn onime-btn--secondary !flex w-full !min-h-12 !justify-center")}
          onClick={() => void handleClock(outAction)}
        >
          {busy ? "Localisation…" : "Pointer mon départ"}
        </button>
      )}
    </div>
  );
}
