import { describe, expect, it } from "vitest";
import { calculateDiscountPercent, calculateSavings, formatMoney, getReferencePrice } from "./pricing";

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

  it("uses current retail price before original purchase price for public reference price", () => {
    expect(getReferencePrice(5999, 6500)).toBe(5999);
  });

  it("falls back to original purchase price when current retail price is missing", () => {
    expect(getReferencePrice(null, 6500)).toBe(6500);
  });

  it("hides empty or zero reference prices", () => {
    expect(getReferencePrice(0, null)).toBeNull();
  });
});
