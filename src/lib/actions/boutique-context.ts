"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { BOUTIQUE_CONTEXT_COOKIE, CONSOLIDATED_BOUTIQUE } from "../auth/boutique-context";
import { requireStaff } from "../auth/session";
import { fail, guarded, parseForm, type ActionState } from "./shared";

const schema = z.object({
  boutiqueId: z.string().min(1).max(64),
});

export async function setActiveBoutique(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const ctx = await requireStaff({ ownerOnly: true });
    const parsed = parseForm(schema, fd);
    if ("error" in parsed) return parsed.error;

    const value = parsed.data.boutiqueId;
    if (value !== CONSOLIDATED_BOUTIQUE) {
      const ok = ctx.boutiques.some((b) => b.id === value);
      if (!ok) return fail("Boutique invalide.");
    }

    const jar = await cookies();
    jar.set(BOUTIQUE_CONTEXT_COOKIE, value, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    revalidatePath("/", "layout");
    return { ok: true };
  });
}

export async function setActiveBoutiqueAndRedirect(formData: FormData) {
  await setActiveBoutique(undefined, formData);
  redirect("/dashboard");
}
