import { beforeAll, describe, expect, it } from "vitest";
import { signSession, verifySession } from "./token";

beforeAll(() => { process.env.AUTH_SECRET = "test-secret-0123456789-0123456789-0123456789"; });

describe("session JWT", () => {
  it("signe puis vérifie", async () => {
    const t = await signSession({ uid: "u1" });
    expect(await verifySession(t)).toEqual({ uid: "u1" });
  });
  it("rejette un jeton falsifié ou tronqué", async () => {
    const t = await signSession({ uid: "u1" });
    const [h, , s] = t.split(".");
    const forged = `${h}.${btoa(JSON.stringify({ uid: "admin", exp: 9999999999 })).replace(/=+$/, "")}.${s}`;
    expect(await verifySession(forged)).toBeNull();
    expect(await verifySession(t.slice(0, -3))).toBeNull();
    expect(await verifySession("a.b")).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
  });
  it("rejette un jeton expiré", async () => {
    const t = await signSession({ uid: "u1" }, Date.now() - 15 * 86_400_000);
    expect(await verifySession(t)).toBeNull();
  });
});
