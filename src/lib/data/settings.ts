import type { SiteSettings } from "@/types/database";
import {
  appendDemoActivity,
  getDemoSettings,
  mutateDemoStore,
} from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) {
    return getDemoSettings();
  }

  const supabase = await createClient();
  if (!supabase) return getDemoSettings();

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load site settings: ${error.message}`);
  }

  if (!data) {
    return getDemoSettings();
  }

  return data as SiteSettings;
}

export type UpdateSiteSettingsInput = Partial<
  Pick<
    SiteSettings,
    | "public_randomizer_enabled"
    | "instagram_url"
    | "logo_url"
    | "site_name"
    | "instagram_auto_sync"
    | "instagram_auto_publish"
  >
>;

export async function updateSiteSettings(
  input: UpdateSiteSettingsInput,
): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) {
    let updated: SiteSettings | null = null;
    mutateDemoStore((draft) => {
      draft.settings = {
        ...draft.settings,
        ...input,
        updated_at: new Date().toISOString(),
      };
      updated = draft.settings;
    });
    appendDemoActivity({
      admin_id: null,
      action: "settings.updated",
      entity_type: "site_settings",
      entity_id: updated!.id,
      details: { fields: Object.keys(input) },
    });
    return updated!;
  }

  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase client unavailable");

  const current = await getSiteSettings();
  const { data, error } = await supabase
    .from("site_settings")
    .update(input)
    .eq("id", current.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update site settings: ${error.message}`);
  }

  return data as SiteSettings;
}
