"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { loginSchema } from "@/lib/validations/book";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { DEMO_ADMIN_COOKIE } from "@/lib/supabase/auth";

export type AuthActionResult = {
  ok: boolean;
  error?: string;
};

export async function login(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Supabase is not configured. Use demo mode instead.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid credentials",
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Auth client unavailable" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      await supabase.auth.signOut();
      return { ok: false, error: "You don’t have admin access." };
    }
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
