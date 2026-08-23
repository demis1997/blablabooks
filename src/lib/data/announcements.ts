import type { Announcement } from "@/types/database";
import { isAnnouncementVisible } from "@/lib/books/announcements";
import {
  appendDemoActivity,
  getDemoAnnouncements,
  mutateDemoStore,
} from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AnnouncementInput } from "@/lib/validations/book";

export type ListAnnouncementsOptions = {
  includeHidden?: boolean;
  now?: Date;
};

/** Published + visible announcements for the public site. */
export async function getPublishedAnnouncements(
  now: Date = new Date(),
): Promise<Announcement[]> {
  return listAnnouncements({ includeHidden: false, now });
}

export async function listAnnouncements(
  options: ListAnnouncementsOptions = {},
): Promise<Announcement[]> {
  const now = options.now ?? new Date();

  if (!isSupabaseConfigured()) {
    const all = getDemoAnnouncements();
    if (options.includeHidden) return all;
    return all.filter((a) => isAnnouncementVisible(a, now));
  }

  const supabase = await createClient();
  if (!supabase) {
    const all = getDemoAnnouncements();
    if (options.includeHidden) return all;
    return all.filter((a) => isAnnouncementVisible(a, now));
  }

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("event_date", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to list announcements: ${error.message}`);
  }

  const rows = (data ?? []) as Announcement[];
  if (options.includeHidden) return rows;
  return rows.filter((a) => isAnnouncementVisible(a, now));
}

export async function getLatestAnnouncement(
  now: Date = new Date(),
): Promise<Announcement | null> {
  const list = await listAnnouncements({ now });
  return list[0] ?? null;
}

export async function getAnnouncementById(
  id: string,
): Promise<Announcement | null> {
  if (!isSupabaseConfigured()) {
    return getDemoAnnouncements().find((a) => a.id === id) ?? null;
  }

  const supabase = await createClient();
  if (!supabase) {
    return getDemoAnnouncements().find((a) => a.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get announcement: ${error.message}`);
  }

  return (data as Announcement | null) ?? null;
}

export async function upsertAnnouncement(
  input: AnnouncementInput,
): Promise<Announcement> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    let saved: Announcement;
    if (input.id) {
      let updated: Announcement | null = null;
      mutateDemoStore((draft) => {
        const index = draft.announcements.findIndex((a) => a.id === input.id);
        if (index === -1) return;
        const current = draft.announcements[index]!;
        const next: Announcement = {
          ...current,
          ...input,
          title_en: input.title_en,
          title_ru: input.title_ru ?? null,
          description_en: input.description_en ?? null,
          description_ru: input.description_ru ?? null,
          maps_url: input.maps_url ?? null,
          image_url: input.image_url ?? null,
          updated_at: now,
        };
        draft.announcements[index] = next;
        updated = next;
      });
      if (!updated) throw new Error(`Announcement not found: ${input.id}`);
      saved = updated;
    } else {
      saved = {
        id: crypto.randomUUID(),
        title_en: input.title_en,
        title_ru: input.title_ru ?? null,
        description_en: input.description_en ?? null,
        description_ru: input.description_ru ?? null,
        announcement_type: input.announcement_type ?? "meetup",
        event_date: input.event_date ?? null,
        start_time: input.start_time ?? null,
        end_time: input.end_time ?? null,
        venue: input.venue ?? null,
        address: input.address ?? null,
        maps_url: input.maps_url ?? null,
        image_url: input.image_url ?? null,
        publish_at: input.publish_at ?? null,
        expires_at: input.expires_at ?? null,
        is_pinned: input.is_pinned ?? false,
        status: input.status ?? "draft",
        hide_when_expired: input.hide_when_expired ?? true,
        created_at: now,
        updated_at: now,
        created_by: null,
      };
      mutateDemoStore((draft) => {
        draft.announcements = [saved, ...draft.announcements];
      });
    }

    appendDemoActivity({
      admin_id: null,
      action: input.id ? "announcement.updated" : "announcement.created",
      entity_type: "announcement",
      entity_id: saved.id,
      details: { title: saved.title_en },
    });
    return saved;
  }

  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase client unavailable");
  }

  if (input.id) {
    const { id, ...rest } = input;
    const { data, error } = await supabase
      .from("announcements")
      .update(rest)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(`Failed to update announcement: ${error.message}`);
    return data as Announcement;
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert(input)
    .select("*")
    .single();
  if (error) throw new Error(`Failed to create announcement: ${error.message}`);
  return data as Announcement;
}
