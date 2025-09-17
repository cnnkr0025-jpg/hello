import { describe, expect, it } from "vitest";
import { PLAN_CONFIG, getPlanConfig } from "../plans";

describe("plan config", () => {
  it("has free plan", () => {
    expect(getPlanConfig("FREE")).toEqual(PLAN_CONFIG.FREE);
  });

  it("pro plan has highest credits", () => {
    const credits = Object.values(PLAN_CONFIG).map((c) => c.monthlyCredits);
    expect(Math.max(...credits)).toBe(PLAN_CONFIG.PRO.monthlyCredits);
  });
});
