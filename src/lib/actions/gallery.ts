"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import type { GalleryImage, PublishStatus } from "@/types/database";
import {
  listGalleryImages,
  updateGalleryImageMetadata,
} from "@/lib/data/gallery";
import { getAdminId, requireAdmin } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  deleteGalleryImage as demoDeleteGalleryImage,
  upsertGalleryImage,
} from "@/lib/demo-data";
import { logActivity } from "@/lib/data/activity";
import type { GalleryImageMetadataInput } from "@/lib/validations/book";

export type GalleryActionResult<T = unknown> = {
  ok: boolean;
  error?: string;
  data?: T;
};

async function revalidate() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/gallery`);
  revalidatePath(`/${locale}/gallery`);
  revalidatePath(`/${locale}`);
}

export async function uploadGalleryImages(
  items: Array<{
    public_url: string;
    storage_path: string;
    caption_en?: string | null;
    caption_ru?: string | null;
    alt_text?: string | null;
    width?: number | null;
    height?: number | null;
  }>,
): Promise<GalleryActionResult<GalleryImage[]>> {
  await requireAdmin();
  if (!items.length) return { ok: false, error: "No images provided" };

  const existing = await listGalleryImages({ includeUnpublished: true });
  const maxOrder = existing.reduce((m, img) => Math.max(m, img.sort_order), -1);
  const now = new Date().toISOString();
  const created: GalleryImage[] = [];

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]!;
    const image: GalleryImage = {
      id: crypto.randomUUID(),
      event_id: null,
      storage_path: item.storage_path,
      optimized_path: null,
      public_url: item.public_url,
      caption_en: item.caption_en ?? null,
      caption_ru: item.caption_ru ?? null,
      alt_text: item.alt_text ?? null,
      event_date: null,
      location: null,
      sort_order: maxOrder + 1 + i,
      is_featured: false,
      status: "draft",
      width: item.width ?? null,
      height: item.height ?? null,
      created_at: now,
      updated_at: now,
      uploaded_by: await getAdminId(),
      source: "manual",
      instagram_media_id: null,
      instagram_permalink: null,
      reviewed: true,
    };

    if (!isSupabaseConfigured()) {
      upsertGalleryImage(image);
      created.push(image);
    } else {
      const supabase = await createClient();
      if (!supabase) return { ok: false, error: "Supabase unavailable" };
      const { data, error } = await supabase
        .from("gallery_images")
        .insert(image)
        .select("*")
        .single();
      if (error) return { ok: false, error: error.message };
      created.push(data as GalleryImage);
    }
  }

  await logActivity({
    admin_id: await getAdminId(),
    action: "gallery.uploaded",
    entity_type: "gallery_image",
    entity_id: null,
    details: { count: created.length },
  });
  await revalidate();
  return { ok: true, data: created };
}

export async function updateGalleryImage(
  input: Partial<GalleryImageMetadataInput> & { id: string },
): Promise<GalleryActionResult<GalleryImage>> {
  await requireAdmin();
  try {
    const updated = await updateGalleryImageMetadata(input);
    await revalidate();
    return { ok: true, data: updated };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Update failed",
    };
  }
}

export async function publishGalleryImage(
  id: string,
): Promise<GalleryActionResult<GalleryImage>> {
  return setGalleryStatus(id, "published");
}

export async function unpublishGalleryImage(
  id: string,
): Promise<GalleryActionResult<GalleryImage>> {
  return setGalleryStatus(id, "draft");
}

async function setGalleryStatus(
  id: string,
  status: PublishStatus,
): Promise<GalleryActionResult<GalleryImage>> {
  await requireAdmin();
  try {
    const updated = await updateGalleryImageMetadata({ id, status });
    await revalidate();
    return { ok: true, data: updated };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Status update failed",
    };
  }
}

export async function reorderGalleryImages(
  orderedIds: string[],
): Promise<GalleryActionResult> {
  await requireAdmin();
  for (let i = 0; i < orderedIds.length; i += 1) {
    const id = orderedIds[i]!;
    await updateGalleryImageMetadata({ id, sort_order: i });
  }
  await revalidate();
  return { ok: true };
}

export async function bulkUpdateGallery(
  ids: string[],
  patch: {
    status?: PublishStatus;
    is_featured?: boolean;
    event_id?: string | null;
    reviewed?: boolean;
  },
): Promise<GalleryActionResult<{ count: number }>> {
  await requireAdmin();
  if (!ids.length) return { ok: false, error: "No photos selected" };

  for (const id of ids) {
    await updateGalleryImageMetadata({ id, ...patch, reviewed: true });
  }
  await logActivity({
    admin_id: await getAdminId(),
    action: patch.status === "published" ? "gallery.published" : "gallery.updated",
    entity_type: "gallery_image",
    entity_id: null,
    details: { ids, ...patch },
  });
  await revalidate();
  return { ok: true, data: { count: ids.length } };
}

export async function deleteGalleryImage(
  id: string,
): Promise<GalleryActionResult> {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    const removed = demoDeleteGalleryImage(id);
    if (!removed) return { ok: false, error: "Image not found" };
  } else {
    const supabase = await createClient();
    if (!supabase) return { ok: false, error: "Supabase unavailable" };
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
  }

  await logActivity({
    admin_id: await getAdminId(),
    action: "gallery.deleted",
    entity_type: "gallery_image",
    entity_id: id,
  });
  await revalidate();
  return { ok: true };
}
