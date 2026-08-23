"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import type { SiteSettings } from "@/types/database";
import {
  getSiteSettings,
  updateSiteSettings,
  type UpdateSiteSettingsInput,
} from "@/lib/data/settings";
import { requireAdmin } from "@/lib/supabase/auth";

export type SettingsActionResult = {
  ok: boolean;
  error?: string;
  data?: SiteSettings;
};

export async function saveSettings(
  input: UpdateSiteSettingsInput,
): Promise<SettingsActionResult> {
  await requireAdmin();
  try {
    const data = await updateSiteSettings(input);
    const locale = await getLocale();
    revalidatePath(`/${locale}/admin/settings`);
    revalidatePath(`/${locale}/randomizer`);
    revalidatePath(`/${locale}`);
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Save failed",
    };
  }
}

export async function loadSettings(): Promise<SiteSettings> {
  await requireAdmin();
  return getSiteSettings();
}
