import type { EditablePage } from "@/types/database";
import {
  appendDemoActivity,
  getDemoAboutPage,
  getDemoPages,
  mutateDemoStore,
} from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function listPages(): Promise<EditablePage[]> {
  if (!isSupabaseConfigured()) {
    return getDemoPages();
  }

  const supabase = await createClient();
  if (!supabase) return getDemoPages();

  const { data, error } = await supabase
    .from("editable_pages")
    .select("*")
    .order("slug", { ascending: true });

  if (error) {
    throw new Error(`Failed to list pages: ${error.message}`);
  }

  return (data ?? []) as EditablePage[];
}

/** Alias used by public pages. */
export async function getEditablePage(
  slug: string,
): Promise<EditablePage | null> {
  return getPageBySlug(slug);
}

export async function getPageBySlug(
  slug: string,
): Promise<EditablePage | null> {
  if (!isSupabaseConfigured()) {
    if (slug === "about") return getDemoAboutPage();
    return getDemoPages().find((p) => p.slug === slug) ?? null;
  }

  const supabase = await createClient();
  if (!supabase) {
    if (slug === "about") return getDemoAboutPage();
    return getDemoPages().find((p) => p.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("editable_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get page: ${error.message}`);
  }

  return (data as EditablePage | null) ?? null;
}

export async function getAboutPage(): Promise<EditablePage> {
  const page = await getPageBySlug("about");
  if (!page) {
    return getDemoAboutPage();
  }
  return page;
}

export type UpdatePageInput = {
  slug: string;
  title_en?: string;
  title_ru?: string | null;
  content_en?: string;
  content_ru?: string | null;
};

export async function updatePage(input: UpdatePageInput): Promise<EditablePage> {
  const { slug, ...rest } = input;

  if (!isSupabaseConfigured()) {
    const found = getDemoPages().find((p) => p.slug === slug);
    if (!found) throw new Error(`Page not found: ${slug}`);

    const updated: EditablePage = {
      ...found,
      ...rest,
      updated_at: new Date().toISOString(),
    };

    mutateDemoStore((draft) => {
      const index = draft.pages.findIndex((p) => p.slug === slug);
      if (index !== -1) draft.pages[index] = updated;
    });

    appendDemoActivity({
      admin_id: null,
      action: "page.updated",
      entity_type: "editable_page",
      entity_id: updated.id,
      details: { slug },
    });
    return updated;
  }

  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase client unavailable");

  const { data, error } = await supabase
    .from("editable_pages")
    .update(rest)
    .eq("slug", slug)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update page: ${error.message}`);
  }

  return data as EditablePage;
}
