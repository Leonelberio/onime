"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../db";
import { emptyToNull, guarded, parseForm, requireWritable, success, type ActionState } from "./shared";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(80),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email("Email invalide").optional().or(z.literal("")),
  note: z.string().trim().max(200).optional(),
});

export async function createCustomer(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { boutique } = await requireWritable({ ownerOnly: true });
    const parsed = parseForm(contactSchema, fd);
    if ("error" in parsed) return parsed.error;
    const d = parsed.data;
    await db.customer.create({
      data: {
        boutiqueId: boutique.id,
        name: d.name,
        phone: emptyToNull(d.phone),
        email: emptyToNull(d.email),
        note: emptyToNull(d.note),
      },
    });
    revalidatePath("/dashboard/ventes/clients");
    revalidatePath("/dashboard/ventes");
    return success("Client ajouté.");
  });
}

export async function createSupplier(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { boutique } = await requireWritable({ ownerOnly: true });
    const parsed = parseForm(contactSchema, fd);
    if ("error" in parsed) return parsed.error;
    const d = parsed.data;
    await db.supplier.create({
      data: {
        boutiqueId: boutique.id,
        name: d.name,
        phone: emptyToNull(d.phone),
        email: emptyToNull(d.email),
        note: emptyToNull(d.note),
      },
    });
    revalidatePath("/dashboard/achats/fournisseurs");
    revalidatePath("/dashboard/achats");
    return success("Fournisseur ajouté.");
  });
}
