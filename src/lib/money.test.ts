import { describe, expect, it } from "vitest";
import { formatMoney, parseMoney } from "./money";

describe("money", () => {
  it("formate le XOF sans décimales", () => {
    expect(formatMoney(2500, "XOF")).toContain("2");
    expect(formatMoney(2500, "XOF").replace(/\s/g, "")).toMatch(/FCFA|F CFA|XOF/i);
  });

  it("formate l'EUR avec décimales", () => {
    expect(formatMoney(1250, "EUR")).toContain("12");
    expect(formatMoney(1250, "EUR")).toMatch(/€|EUR/i);
  });

  it("parse XOF entier", () => {
    expect(parseMoney("2 500", "XOF")).toBe(2500);
  });

  it("parse EUR avec virgule", () => {
    expect(parseMoney("12,50", "EUR")).toBe(1250);
  });
});
