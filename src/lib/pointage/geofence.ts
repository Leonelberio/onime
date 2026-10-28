const EARTH_RADIUS_M = 6_371_000;

/** Distance en mètres entre deux points WGS84 (formule haversine). */
export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

export type GeofenceCheck =
  | { ok: true }
  | { ok: false; code: "NO_WORKPLACE" | "GPS_DISABLED" | "LOW_ACCURACY" | "OUTSIDE_GEOFENCE"; message: string };

export function checkGeofence(opts: {
  enabled: boolean;
  workplaceLat: number | null;
  workplaceLng: number | null;
  radiusM: number;
  minAccuracyM: number;
  lat: number;
  lng: number;
  accuracyM: number;
}): GeofenceCheck {
  if (!opts.enabled) return { ok: true };
  if (opts.workplaceLat == null || opts.workplaceLng == null) {
    return { ok: false, code: "NO_WORKPLACE", message: "Le lieu de travail n'est pas configuré. Contactez l'administrateur." };
  }
  if (!Number.isFinite(opts.accuracyM) || opts.accuracyM <= 0 || opts.accuracyM > opts.minAccuracyM) {
    return {
      ok: false,
      code: "LOW_ACCURACY",
      message: `Position trop imprécise (${Math.round(opts.accuracyM)} m). Rapprochez-vous d'une fenêtre ou réessayez.`,
    };
  }
  const d = distanceMeters(opts.lat, opts.lng, opts.workplaceLat, opts.workplaceLng);
  if (d > opts.radiusM) {
    return {
      ok: false,
      code: "OUTSIDE_GEOFENCE",
      message: `Vous êtes à ${Math.round(d)} m du lieu de travail (max ${opts.radiusM} m).`,
    };
  }
  return { ok: true };
}

/** Retard si check-in après l'heure HH:mm (même jour UTC simplifié — heure locale entreprise à affiner). */
export function isLate(checkIn: Date, workDayStartTime: string | null): boolean {
  if (!workDayStartTime) return false;
  const m = /^(\d{1,2}):(\d{2})$/.exec(workDayStartTime.trim());
  if (!m) return false;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return false;
  const start = new Date(checkIn);
  start.setHours(h, min, 0, 0);
  return checkIn.getTime() > start.getTime();
}
