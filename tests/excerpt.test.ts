import { describe, expect, it } from "vitest";
import { toExcerpt } from "../src/utils/excerpt";

describe("toExcerpt", () => {
  it("trims HTML and limits length", () => {
    const text = "<p>Merhaba <strong>dünya</strong> ve sevgi dolu cümleler</p>";
    const result = toExcerpt(text, 10);
    expect(result.endsWith("…")).toBe(true);
    expect(result.includes("<")).toBe(false);
  });

  it("returns empty string when text missing", () => {
    expect(toExcerpt("", 50)).toBe("");
  });
});
