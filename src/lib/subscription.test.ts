import { describe, expect, it } from "vitest";
import {
  TRIAL_DAYS,
  addMonths,
  computePaymentPeriod,
  extendTrial,
  getSubscriptionState,
  trialEndFrom,
} from "./subscription";

const D = (s: string) => new Date(s);
const DAY = 86_400_000;

describe("essai gratuit", () => {
  it("dure 7 jours à partir de l'inscription", () => {
    const start = D("2026-10-01T10:00:00Z");
    expect(TRIAL_DAYS).toBe(7);
    expect(trialEndFrom(start).getTime() - start.getTime()).toBe(7 * DAY);
  });

  it("est en essai avec 7 jours restants le jour de l'inscription", () => {
    const start = D("2026-10-01T10:00:00Z");
    const s = getSubscriptionState({ trialEndsAt: trialEndFrom(start), subscriptionEndsAt: null, suspended: false }, start);
    expect(s.status).toBe("trial");
    expect(s.trialDaysLeft).toBe(7);
    expect(s.canWrite).toBe(true);
    expect(s.publicMode).toBe("full");
  });

  it("arrondit les jours restants au supérieur", () => {
    const start = D("2026-10-01T10:00:00Z");
    const now = new Date(start.getTime() + 6 * DAY + 3_600_000); // reste 23 h
    const s = getSubscriptionState({ trialEndsAt: trialEndFrom(start), subscriptionEndsAt: null, suspended: false }, now);
    expect(s.status).toBe("trial");
    expect(s.trialDaysLeft).toBe(1);
  });

  it("expire pile à la fin de l'essai (borne exclusive)", () => {
    const start = D("2026-10-01T10:00:00Z");
    const end = trialEndFrom(start);
    const input = { trialEndsAt: end, subscriptionEndsAt: null, suspended: false };
    expect(getSubscriptionState(input, new Date(end.getTime() - 1)).status).toBe("trial");
    const s = getSubscriptionState(input, end);
    expect(s.status).toBe("expired");
    expect(s.trialDaysLeft).toBe(0);
  });

  it("expiré = mode lecture : pas d'écriture, pas de commandes, menu public en lecture seule", () => {
    const s = getSubscriptionState(
      { trialEndsAt: D("2026-01-08T00:00:00Z"), subscriptionEndsAt: null, suspended: false },
      D("2026-03-01T00:00:00Z"),
    );
    expect(s).toMatchObject({ status: "expired", canWrite: false, acceptsOrders: false, publicMode: "readonly" });
  });
});

describe("abonnement actif / suspendu", () => {
  const now = D("2026-10-20T12:00:00Z");

  it("un abonnement payé valide prime sur l'essai terminé", () => {
    const s = getSubscriptionState(
      { trialEndsAt: D("2026-10-08T00:00:00Z"), subscriptionEndsAt: D("2026-11-10T12:00:00Z"), suspended: false },
      now,
    );
    expect(s.status).toBe("active");
    expect(s.subscriptionDaysLeft).toBe(21);
    expect(s.canWrite).toBe(true);
  });

  it("un abonnement échu sans essai retombe en expiré", () => {
    const s = getSubscriptionState(
      { trialEndsAt: D("2026-10-08T00:00:00Z"), subscriptionEndsAt: D("2026-10-19T00:00:00Z"), suspended: false },
      now,
    );
    expect(s.status).toBe("expired");
  });

  it("la suspension est prioritaire (même avec abonnement valide) et rend le menu indisponible", () => {
    const s = getSubscriptionState(
      { trialEndsAt: D("2026-10-30T00:00:00Z"), subscriptionEndsAt: D("2026-12-01T00:00:00Z"), suspended: true },
      now,
    );
    expect(s).toMatchObject({ status: "suspended", canWrite: false, acceptsOrders: false, publicMode: "unavailable" });
  });
});

describe("addMonths", () => {
  it("garde le même jour du mois", () => {
    expect(addMonths(D("2026-10-17T08:00:00Z"), 1).toISOString()).toBe("2026-11-17T08:00:00.000Z");
  });
  it("clamp en fin de mois", () => {
    expect(addMonths(D("2026-01-31T00:00:00Z"), 1).toISOString()).toBe("2026-02-28T00:00:00.000Z");
    expect(addMonths(D("2028-01-31T00:00:00Z"), 1).toISOString()).toBe("2028-02-29T00:00:00.000Z");
  });
  it("passe l'année", () => {
    expect(addMonths(D("2026-12-15T00:00:00Z"), 2).toISOString()).toBe("2027-02-15T00:00:00.000Z");
  });
});

describe("computePaymentPeriod", () => {
  const now = D("2026-10-17T00:00:00Z");

  it("démarre maintenant si aucun abonnement", () => {
    const p = computePaymentPeriod(null, 1, now);
    expect(p.start).toEqual(now);
    expect(p.end.toISOString()).toBe("2026-11-17T00:00:00.000Z");
  });

  it("démarre maintenant si l'abonnement est échu", () => {
    const p = computePaymentPeriod(D("2026-09-01T00:00:00Z"), 3, now);
    expect(p.start).toEqual(now);
    expect(p.end.toISOString()).toBe("2027-01-17T00:00:00.000Z");
  });

  it("prolonge à partir de la fin courante si l'abonnement est encore valide (aucun jour perdu)", () => {
    const current = D("2026-10-25T00:00:00Z");
    const p = computePaymentPeriod(current, 1, now);
    expect(p.start).toEqual(current);
    expect(p.end.toISOString()).toBe("2026-11-25T00:00:00.000Z");
  });

  it("refuse un nombre de mois invalide", () => {
    expect(() => computePaymentPeriod(null, 0, now)).toThrow(RangeError);
    expect(() => computePaymentPeriod(null, 1.5, now)).toThrow(RangeError);
    expect(() => computePaymentPeriod(null, 40, now)).toThrow(RangeError);
  });
});

describe("extendTrial", () => {
  const now = D("2026-10-17T00:00:00Z");
  it("ajoute des jours à la fin d'un essai en cours", () => {
    expect(extendTrial(D("2026-10-20T00:00:00Z"), 7, now).toISOString()).toBe("2026-10-27T00:00:00.000Z");
  });
  it("repart de maintenant si l'essai est terminé", () => {
    expect(extendTrial(D("2026-10-01T00:00:00Z"), 7, now).toISOString()).toBe("2026-10-24T00:00:00.000Z");
  });
  it("rejette un nombre de jours invalide", () => {
    expect(() => extendTrial(now, 0, now)).toThrow(RangeError);
  });
  it("un essai prolongé rend l'état « trial » à un Boutique expiré", () => {
    const expired = D("2026-10-01T00:00:00Z");
    const s0 = getSubscriptionState({ trialEndsAt: expired, subscriptionEndsAt: null, suspended: false }, now);
    expect(s0.status).toBe("expired");
    const s1 = getSubscriptionState({ trialEndsAt: extendTrial(expired, 14, now), subscriptionEndsAt: null, suspended: false }, now);
    expect(s1.status).toBe("trial");
    expect(s1.trialDaysLeft).toBe(14);
  });
});
