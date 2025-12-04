import { describe, expect, it } from "vitest";
import { rateLimit } from "../src/lib/rate-limit";

describe("rateLimit fallback", () => {
  it("limits requests per key/identifier", async () => {
    const first = await rateLimit("test-route", "user-1", 2, 10_000);
    const second = await rateLimit("test-route", "user-1", 2, 10_000);
    const third = await rateLimit("test-route", "user-1", 2, 10_000);

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(third.success).toBe(false);
  });
});
