import { describe, expect, it } from "vitest";
import { chooseUniqueSlug, createSlugBase } from "./slugs";

describe("slug helpers", () => {
  it("creates a normal English slug", () => {
    expect(createSlugBase("Dining Chair")).toBe("dining-chair");
  });

  it("maps known Chinese item names to meaningful English slugs", () => {
    expect(createSlugBase("椅子")).toBe("chair");
  });

  it("uses the next available numeric suffix", () => {
    expect(chooseUniqueSlug("Chair", ["chair", "chair-2"])).toBe("chair-3");
  });

  it("uses the next available suffix for repeated Chinese item names", () => {
    expect(chooseUniqueSlug("椅子", ["chair", "chair-2"])).toBe("chair-3");
  });

  it("ignores unrelated slugs when choosing a suffix", () => {
    expect(chooseUniqueSlug("Chair", ["chair-cover", "chairish"])).toBe("chair");
  });

  it("creates a safe fallback for unknown non-Latin titles", () => {
    expect(createSlugBase("未映射名称")).toMatch(/^item-[a-z0-9-]+$/);
  });
});
