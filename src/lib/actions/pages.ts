"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import type { EditablePage } from "@/types/database";
import {
  getAboutPage,
  updatePage,
  type UpdatePageInput,
} from "@/lib/data/pages";
import { requireAdmin } from "@/lib/supabase/auth";

export type PagesActionResult = {
  ok: boolean;
  error?: string;
  data?: EditablePage;
};

export async function savePage(
  input: UpdatePageInput,
): Promise<PagesActionResult> {
  await requireAdmin();
  try {
    const data = await updatePage(input);
    const locale = await getLocale();
    revalidatePath(`/${locale}/admin/pages`);
    revalidatePath(`/${locale}/about`);
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Save failed",
    };
  }
}

export async function loadAboutPage(): Promise<EditablePage> {
  await requireAdmin();
  return getAboutPage();
}
