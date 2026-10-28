import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Boutique, Organization, Role, User } from "@prisma/client";
import { db } from "../db";
import { isSuperadminEmail } from "../env";
import { getSubscriptionState, type SubscriptionState } from "../subscription";
import {
  listAccessibleBoutiques,
  resolveBoutiqueContext,
  type BoutiqueViewMode,
} from "./boutique-context";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./token";

export async function startSession(userId: string) {
  const token = await signSession({ uid: userId });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export interface CurrentUser {
  user: User;
  role: Role;
  organization: Organization | null;
  subscription: SubscriptionState | null;
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  const claims = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!claims) return null;
  const user = await db.user.findUnique({
    where: { id: claims.uid },
    include: { organization: true },
  });
  if (!user || user.disabled) return null;
  const superadmin = isSuperadminEmail(user.email);
  const role: Role = superadmin ? "SUPERADMIN" : user.role === "SUPERADMIN" ? "EMPLOYEE" : user.role;
  const organization = user.organization ?? null;
  return {
    user,
    role,
    organization,
    subscription: organization ? getSubscriptionState(organization) : null,
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const me = await getCurrentUser();
  if (!me) redirect("/connexion");
  return me;
}

export interface StaffContext extends CurrentUser {
  organization: Organization;
  subscription: SubscriptionState;
  boutiques: Boutique[];
  viewMode: BoutiqueViewMode;
  /** Boutique active ; null en vue consolidée (propriétaire). */
  boutique: Boutique | null;
}

export async function requireStaff(opts: { ownerOnly?: boolean } = {}): Promise<StaffContext> {
  const me = await requireUser();
  if (me.role === "SUPERADMIN") redirect("/superadmin");
  if (!me.organization || !me.subscription) redirect("/connexion");
  if (opts.ownerOnly && me.role !== "OWNER") redirect(staffHomeFor(me.role));

  const boutiques = await listAccessibleBoutiques(me.user, me.organization.id);
  const { mode, boutique } = await resolveBoutiqueContext(me.user, me.organization, boutiques);

  if (me.user.role === "EMPLOYEE" && !boutique) redirect("/connexion");

  return {
    ...me,
    organization: me.organization,
    subscription: me.subscription,
    boutiques,
    viewMode: mode,
    boutique,
  };
}

export function staffHomeFor(role: Role): string {
  if (role === "EMPLOYEE") return "/pointage";
  return "/dashboard";
}

export async function requireSuperadmin(): Promise<CurrentUser> {
  const me = await requireUser();
  if (me.role !== "SUPERADMIN") redirect("/connexion");
  return me;
}

export function homeFor(role: Role): string {
  if (role === "SUPERADMIN") return "/superadmin";
  if (role === "EMPLOYEE") return "/pointage";
  return "/dashboard";
}

/** Contexte d'écriture : une boutique doit être sélectionnée (pas la vue consolidée). */
export async function requireBoutiqueWrite(opts: { ownerOnly?: boolean } = {}): Promise<StaffContext & { boutique: Boutique }> {
  const ctx = await requireStaff(opts);
  if (ctx.viewMode === "consolidated" || !ctx.boutique) {
    redirect("/dashboard?choix_boutique=1");
  }
  return ctx as StaffContext & { boutique: Boutique };
}
