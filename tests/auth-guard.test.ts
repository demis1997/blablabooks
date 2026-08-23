import { describe, expect, it } from "vitest";
import { canAccessAdmin } from "@/lib/supabase/auth-guard";

describe("canAccessAdmin", () => {
  it("allows demo cookie when Supabase is not configured", () => {
    expect(
      canAccessAdmin({
        isSupabaseConfigured: false,
        hasDemoCookie: true,
        profile: null,
      }),
    ).toBe(true);
  });

  it("denies demo mode without cookie", () => {
    expect(
      canAccessAdmin({
        isSupabaseConfigured: false,
        hasDemoCookie: false,
        profile: { is_admin: true },
      }),
    ).toBe(false);
  });

  it("requires admin profile when Supabase is configured", () => {
    expect(
      canAccessAdmin({
        isSupabaseConfigured: true,
        hasDemoCookie: true,
        profile: { is_admin: true },
      }),
    ).toBe(true);

    expect(
      canAccessAdmin({
        isSupabaseConfigured: true,
        hasDemoCookie: true,
        profile: { is_admin: false },
      }),
    ).toBe(false);

    expect(
      canAccessAdmin({
        isSupabaseConfigured: true,
        hasDemoCookie: false,
        profile: null,
      }),
    ).toBe(false);
  });
});
