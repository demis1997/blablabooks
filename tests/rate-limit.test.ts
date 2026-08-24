import { describe, expect, it } from "vitest";
import {
  clearAttempts,
  isRateLimited,
  recordAttempt,
} from "@/lib/auth/rate-limit";

describe("login rate limit", () => {
  it("blocks after too many attempts in the window", () => {
    const ip = "test-ip";
    clearAttempts(ip);
    const start = Date.now();
    for (let i = 0; i < 8; i += 1) {
      recordAttempt(ip, start);
    }
    expect(isRateLimited(ip, start + 1000)).toBe(true);
    clearAttempts(ip);
    expect(isRateLimited(ip, start + 1000)).toBe(false);
  });
});
