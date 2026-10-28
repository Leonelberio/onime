"use server";

import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { db } from "../db";
import { isSuperadminEmail } from "../env";
import { BOUTIQUE_CONTEXT_COOKIE } from "../auth/boutique-context";
import { hashPassword, verifyPassword } from "../auth/password";
import { rateLimit } from "../auth/rate-limit";
import { endSession, homeFor, startSession } from "../auth/session";
import { isCompanyCurrency } from "../currencies";
import { slugify, uniqueSlug } from "../slug";
import { trialEndFrom } from "../subscription";
import { emptyToNull, fail, guarded, parseForm, type ActionState } from "./shared";

async function clientKey() {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "local").split(",")[0].trim();
}

const email = z.string().trim().toLowerCase().email("Email invalide").max(160);
const password = z.string().min(8, "8 caractères minimum").max(128);

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Votre nom est requis").max(80),
  email,
  password,
  organizationName: z.string().trim().min(2, "Nom de l'organisation requis").max(80),
  currency: z.string().trim().toUpperCase().refine(isCompanyCurrency, "Devise non supportée"),
  boutiqueName: z.string().trim().min(2, "Nom de la boutique requis").max(80),
  boutiqueAddress: z.string().trim().max(160).optional(),
  boutiquePhone: z.string().trim().max(40).optional(),
});

export async function signUp(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    if (!rateLimit(`signup:${await clientKey()}`, 10, 60 * 60 * 1000)) return fail("Trop de tentatives. Réessayez plus tard.");
    const parsed = parseForm(signUpSchema, fd);
    if ("error" in parsed) return parsed.error;
    const d = parsed.data;

    if (isSuperadminEmail(d.email)) return fail("Cet email est réservé à l'administration.", { email: "Email non disponible" });
    if (await db.user.findUnique({ where: { email: d.email } })) return fail("Un compte existe déjà avec cet email.", { email: "Email déjà utilisé" });

    const orgSlug = await uniqueSlug(d.organizationName, async (s) =>
      !!(await db.organization.findUnique({ where: { slug: s }, select: { id: true } })),
    );
    const boutiqueSlug = slugify(d.boutiqueName) || "boutique";
    const now = new Date();
    const passwordHash = await hashPassword(d.password);

    const org = await db.organization.create({
      data: {
        slug: orgSlug,
        name: d.organizationName,
        currency: d.currency,
        trialEndsAt: trialEndFrom(now),
        staff: {
          create: {
            email: d.email,
            name: d.name,
            passwordHash,
            role: "OWNER",
          },
        },
        boutiques: {
          create: {
            slug: boutiqueSlug,
            name: d.boutiqueName,
            address: emptyToNull(d.boutiqueAddress),
            phone: emptyToNull(d.boutiquePhone),
          },
        },
      },
      include: { staff: true, boutiques: { orderBy: { createdAt: "asc" }, take: 1 } },
    });

    const user = org.staff[0];
    const boutique = org.boutiques[0];
    if (boutique) {
      const jar = await cookies();
      jar.set(BOUTIQUE_CONTEXT_COOKIE, boutique.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    await startSession(user.id);
    redirect("/dashboard?bienvenue=1&onboarding=1");
  });
}

const DUMMY_HASH = "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(86) + "==";

export async function signIn(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const parsed = parseForm(z.object({ email, password: z.string().min(1, "Mot de passe requis") }), fd);
    if ("error" in parsed) return parsed.error;
    const { email: mail, password: pw } = parsed.data;

    if (!rateLimit(`login:${mail}:${await clientKey()}`, 8, 10 * 60 * 1000))
      return fail("Trop de tentatives. Réessayez dans quelques minutes.");

    const user = await db.user.findUnique({ where: { email: mail } });
    const valid = await verifyPassword(pw, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid || user.disabled) return fail("Email ou mot de passe incorrect.");

    await startSession(user.id);
    const role = isSuperadminEmail(user.email) ? "SUPERADMIN" : user.role === "SUPERADMIN" ? "EMPLOYEE" : user.role;
    redirect(homeFor(role));
  });
}

export async function signOut() {
  await endSession();
  redirect("/connexion");
}

const inviteSchema = z.object({
  token: z.string().min(10).max(100),
  name: z.string().trim().min(2, "Votre nom est requis").max(80),
  email,
  password,
});

export async function acceptInvitation(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const parsed = parseForm(inviteSchema, fd);
    if ("error" in parsed) return parsed.error;
    const d = parsed.data;

    if (!rateLimit(`invite:${await clientKey()}`, 15, 60 * 60 * 1000)) return fail("Trop de tentatives. Réessayez plus tard.");
    if (isSuperadminEmail(d.email)) return fail("Cet email est réservé à l'administration.", { email: "Email non disponible" });
    if (await db.user.findUnique({ where: { email: d.email } })) return fail("Un compte existe déjà avec cet email.", { email: "Email déjà utilisé" });

    const passwordHash = await hashPassword(d.password);
    const accepted = await db.$transaction(async (tx) => {
      const inv = await tx.invitation.findUnique({ where: { token: d.token } });
      if (!inv || inv.usedAt || inv.expiresAt < new Date()) return null;
      const claimed = await tx.invitation.updateMany({ where: { id: inv.id, usedAt: null }, data: { usedAt: new Date() } });
      if (claimed.count !== 1) return null;
      const inviteRole: Role = inv.role === "OWNER" ? "OWNER" : "EMPLOYEE";
      const u = await tx.user.create({
        data: {
          email: d.email,
          name: d.name,
          passwordHash,
          role: inviteRole,
          organizationId: inv.organizationId,
          boutiqueId: inv.boutiqueId,
        },
      });
      return { id: u.id, role: inviteRole };
    });
    if (!accepted) return fail("Cette invitation est invalide, expirée ou déjà utilisée.");
    await startSession(accepted.id);
    redirect(homeFor(accepted.role));
  });
}
