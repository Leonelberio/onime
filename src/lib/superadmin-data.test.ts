import { describe, expect, it } from "vitest";
import { computeMrr } from "./superadmin-data";
import { getSubscriptionState } from "./subscription";

const now = new Date("2026-10-17T00:00:00Z");
const sub = (over: Partial<Parameters<typeof getSubscriptionState>[0]>) =>
  getSubscriptionState({ trialEndsAt: new Date("2026-10-01T00:00:00Z"), subscriptionEndsAt: null, suspended: false, ...over }, now);

describe("computeMrr", () => {
  it("ne compte que les abonnements actifs avec un plan", () => {
    const rows = [
      { sub: sub({ subscriptionEndsAt: new Date("2026-11-01T00:00:00Z") }), planPrice: 15000 },
      { sub: sub({ subscriptionEndsAt: new Date("2026-11-01T00:00:00Z") }), planPrice: 25000 },
      { sub: sub({ trialEndsAt: new Date("2026-10-20T00:00:00Z") }), planPrice: 15000 }, // essai : non compté
      { sub: sub({}), planPrice: 15000 }, // expiré
      { sub: sub({ subscriptionEndsAt: new Date("2026-11-01T00:00:00Z"), suspended: true }), planPrice: 15000 }, // suspendu
      { sub: sub({ subscriptionEndsAt: new Date("2026-11-01T00:00:00Z") }), planPrice: null }, // actif sans plan
    ];
    expect(computeMrr(rows)).toBe(40000);
  });
});
