"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../db";
import { getRequestIp } from "../pointage/request-ip";
import { employeeClockIn, employeeClockOut } from "../pointage/server-clock";
import { fail, guarded, parseForm, requireWritable, success, type ActionState } from "./shared";
import { requireStaff } from "../auth/session";

function revalidatePointage() {
  revalidatePath("/dashboard/pointage");
  revalidatePath("/pointage");
  revalidatePath("/dashboard/equipe");
}

export async function clockIn(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const me = await requireStaff();
    if (me.role !== "EMPLOYEE" || !me.boutique) return fail("Réservé aux comptes employés.");
    const ip = await getRequestIp();
    const result = await employeeClockIn(me.user, me.boutique, fd, ip);
    if (!result.ok) return fail(result.message);
    revalidatePointage();
    return success(result.message);
  });
}

export async function clockOut(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const me = await requireStaff();
    if (me.role !== "EMPLOYEE" || !me.boutique) return fail("Réservé aux comptes employés.");
    const ip = await getRequestIp();
    const result = await employeeClockOut(me.user, me.boutique, fd, ip);
    if (!result.ok) return fail(result.message);
    revalidatePointage();
    return success(result.message);
  });
}

const correctSchema = z.object({
  entryId: z.string().min(1),
  reason: z.string().trim().min(5, "Motif requis (5 caractères min.)").max(300),
  checkOutAt: z.string().optional(),
});

export async function adminCorrectEntry(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const ctx = await requireWritable({ ownerOnly: true });
    const parsed = parseForm(correctSchema, fd);
    if ("error" in parsed) return parsed.error;
    const { entryId, reason, checkOutAt } = parsed.data;
    const entry = await db.timeEntry.findFirst({ where: { id: entryId, boutiqueId: ctx.boutique.id } });
    if (!entry) return fail("Pointage introuvable.");

    const ip = await getRequestIp();
    const now = new Date();
    const out = checkOutAt ? new Date(checkOutAt) : now;
    if (Number.isNaN(out.getTime())) return fail("Date de sortie invalide.");

    await db.$transaction([
      db.timeEntry.update({
        where: { id: entry.id },
        data: {
          checkOutAt: entry.checkOutAt ?? out,
          correctedAt: now,
          correctionReason: reason,
        },
      }),
      db.pointageAuditLog.create({
        data: {
          boutiqueId: ctx.boutique.id,
          actorId: ctx.user.id,
          targetUserId: entry.userId,
          entryId: entry.id,
          action: "MANUAL_CLOSE",
          reason,
          ip,
          details: JSON.stringify({ previousCheckOut: entry.checkOutAt }),
        },
      }),
    ]);

    revalidatePointage();
    return success("Pointage corrigé.");
  });
}

export async function revokeEmployeeDevice(fd: FormData): Promise<void> {
  const ctx = await requireWritable({ ownerOnly: true });
  const deviceId = String(fd.get("deviceId") ?? "");
  const device = await db.employeeDevice.findFirst({
    where: { id: deviceId, user: { boutiqueId: ctx.boutique.id } },
  });
  if (!device) return;

  const ip = await getRequestIp();
  await db.$transaction([
    db.employeeDevice.update({ where: { id: device.id }, data: { revokedAt: new Date() } }),
    db.pointageAuditLog.create({
      data: {
        boutiqueId: ctx.boutique.id,
        actorId: ctx.user.id,
        targetUserId: device.userId,
        action: "DEVICE_REVOKED",
        reason: "Révocation admin",
        ip,
        details: JSON.stringify({ deviceId: device.id }),
      },
    }),
  ]);
  revalidatePointage();
}

export async function updatePointageSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { boutique } = await requireWritable({ ownerOnly: true });
    const latRaw = String(fd.get("workplaceLatitude") ?? "").trim();
    const lngRaw = String(fd.get("workplaceLongitude") ?? "").trim();
    const workplaceLatitude = latRaw ? Number(latRaw) : null;
    const workplaceLongitude = lngRaw ? Number(lngRaw) : null;
    if (latRaw && !Number.isFinite(workplaceLatitude!)) return fail("Latitude invalide.");
    if (lngRaw && !Number.isFinite(workplaceLongitude!)) return fail("Longitude invalide.");

    const geofenceRadiusM = Number(fd.get("geofenceRadiusM"));
    const gpsMinAccuracyM = Number(fd.get("gpsMinAccuracyM"));
    if (!Number.isFinite(geofenceRadiusM) || geofenceRadiusM < 20 || geofenceRadiusM > 5000) {
      return fail("Rayon invalide (20–5000 m).");
    }
    if (!Number.isFinite(gpsMinAccuracyM) || gpsMinAccuracyM < 10 || gpsMinAccuracyM > 2000) {
      return fail("Précision GPS invalide.");
    }

    const geofenceEnabled = fd.get("geofenceEnabled") === "true";
    const workDayStartTime = String(fd.get("workDayStartTime") ?? "").trim() || null;

    await db.boutique.update({
      where: { id: boutique.id },
      data: {
        workplaceLatitude,
        workplaceLongitude,
        geofenceRadiusM,
        gpsMinAccuracyM,
        geofenceEnabled,
        workDayStartTime,
      },
    });
    revalidatePath("/dashboard/pointage/reglages");
    revalidatePath("/dashboard/pointage");
    return success("Paramètres de pointage enregistrés.");
  });
}
