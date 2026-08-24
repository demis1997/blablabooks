"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { loginSchema } from "@/lib/validations/book";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { DEMO_ADMIN_COOKIE } from "@/lib/supabase/auth";
import { canAccessAdmin } from "@/lib/supabase/auth-guard";
import {
  GENERIC_LOGIN_ERROR,
  GENERIC_RESET_NOTICE,
  clearAttempts,
  hashIp,
  isRateLimited,
  recordAttempt,
} from "@/lib/auth/rate-limit";

export type AuthActionResult = {
  ok: boolean;
  error?: string;
  notice?: string;
};

async function clientIpHash(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || h.get("x-real-ip") || "unknown";
  return hashIp(ip);
}

export async function login(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: GENERIC_LOGIN_ERROR,
    };
  }

  const ipHash = await clientIpHash();
  if (isRateLimited(ipHash)) {
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    recordAttempt(ipHash);
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    recordAttempt(ipHash);
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    recordAttempt(ipHash);
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, role")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !canAccessAdmin({
      isSupabaseConfigured: true,
      hasDemoCookie: false,
      profile: profile as { is_admin: boolean; role?: "admin" | "owner" | null } | null,
    })
  ) {
    await supabase.auth.signOut();
    recordAttempt(ipHash);
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  clearAttempts(ipHash);
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin`);
  redirect(`/${locale}/admin`);
}

export async function requestPasswordReset(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const locale = await getLocale();
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  if (isSupabaseConfigured() && email.includes("@")) {
    const supabase = await createClient();
    if (supabase) {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${site}/auth/callback?next=/${locale}/admin/reset-password`,
      });
    }
  }

  return { ok: true, notice: GENERIC_RESET_NOTICE };
}

export async function updatePassword(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8 || password !== confirm) {
    return {
      ok: false,
      error: "Choose a new password of at least 8 characters and confirm it.",
    };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Password reset isn’t available in demo mode." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Couldn’t update the password. Try the reset link again." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      ok: false,
      error: "Couldn’t update the password. Try the reset link again.",
    };
  }

  const locale = await getLocale();
  revalidatePath(`/${locale}/admin`);
  redirect(`/${locale}/admin`);
}

export async function logout(): Promise<void> {
  const locale = await getLocale();
  const cookieStore = await cookies();

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  cookieStore.delete(DEMO_ADMIN_COOKIE);
  revalidatePath(`/${locale}/admin`);
  redirect(`/${locale}/admin/login`);
}

export async function demoLogin(): Promise<AuthActionResult> {
  if (isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Demo mode is only available when Supabase is not configured.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(DEMO_ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  const locale = await getLocale();
  revalidatePath(`/${locale}/admin`);
  redirect(`/${locale}/admin`);
}
