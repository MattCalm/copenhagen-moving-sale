import { describe, expect, it } from "vitest";
import { calculateDiscountPercent, calculateSavings, formatMoney } from "./pricing";

describe("pricing helpers", () => {
  it("calculates savings from current retail and sale prices", () => {
    expect(calculateSavings(1200, 750)).toBe(450);
  });

  it("calculates a rounded discount percentage", () => {
    expect(calculateDiscountPercent(999, 650)).toBe(35);
  });

  it("never returns negative savings", () => {
    expect(calculateSavings(500, 700)).toBe(0);
  });

  it("formats Danish kroner without decimals", () => {
    expect(formatMoney(1250, "DKK")).toBe("1.250 kr.");
  });
});
