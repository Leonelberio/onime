import { Prisma } from "@prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";
import { SUBSCRIPTION_ENABLED } from "../branding";
import type { Boutique } from "@prisma/client";
import { requireBoutiqueWrite, type StaffContext } from "../auth/session";

export type WritableStaffContext = StaffContext & { boutique: Boutique };

export type ActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** donnée libre (ex. lien d'invitation généré) */
  data?: Record<string, string>;
} | undefined;

export const fail = (error: string, fieldErrors?: Record<string, string>): ActionState => ({ ok: false, error, fieldErrors });
export const success = (message?: string, data?: Record<string, string>): ActionState => ({ ok: true, message, data });

export function fieldErrorsFrom(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "form");
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}

export function parseForm<T extends z.ZodTypeAny>(schema: T, fd: FormData): { data: z.infer<T> } | { error: ActionState } {
  const raw: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") raw[k] = v;
  const res = schema.safeParse(raw);
  if (!res.success) return { error: fail("Veuillez corriger les champs en erreur.", fieldErrorsFrom(res.error)) };
  return { data: res.data };
}

export const EXPIRED_MESSAGE =
  "Le back-office est en lecture seule. Contactez l'administrateur pour réactiver l'accès.";

/** Contexte staff ; vérifie l'abonnement seulement si SUBSCRIPTION_ENABLED. */
export async function requireWritable(opts: { ownerOnly?: boolean } = {}): Promise<WritableStaffContext> {
  const ctx = await requireBoutiqueWrite(opts);
  if (SUBSCRIPTION_ENABLED && !ctx.subscription.canWrite) throw new ReadOnlyError();
  return ctx;
}

export class ReadOnlyError extends Error {
  constructor() {
    super(EXPIRED_MESSAGE);
  }
}

/** Enveloppe d'action : transforme ReadOnlyError et erreurs inattendues en ActionState. */
export async function guarded(fn: () => Promise<ActionState>): Promise<ActionState> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ReadOnlyError) return fail(e.message);
    if (isRedirectError(e)) throw e;

    if (e instanceof Prisma.PrismaClientInitializationError) {
      return fail(
        "Base de données inaccessible : vérifiez DATABASE_URL (et DIRECT_URL) dans le fichier .env à la racine du projet, puis redémarrez le serveur (`pnpm dev`).",
      );
    }
    if (e instanceof Prisma.PrismaClientValidationError) {
      return fail(
        "Client Prisma obsolète ou migration manquante. Arrêtez `pnpm dev`, exécutez `npx prisma generate` et `npx prisma migrate deploy`, puis relancez le serveur.",
      );
    }

    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("AUTH_SECRET manquant")) {
      return fail("Configuration serveur incomplète : renseignez AUTH_SECRET (32 caractères minimum) dans .env, puis redémarrez.");
    }

    console.error("[action]", e);
    return fail("Une erreur est survenue. Réessayez dans un instant.");
  }
}

export const emptyToNull = (v: string | undefined | null) => {
  const t = (v ?? "").trim();
  return t ? t : null;
};
