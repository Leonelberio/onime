"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../db";
import { applyPayment } from "../billing/apply";
import { getCurrentUser } from "../auth/session";
import { parseFcfa } from "../money";
import { extendTrial } from "../subscription";
import { emptyToNull, fail, parseForm, success, type ActionState } from "./shared";

async function requireSA() {
  const me = await getCurrentUser();
  if (!me || me.role !== "SUPERADMIN") throw new Error("Non autorisé");
  return me;
}

const fcfa = z.string().transform((v, ctx) => {
  const n = parseFcfa(v);
  if (n === null || n > 100_000_000) {
    ctx.addIssue({ code: "custom", message: "Montant invalide (FCFA)" });
    return z.NEVER;
  }
  return n;
});

const planSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Nom requis").max(60),
  description: z.string().trim().max(200).optional(),
  priceMonthly: fcfa,
  active: z.string().optional(),
});

export async function savePlan(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireSA();
    const parsed = parseForm(planSchema, fd);
    if ("error" in parsed) return parsed.error;
    const d = parsed.data;
    const data = { name: d.name, description: emptyToNull(d.description), priceMonthly: d.priceMonthly, active: d.active === "on" || d.active === "true" };
    if (d.id) await db.plan.update({ where: { id: d.id }, data });
    else {
      const last = await db.plan.findFirst({ orderBy: { position: "desc" }, select: { position: true } });
      await db.plan.create({ data: { ...data, position: (last?.position ?? -1) + 1 } });
    }
    revalidatePath("/superadmin", "layout");
    return success(d.id ? "Plan mis à jour." : "Plan créé.");
  } catch (e) {
    console.error("[savePlan]", e);
    return fail("Action impossible.");
  }
}

export async function deletePlan(fd: FormData): Promise<void> {
  await requireSA();
  const id = String(fd.get("id"));
  const used = await db.organization.count({ where: { planId: id } });
  if (used === 0) await db.plan.delete({ where: { id } }).catch(() => undefined);
  else await db.plan.update({ where: { id }, data: { active: false } });
  revalidatePath("/superadmin", "layout");
}

export async function extendCompanyTrial(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireSA();
    const parsed = parseForm(
      z.object({ organizationId: z.string(), days: z.coerce.number().int().min(1, "1 jour minimum").max(365) }),
      fd,
    );
    if ("error" in parsed) return parsed.error;
    const r = await db.organization.findUnique({ where: { id: parsed.data.organizationId }, select: { trialEndsAt: true } });
    if (!r) return fail("Organisation introuvable.");
    await db.organization.update({
      where: { id: parsed.data.organizationId },
      data: { trialEndsAt: extendTrial(r.trialEndsAt, parsed.data.days) },
    });
    revalidatePath("/superadmin", "layout");
    return success(`Essai prolongé de ${parsed.data.days} jour(s).`);
  } catch (e) {
    console.error("[extendTrial]", e);
    return fail("Action impossible.");
  }
}

export async function setSuspended(fd: FormData): Promise<void> {
  await requireSA();
  await db.organization.update({
    where: { id: String(fd.get("organizationId")) },
    data: { suspended: fd.get("suspended") === "true" },
  });
  revalidatePath("/superadmin", "layout");
}

export async function recordPayment(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const me = await requireSA();
    const parsed = parseForm(
      z.object({
        organizationId: z.string(),
        planId: z.string().optional(),
        months: z.coerce.number().int().min(1, "1 mois minimum").max(36),
        amount: fcfa,
        reference: z.string().trim().max(80).optional(),
        note: z.string().trim().max(200).optional(),
      }),
      fd,
    );
    if ("error" in parsed) return parsed.error;
    const d = parsed.data;
    await db.$transaction((tx) =>
      applyPayment(tx, {
        organizationId: d.organizationId,
        planId: emptyToNull(d.planId),
        amount: d.amount,
        months: d.months,
        method: "MANUAL",
        reference: emptyToNull(d.reference),
        note: emptyToNull(d.note),
        recordedBy: me.user.email,
      }),
    );
    revalidatePath("/superadmin", "layout");
    return success("Paiement enregistré, abonnement prolongé.");
  } catch (e) {
    console.error("[recordPayment]", e);
    return fail("Impossible d'enregistrer le paiement.");
  }
}
