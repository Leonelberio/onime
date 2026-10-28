import { requireBoutiqueScope } from "@/lib/tenancy/require-boutique-scope";
import { PageHeader } from "@/components/ui";
import { PointageSettingsForm } from "@/components/app/pointage-settings-form";

export default async function PointageSettingsPage() {
  const { boutique } = await requireBoutiqueScope({ ownerOnly: true });

  return (
    <div>
      <PageHeader
        title="Réglages pointage"
        description={`${boutique.name} — lieu de travail, rayon GPS et heure d'arrivée.`}
      />
      <PointageSettingsForm
        r={{
          workplaceLatitude: boutique.workplaceLatitude,
          workplaceLongitude: boutique.workplaceLongitude,
          geofenceRadiusM: boutique.geofenceRadiusM,
          gpsMinAccuracyM: boutique.gpsMinAccuracyM,
          geofenceEnabled: boutique.geofenceEnabled,
          workDayStartTime: boutique.workDayStartTime,
        }}
      />
    </div>
  );
}
