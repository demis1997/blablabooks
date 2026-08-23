import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

/**
 * Browser Supabase client. Returns null when env vars are missing (demo mode).
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}

/**
 * Browser client that throws a clear error if Supabase is not configured.
 */
export function createClientOrThrow() {
  const client = createClient();
  if (!client) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return client;
}
