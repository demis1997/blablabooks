"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import type { Announcement, PublishStatus } from "@/types/database";
import {
  getAnnouncementById,
  listAnnouncements,
  upsertAnnouncement as upsertAnnouncementRecord,
} from "@/lib/data/announcements";
import { getAdminId, requireAdmin } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { deleteAnnouncement as demoDeleteAnnouncement } from "@/lib/demo-data";
import { logActivity } from "@/lib/data/activity";
import {
  announcementSchema,
  type AnnouncementInput,
} from "@/lib/validations/book";

export type AnnouncementActionResult<T = unknown> = {
  ok: boolean;
  error?: string;
  data?: T;
};

async function revalidate() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/announcements`);
  revalidatePath(`/${locale}/admin/meetups`);
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/admin`);
}

export async function saveAnnouncement(
  input: AnnouncementInput | (Partial<AnnouncementInput> & { title_en: string }),
): Promise<AnnouncementActionResult<Announcement>> {
  await requireAdmin();
  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid announcement",
    };
  }

  try {
    const saved = await upsertAnnouncementRecord(parsed.data);
    await revalidate();
    return { ok: true, data: saved };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Save failed",
    };
  }
}

export async function publishAnnouncement(
  id: string,
): Promise<AnnouncementActionResult<Announcement>> {
  return setAnnouncementStatus(id, "published");
}

export async function unpublishAnnouncement(
  id: string,
): Promise<AnnouncementActionResult<Announcement>> {
  return setAnnouncementStatus(id, "draft");
}

export async function archiveAnnouncement(
  id: string,
): Promise<AnnouncementActionResult<Announcement>> {
  return setAnnouncementStatus(id, "archived");
}

async function setAnnouncementStatus(
  id: string,
  status: PublishStatus,
): Promise<AnnouncementActionResult<Announcement>> {
  await requireAdmin();
  const existing = await getAnnouncementById(id);
  if (!existing) return { ok: false, error: "Announcement not found" };

  try {
    const saved = await upsertAnnouncementRecord({
      ...existing,
      id,
      status,
    });
    await logActivity({
      admin_id: await getAdminId(),
      action: `announcement.${status}`,
      entity_type: "announcement",
      entity_id: id,
    });
    await revalidate();
    return { ok: true, data: saved };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Status update failed",
    };
  }
}

export async function deleteAnnouncement(
  id: string,
): Promise<AnnouncementActionResult> {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    const removed = demoDeleteAnnouncement(id);
    if (!removed) return { ok: false, error: "Announcement not found" };
  } else {
    const supabase = await createClient();
    if (!supabase) return { ok: false, error: "Supabase unavailable" };
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
  }

  await logActivity({
    admin_id: await getAdminId(),
    action: "announcement.deleted",
    entity_type: "announcement",
    entity_id: id,
  });
  await revalidate();
  return { ok: true };
}

export async function duplicateAnnouncement(
  id: string,
): Promise<AnnouncementActionResult<Announcement>> {
  await requireAdmin();
  const existing = await getAnnouncementById(id);
  if (!existing) return { ok: false, error: "Announcement not found" };

  try {
    const saved = await upsertAnnouncementRecord({
      title_en: `${existing.title_en} (copy)`,
      title_ru: existing.title_ru,
      description_en: existing.description_en,
      description_ru: existing.description_ru,
      announcement_type: existing.announcement_type,
      event_date: existing.event_date,
      start_time: existing.start_time,
      end_time: existing.end_time,
      venue: existing.venue,
      address: existing.address,
      city: existing.city,
      maps_url: existing.maps_url,
      image_url: existing.image_url,
      member_instructions: existing.member_instructions,
      cancelled: false,
      publish_at: null,
      expires_at: existing.expires_at,
      is_pinned: false,
      status: "draft",
      hide_when_expired: existing.hide_when_expired,
    });
    await logActivity({
      admin_id: await getAdminId(),
      action: "meetup.duplicated",
      entity_type: "announcement",
      entity_id: saved.id,
    });
    await revalidate();
    return { ok: true, data: saved };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not duplicate",
    };
  }
}

export async function getAdminAnnouncements(): Promise<Announcement[]> {
  await requireAdmin();
  return listAnnouncements({ includeHidden: true });
}
