"use client";

import { useActionState } from "react";
import { Alert, Field } from "@/components/ui";
import { SubmitButton } from "@/components/ui/submit-button";
import { updatePointageSettings } from "@/lib/actions/timeclock";

export function PointageSettingsForm({
  r,
}: {
  r: {
    workplaceLatitude: number | null;
    workplaceLongitude: number | null;
    geofenceRadiusM: number;
    gpsMinAccuracyM: number;
    geofenceEnabled: boolean;
    workDayStartTime: string | null;
  };
}) {
  const [state, action] = useActionState(updatePointageSettings, undefined);

  return (
    <form action={action} className="onime-card card-pad max-w-xl space-y-4">
      {state?.message && <Alert tone="success">{state.message}</Alert>}
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Contrôle GPS" name="geofenceEnabled">
        <select name="geofenceEnabled" defaultValue={r.geofenceEnabled ? "true" : "false"} className="onime-select">
          <option value="true">Activé</option>
          <option value="false">Désactivé</option>
        </select>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Latitude lieu de travail" name="workplaceLatitude">
          <input
            name="workplaceLatitude"
            type="number"
            step="any"
            defaultValue={r.workplaceLatitude ?? ""}
            className="onime-input"
            placeholder="14.6928"
          />
        </Field>
        <Field label="Longitude" name="workplaceLongitude">
          <input
            name="workplaceLongitude"
            type="number"
            step="any"
            defaultValue={r.workplaceLongitude ?? ""}
            className="onime-input"
            placeholder="-17.4467"
          />
        </Field>
      </div>
      <Field label="Rayon autorisé (mètres)" name="geofenceRadiusM">
        <input name="geofenceRadiusM" type="number" defaultValue={r.geofenceRadiusM} className="onime-input" />
      </Field>
      <Field label="Précision GPS max. acceptée (mètres)" name="gpsMinAccuracyM">
        <input name="gpsMinAccuracyM" type="number" defaultValue={r.gpsMinAccuracyM} className="onime-input" />
      </Field>
      <Field label="Heure d'arrivée attendue (HH:mm)" name="workDayStartTime">
        <input name="workDayStartTime" defaultValue={r.workDayStartTime ?? "08:00"} className="onime-input" placeholder="08:00" />
      </Field>
      <p className="text-body-sm text-muted-foreground">
        Astuce : ouvrez Google Maps sur le lieu, clic droit sur le point → copier les coordonnées.
      </p>
      <SubmitButton>Enregistrer</SubmitButton>
    </form>
  );
}
