/**
 * Logique d'abonnement SaaS (pure, testable, sans accès base).
 *
 * États :
 *  - suspended : le super-admin a suspendu le Boutique (prioritaire sur tout)
 *  - active    : un abonnement payé couvre « maintenant » (subscriptionEndsAt > now)
 *  - trial     : essai gratuit de 7 jours en cours (trialEndsAt > now)
 *  - expired   : ni essai ni abonnement valides → mode lecture (aucune donnée supprimée)
 */

export const TRIAL_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type SubscriptionStatus = "trial" | "active" | "expired" | "suspended";

export interface SubscriptionInput {
  trialEndsAt: Date;
  subscriptionEndsAt: Date | null;
  suspended: boolean;
}

export interface SubscriptionState {
  status: SubscriptionStatus;
  /** Jours d'essai restants (arrondi au supérieur), 0 si l'essai est terminé. */
  trialDaysLeft: number;
  /** Jours restants d'abonnement payé (arrondi au supérieur), 0 sinon. */
  subscriptionDaysLeft: number;
  /** Le Gérant peut-il modifier/créer des données (menu, commandes, équipe) ? */
  canWrite: boolean;
  /** Le menu public accepte-t-il de nouvelles commandes ? */
  acceptsOrders: boolean;
  /** Mode d'affichage du menu public. */
  publicMode: "full" | "readonly" | "unavailable";
}

export function trialEndFrom(start: Date, days: number = TRIAL_DAYS): Date {
  return new Date(start.getTime() + days * DAY_MS);
}

function daysLeft(end: Date | null, now: Date): number {
  if (!end) return 0;
  const ms = end.getTime() - now.getTime();
  return ms > 0 ? Math.ceil(ms / DAY_MS) : 0;
}

export function getSubscriptionState(r: SubscriptionInput, now: Date = new Date()): SubscriptionState {
  const trialDaysLeft = daysLeft(r.trialEndsAt, now);
  const subscriptionDaysLeft = daysLeft(r.subscriptionEndsAt, now);

  let status: SubscriptionStatus;
  if (r.suspended) status = "suspended";
  else if (subscriptionDaysLeft > 0) status = "active";
  else if (trialDaysLeft > 0) status = "trial";
  else status = "expired";

  const live = status === "active" || status === "trial";
  return {
    status,
    trialDaysLeft,
    subscriptionDaysLeft,
    canWrite: live,
    acceptsOrders: live,
    publicMode: live ? "full" : status === "expired" ? "readonly" : "unavailable",
  };
}

/** Ajoute `months` mois calendaires en conservant le jour (clamp en fin de mois : 31 janv. + 1 mois = 28/29 févr.). */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}

/**
 * Période couverte par un paiement : on prolonge à partir de la fin de l'abonnement en cours
 * s'il est encore valide (pas de jours perdus), sinon à partir de maintenant.
 */
export function computePaymentPeriod(
  currentEnd: Date | null,
  months: number,
  now: Date = new Date(),
): { start: Date; end: Date } {
  if (!Number.isInteger(months) || months < 1 || months > 36) throw new RangeError("months doit être un entier entre 1 et 36");
  const start = currentEnd && currentEnd.getTime() > now.getTime() ? currentEnd : now;
  return { start, end: addMonths(start, months) };
}

/** Prolonge l'essai de `days` jours (depuis la fin de l'essai s'il court encore, sinon depuis maintenant). */
export function extendTrial(trialEndsAt: Date, days: number, now: Date = new Date()): Date {
  if (!Number.isInteger(days) || days < 1 || days > 365) throw new RangeError("days doit être un entier entre 1 et 365");
  const base = trialEndsAt.getTime() > now.getTime() ? trialEndsAt : now;
  return new Date(base.getTime() + days * DAY_MS);
}

export const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  trial: "Essai gratuit",
  active: "Abonnement actif",
  expired: "Expiré",
  suspended: "Suspendu",
};
