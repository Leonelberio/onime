import { describe, expect, it } from "vitest";
import { checkGeofence, distanceMeters, isLate } from "./geofence";

describe("distanceMeters", () => {
  it("returns ~0 for identical points", () => {
    expect(distanceMeters(14.69, -17.44, 14.69, -17.44)).toBeLessThan(1);
  });
});

describe("checkGeofence", () => {
  const workplace = { workplaceLat: 14.6928, workplaceLng: -17.4467, radiusM: 100, minAccuracyM: 150, enabled: true };

  it("accepts position within radius", () => {
    const r = checkGeofence({
      ...workplace,
      lat: 14.6929,
      lng: -17.4468,
      accuracyM: 30,
    });
    expect(r.ok).toBe(true);
  });

  it("rejects low accuracy", () => {
    const r = checkGeofence({ ...workplace, lat: 14.6928, lng: -17.4467, accuracyM: 500 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("LOW_ACCURACY");
  });

  it("rejects outside geofence", () => {
    const r = checkGeofence({ ...workplace, lat: 14.71, lng: -17.4467, accuracyM: 20 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("OUTSIDE_GEOFENCE");
  });
});

describe("isLate", () => {
  it("detects check-in after start time", () => {
    const d = new Date("2026-10-24T09:30:00");
    expect(isLate(d, "08:00")).toBe(true);
  });
});
