export type AdminAccessInput = {
  isSupabaseConfigured: boolean;
  hasDemoCookie: boolean;
  profile: { is_admin: boolean; role?: "admin" | "owner" | null } | null;
};

/**
 * Pure admin gate used by requireAdmin / layout checks.
 * Demo mode (no Supabase): cookie grants access.
 * Supabase mode: authenticated profile with is_admin.
 */
export function canAccessAdmin({
  isSupabaseConfigured,
  hasDemoCookie,
  profile,
}: AdminAccessInput): boolean {
  if (!isSupabaseConfigured) {
    return hasDemoCookie;
  }

  return Boolean(
    profile?.is_admin || profile?.role === "admin" || profile?.role === "owner",
  );
}

export function isOwnerProfile(profile: {
  role?: "admin" | "owner" | null;
} | null): boolean {
  return profile?.role === "owner";
}
