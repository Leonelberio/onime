"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../db";
import { appUrl } from "../env";
import { isStaffInviteRole, staffRoleLabel } from "../staff-roles";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashPassword } from "../auth/password";
import { fail, guarded, parseForm, ReadOnlyError, requireWritable, success, type ActionState } from "./shared";

const INVITE_DAYS = 7;

const createEmployeeSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(80),
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(8, "Mot de passe : 8 caractères minimum"),
});

export async function createEmployeeAccount(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { boutique, organization } = await requireWritable({ ownerOnly: true });
    const parsed = parseForm(createEmployeeSchema, fd);
    if ("error" in parsed) return parsed.error;
    const count = await db.user.count({ where: { boutiqueId: boutique.id, role: "EMPLOYEE" } });
    if (count >= 20) return fail("Maximum 20 employés pour cette boutique.");
    const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) return fail("Cet email est déjà utilisé.");
    await db.user.create({
      data: {
        organizationId: organization.id,
        boutiqueId: boutique.id,
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hashPassword(parsed.data.password),
        role: "EMPLOYEE",
      },
    });
    revalidatePath("/dashboard/equipe");
    return success("Compte employé créé.");
  });
}

export async function createEmployeeInvitation(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { boutique, organization } = await requireWritable({ ownerOnly: true });
    const parsed = parseForm(z.object({ label: z.string().trim().max(60).optional() }), fd);
    if ("error" in parsed) return parsed.error;
    const open = await db.invitation.count({ where: { boutiqueId: boutique.id, usedAt: null, expiresAt: { gt: new Date() } } });
    if (open >= 20) return fail("Trop d'invitations en attente. Révoquez-en avant d'en créer.");
    const token = randomBytes(24).toString("base64url");
    await db.invitation.create({
      data: {
        organizationId: organization.id,
        boutiqueId: boutique.id,
        token,
        label: parsed.data.label || null,
        role: "EMPLOYEE",
        expiresAt: new Date(Date.now() + INVITE_DAYS * 86_400_000),
      },
    });
    revalidatePath("/dashboard/equipe");
    return success(`Invitation créée. Copiez le lien et envoyez-le à l'employé.`, { link: `${appUrl()}/invitation/${token}` });
  });
}

async function staffFormAction(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e) {
    if (isRedirectError(e)) throw e;
    if (e instanceof ReadOnlyError) throw new Error(e.message);
    throw e;
  }
}

export async function revokeInvitation(fd: FormData): Promise<void> {
  await staffFormAction(async () => {
    const { boutique } = await requireWritable({ ownerOnly: true });
    await db.invitation.deleteMany({ where: { id: String(fd.get("id")), boutiqueId: boutique.id } });
    revalidatePath("/dashboard/equipe");
  });
}

export async function disableStaff(fd: FormData): Promise<void> {
  await staffFormAction(async () => {
    const { boutique, user: me } = await requireWritable({ ownerOnly: true });
    const id = String(fd.get("id"));
    if (id === me.id) throw new Error("Vous ne pouvez pas vous désactiver vous-même.");
    await db.user.updateMany({ where: { id, boutiqueId: boutique.id, role: "EMPLOYEE" }, data: { disabled: true } });
    revalidatePath("/dashboard/equipe");
  });
}

export async function setStaffDisabled(fd: FormData): Promise<void> {
  await staffFormAction(async () => {
    const { boutique } = await requireWritable({ ownerOnly: true });
    const role = String(fd.get("role"));
    if (!isStaffInviteRole(role)) return;
    await db.user.updateMany({
      where: { id: String(fd.get("id")), boutiqueId: boutique.id, role },
      data: { disabled: fd.get("disabled") === "true" },
    });
    revalidatePath("/dashboard/equipe");
  });
}

export async function removeStaff(fd: FormData): Promise<void> {
  await staffFormAction(async () => {
    const { boutique } = await requireWritable({ ownerOnly: true });
    const role = String(fd.get("role"));
    if (!isStaffInviteRole(role)) return;
    await db.user.deleteMany({ where: { id: String(fd.get("id")), boutiqueId: boutique.id, role } });
    revalidatePath("/dashboard/equipe");
  });
}

void staffRoleLabel;
