"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../db";
import { normalizeHex } from "../color";
import { isCompanyCurrency } from "../currencies";
import { isAllowedImageUrl } from "../storage/image-url";
import { emptyToNull, fail, guarded, parseForm, requireWritable, success, type ActionState } from "./shared";

const orgSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(80),
  description: z.string().trim().max(300).optional(),
  brandColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide (ex. #44D600)"),
  currency: z.string().trim().toUpperCase().refine(isCompanyCurrency, "Devise non supportée"),
  logoUrlLight: z.string().trim().max(500).optional(),
  logoUrlDark: z.string().trim().max(500).optional(),
});

export async function updateOrganization(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { organization } = await requireWritable({ ownerOnly: true });
    const parsed = parseForm(orgSchema, fd);
    if ("error" in parsed) return parsed.error;
    const d = parsed.data;
    const logoUrlLight = emptyToNull(d.logoUrlLight);
    const logoUrlDark = emptyToNull(d.logoUrlDark);
    if (logoUrlLight && !isAllowedImageUrl(logoUrlLight)) return fail("URL du logo (mode clair) invalide.");
    if (logoUrlDark && !isAllowedImageUrl(logoUrlDark)) return fail("URL du logo (mode sombre) invalide.");
    await db.organization.update({
      where: { id: organization.id },
      data: {
        name: d.name,
        description: emptyToNull(d.description),
        brandColor: normalizeHex(d.brandColor),
        currency: d.currency,
        logoUrlLight,
        logoUrlDark,
        logoUrl: logoUrlDark ?? logoUrlLight,
      },
    });
    revalidatePath("/", "layout");
    return success("Organisation mise à jour.");
  });
}

const boutiqueSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(80),
  description: z.string().trim().max(300).optional(),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(160).optional(),
});

export async function updateBoutiqueProfile(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { boutique } = await requireWritable({ ownerOnly: true });
    const parsed = parseForm(boutiqueSchema, fd);
    if ("error" in parsed) return parsed.error;
    const d = parsed.data;
    await db.boutique.update({
      where: { id: boutique.id },
      data: {
        name: d.name,
        description: emptyToNull(d.description),
        phone: emptyToNull(d.phone),
        address: emptyToNull(d.address),
      },
    });
    revalidatePath("/", "layout");
    return success("Boutique mise à jour.");
  });
}

const newBoutiqueSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(80),
});

export async function createBoutique(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { requireStaff } = await import("../auth/session");
    const { organization } = await requireStaff({ ownerOnly: true });
    const parsed = parseForm(newBoutiqueSchema, fd);
    if ("error" in parsed) return parsed.error;
    const slug = await (async () => {
      const { uniqueSlug } = await import("../slug");
      return uniqueSlug(parsed.data.name, async (s) =>
        !!(await db.boutique.findFirst({ where: { organizationId: organization.id, slug: s }, select: { id: true } })),
      );
    })();
    await db.boutique.create({
      data: {
        organizationId: organization.id,
        slug,
        name: parsed.data.name,
      },
    });
    revalidatePath("/dashboard/entreprise");
    return success("Boutique créée.");
  });
}

/** Formulaire HTML (action simple). */
export async function addBoutiqueAction(fd: FormData) {
  await createBoutique(undefined, fd);
}
