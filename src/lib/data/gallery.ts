import type { GalleryImage } from "@/types/database";
import {
  appendDemoActivity,
  getDemoGallery,
  mutateDemoStore,
} from "@/lib/demo-data";
import { fetchInstagramGallery, isInstagramConfigured } from "@/lib/instagram";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { GalleryImageMetadataInput } from "@/lib/validations/book";

export type ListGalleryOptions = {
  includeUnpublished?: boolean;
  featuredOnly?: boolean;
};

async function listStoredGalleryImages(
  options: ListGalleryOptions = {},
): Promise<GalleryImage[]> {
  if (!isSupabaseConfigured()) {
    let images = getDemoGallery();
    if (!options.includeUnpublished) {
      images = images.filter((img) => img.status === "published");
    }
    if (options.featuredOnly) {
      images = images.filter((img) => img.is_featured);
    }
    return [...images].sort((a, b) => a.sort_order - b.sort_order);
  }

  const supabase = await createClient();
  if (!supabase) {
    let images = getDemoGallery();
    if (!options.includeUnpublished) {
      images = images.filter((img) => img.status === "published");
    }
    if (options.featuredOnly) {
      images = images.filter((img) => img.is_featured);
    }
    return [...images].sort((a, b) => a.sort_order - b.sort_order);
  }

  let query = supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!options.includeUnpublished) {
    query = query.eq("status", "published");
  }
  if (options.featuredOnly) {
    query = query.eq("is_featured", true);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to list gallery images: ${error.message}`);
  }

  return (data ?? []) as GalleryImage[];
}

export async function listGalleryImages(
  options: ListGalleryOptions = {},
): Promise<GalleryImage[]> {
  const stored = await listStoredGalleryImages(options);

  if (options.includeUnpublished || !isInstagramConfigured()) {
    return stored;
  }

  const instagram = await fetchInstagramGallery(24);
  if (instagram.length === 0) return stored;

  if (options.featuredOnly) {
    return instagram.filter((img) => img.is_featured);
  }
  return instagram;
}

export async function getGalleryImageById(
  id: string,
): Promise<GalleryImage | null> {
  if (!isSupabaseConfigured()) {
    return getDemoGallery().find((img) => img.id === id) ?? null;
  }

  const supabase = await createClient();
  if (!supabase) {
    return getDemoGallery().find((img) => img.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get gallery image: ${error.message}`);
  }

  return (data as GalleryImage | null) ?? null;
}

export async function updateGalleryImageMetadata(
  input: Partial<GalleryImageMetadataInput> & { id: string },
): Promise<GalleryImage> {
  const { id, ...rest } = input;

  if (!isSupabaseConfigured()) {
    let updated: GalleryImage | null = null;
    mutateDemoStore((draft) => {
      const index = draft.gallery.findIndex((img) => img.id === id);
      if (index === -1) return;
      const current = draft.gallery[index]!;
      const next: GalleryImage = {
        ...current,
        ...rest,
        event_id: rest.event_id === undefined ? current.event_id : rest.event_id,
        caption_en: rest.caption_en ?? current.caption_en,
        caption_ru: rest.caption_ru ?? current.caption_ru,
        alt_text: rest.alt_text ?? current.alt_text,
        updated_at: new Date().toISOString(),
      };
      draft.gallery[index] = next;
      updated = next;
    });
    if (!updated) throw new Error(`Gallery image not found: ${id}`);
    appendDemoActivity({
      admin_id: null,
      action: "gallery.updated",
      entity_type: "gallery_image",
      entity_id: id,
      details: { fields: Object.keys(rest) },
    });
    return updated;
  }

  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase client unavailable");

  const { data, error } = await supabase
    .from("gallery_images")
    .update(rest)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update gallery image: ${error.message}`);
  }

  return data as GalleryImage;
}
