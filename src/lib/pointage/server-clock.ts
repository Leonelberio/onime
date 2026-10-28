import type { Boutique, User } from "@prisma/client";
import { db } from "../db";
import { hashDeviceKey } from "./device";
import { checkGeofence } from "./geofence";

export type ClockKind = "CLOCK_IN" | "CLOCK_OUT";

export type ClockPayload = {
  clientDeviceId: string;
  latitude: number;
  longitude: number;
  accuracyM: number;
  userAgent?: string;
};

async function logAttempt(
  boutiqueId: string,
  userId: string | null,
  kind: ClockKind,
  accepted: boolean,
  reason: string,
  ip: string | null,
  payload: Partial<ClockPayload> & { deviceKey?: string },
) {
  await db.pointageAttempt.create({
    data: {
      boutiqueId,
      userId,
      kind,
      accepted,
      reason,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracyM: payload.accuracyM,
      ip,
      deviceKey: payload.deviceKey,
    },
  });
}

async function ensureDevice(user: User, clientDeviceId: string, userAgent?: string) {
  const deviceKey = hashDeviceKey(user.id, clientDeviceId);
  const active = await db.employeeDevice.findMany({
    where: { userId: user.id, revokedAt: null },
  });

  const match = active.find((d) => d.deviceKey === deviceKey);
  if (match) {
    await db.employeeDevice.update({ where: { id: match.id }, data: { lastUsedAt: new Date(), userAgent } });
    return { ok: true as const, deviceKey };
  }

  if (active.length >= 1) {
    return { ok: false as const, code: "UNKNOWN_DEVICE", message: "Appareil non autorisé. Demandez à l'administrateur de révoquer l'ancien appareil." };
  }

  await db.employeeDevice.create({
    data: { userId: user.id, deviceKey, userAgent, lastUsedAt: new Date() },
  });
  return { ok: true as const, deviceKey };
}

function parseGps(fd: FormData) {
  const latitude = Number(fd.get("latitude"));
  const longitude = Number(fd.get("longitude"));
  const accuracyM = Number(fd.get("accuracyM"));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(accuracyM)) {
    return { ok: false as const, message: "Position GPS requise pour pointer." };
  }
  return { ok: true as const, latitude, longitude, accuracyM };
}

export async function employeeClockIn(user: User, Boutique: Boutique, fd: FormData, ip: string | null) {
  if (user.role !== "EMPLOYEE" || user.disabled) {
    return { ok: false as const, message: "Compte non autorisé." };
  }

  const clientDeviceId = String(fd.get("clientDeviceId") ?? "").trim();
  if (clientDeviceId.length < 8) {
    return { ok: false as const, message: "Identifiant appareil invalide." };
  }

  const gps = parseGps(fd);
  if (!gps.ok) {
    await logAttempt(Boutique.id, user.id, "CLOCK_IN", false, "GPS_MISSING", ip, {});
    return { ok: false as const, message: gps.message };
  }

  const device = await ensureDevice(user, clientDeviceId, String(fd.get("userAgent") ?? ""));
  if (!device.ok) {
    await logAttempt(Boutique.id, user.id, "CLOCK_IN", false, device.code, ip, {
      ...gps,
      deviceKey: hashDeviceKey(user.id, clientDeviceId),
    });
    return { ok: false as const, message: device.message };
  }

  const revoked = await db.employeeDevice.findFirst({
    where: { userId: user.id, deviceKey: device.deviceKey, revokedAt: { not: null } },
  });
  if (revoked) {
    await logAttempt(Boutique.id, user.id, "CLOCK_IN", false, "DEVICE_REVOKED", ip, { ...gps, deviceKey: device.deviceKey });
    return { ok: false as const, message: "Cet appareil a été révoqué." };
  }

  const geo = checkGeofence({
    enabled: Boutique.geofenceEnabled,
    workplaceLat: Boutique.workplaceLatitude,
    workplaceLng: Boutique.workplaceLongitude,
    radiusM: Boutique.geofenceRadiusM,
    minAccuracyM: Boutique.gpsMinAccuracyM,
    lat: gps.latitude,
    lng: gps.longitude,
    accuracyM: gps.accuracyM,
  });
  if (!geo.ok) {
    await logAttempt(Boutique.id, user.id, "CLOCK_IN", false, geo.code, ip, { ...gps, deviceKey: device.deviceKey });
    return { ok: false as const, message: geo.message };
  }

  const now = new Date();
  try {
    await db.$transaction(async (tx) => {
      const open = await tx.timeEntry.findFirst({
        where: { userId: user.id, boutiqueId: Boutique.id, checkOutAt: null },
      });
      if (open) throw new Error("OPEN_SESSION");

      await tx.timeEntry.create({
        data: {
          boutiqueId: Boutique.id,
          userId: user.id,
          checkInAt: now,
          checkInLat: gps.latitude,
          checkInLng: gps.longitude,
          checkInAccuracyM: gps.accuracyM,
          checkInIp: ip,
        },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "OPEN_SESSION") {
      await logAttempt(Boutique.id, user.id, "CLOCK_IN", false, "DOUBLE_CHECK_IN", ip, { ...gps, deviceKey: device.deviceKey });
      return { ok: false as const, message: "Vous avez déjà un pointage en cours." };
    }
    throw e;
  }

  await logAttempt(Boutique.id, user.id, "CLOCK_IN", true, "OK", ip, { ...gps, deviceKey: device.deviceKey });
  return { ok: true as const, message: "Arrivée enregistrée." };
}

export async function employeeClockOut(user: User, Boutique: Boutique, fd: FormData, ip: string | null) {
  if (user.role !== "EMPLOYEE" || user.disabled) {
    return { ok: false as const, message: "Compte non autorisé." };
  }

  const clientDeviceId = String(fd.get("clientDeviceId") ?? "").trim();
  if (clientDeviceId.length < 8) {
    return { ok: false as const, message: "Identifiant appareil invalide." };
  }

  const gps = parseGps(fd);
  if (!gps.ok) {
    await logAttempt(Boutique.id, user.id, "CLOCK_OUT", false, "GPS_MISSING", ip, {});
    return { ok: false as const, message: gps.message };
  }

  const deviceKey = hashDeviceKey(user.id, clientDeviceId);
  const allowed = await db.employeeDevice.findFirst({
    where: { userId: user.id, deviceKey, revokedAt: null },
  });
  if (!allowed) {
    await logAttempt(Boutique.id, user.id, "CLOCK_OUT", false, "UNKNOWN_DEVICE", ip, { ...gps, deviceKey });
    return { ok: false as const, message: "Appareil non autorisé." };
  }

  const geo = checkGeofence({
    enabled: Boutique.geofenceEnabled,
    workplaceLat: Boutique.workplaceLatitude,
    workplaceLng: Boutique.workplaceLongitude,
    radiusM: Boutique.geofenceRadiusM,
    minAccuracyM: Boutique.gpsMinAccuracyM,
    lat: gps.latitude,
    lng: gps.longitude,
    accuracyM: gps.accuracyM,
  });
  if (!geo.ok) {
    await logAttempt(Boutique.id, user.id, "CLOCK_OUT", false, geo.code, ip, { ...gps, deviceKey });
    return { ok: false as const, message: geo.message };
  }

  const now = new Date();
  try {
    await db.$transaction(async (tx) => {
      const open = await tx.timeEntry.findFirst({
        where: { userId: user.id, boutiqueId: Boutique.id, checkOutAt: null },
        orderBy: { checkInAt: "desc" },
      });
      if (!open) throw new Error("NO_OPEN_SESSION");

      await tx.timeEntry.update({
        where: { id: open.id },
        data: {
          checkOutAt: now,
          checkOutLat: gps.latitude,
          checkOutLng: gps.longitude,
          checkOutAccuracyM: gps.accuracyM,
          checkOutIp: ip,
        },
      });
      await tx.employeeDevice.update({ where: { id: allowed.id }, data: { lastUsedAt: now } });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "NO_OPEN_SESSION") {
      await logAttempt(Boutique.id, user.id, "CLOCK_OUT", false, "NO_OPEN_SESSION", ip, { ...gps, deviceKey });
      return { ok: false as const, message: "Aucune arrivée en cours. Pointez d'abord votre arrivée." };
    }
    throw e;
  }

  await logAttempt(Boutique.id, user.id, "CLOCK_OUT", true, "OK", ip, { ...gps, deviceKey });
  return { ok: true as const, message: "Départ enregistrée." };
}
