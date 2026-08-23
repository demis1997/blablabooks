import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { createClient } from "./server";
import { isSupabaseConfigured } from "./env";

export const DEMO_ADMIN_COOKIE = "bbb_demo_admin";

export type SessionProfile = {
  user: User;
  profile: Profile;
};

export type DemoAdminSession = {
  demo: true;
  user: { id: string; email: string };
  profile: Profile;
};

export type AdminSession = SessionProfile | DemoAdminSession;

const DEMO_PROFILE: Profile = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "demo@blablabooks.local",
  display_name: "Demo Admin",
  is_admin: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

/**
 * Returns the authenticated user + profile, or null if unauthenticated / demo mode.
 */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  return { user, profile: profile as Profile };
}

export async function hasDemoAdminCookie(): Promise<boolean> {
  if (isSupabaseConfigured()) return false;
  const cookieStore = await cookies();
  return cookieStore.get(DEMO_ADMIN_COOKIE)?.value === "1";
}

export async function getDemoAdminSession(): Promise<DemoAdminSession | null> {
  if (!(await hasDemoAdminCookie())) return null;
  return {
    demo: true,
    user: { id: DEMO_PROFILE.id, email: DEMO_PROFILE.email },
    profile: DEMO_PROFILE,
  };
}

export function isDemoAdminSession(
  session: AdminSession,
): session is DemoAdminSession {
  return "demo" in session && session.demo === true;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured()) {
    return getDemoAdminSession();
  }
  return getSessionProfile();
}

/**
 * Requires an authenticated admin profile, or demo admin cookie when Supabase
 * is not configured. Redirects to /admin/login when unauthorized.
 */
export async function requireAdmin(
  loginPath?: string,
): Promise<AdminSession> {
  const locale = await getLocale();
  const path = loginPath ?? `/${locale}/admin/login`;

  if (!isSupabaseConfigured()) {
    const demo = await getDemoAdminSession();
    if (demo) return demo;
    redirect(path);
  }

  const session = await getSessionProfile();

  if (!session) {
    redirect(path);
  }

  if (!session.profile.is_admin) {
    redirect(path);
  }

  return session;
}

export async function getAdminId(
  session?: AdminSession | null,
): Promise<string | null> {
  const current = session ?? (await getAdminSession());
  if (!current) return null;
  return current.profile.id;
}
