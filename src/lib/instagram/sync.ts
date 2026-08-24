import type { GalleryImage, PublishStatus } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseServiceRole, isSupabaseConfigured } from "@/lib/supabase/env";
import {
  appendDemoActivity,
  getDemoGallery,
  getDemoSettings,
  getDemoStore,
  upsertGalleryImage,
} from "@/lib/demo-data";
import {
  fetchAllInstagramMedia,
  flattenInstagramMedia,
  partitionNewMedia,
  type ImportedMediaDraft,
} from "./media";
import { refreshLongLivedToken } from "./oauth";
import { FRIENDLY_ERRORS } from "@/lib/auth/errors";

export type SyncResult = {
  ok: boolean;
  error?: string;
  fetched: number;
  added: number;
  skipped: number;
  failed: number;
  requiresReconnect?: boolean;
};

function publicStatus(autoPublish: boolean): PublishStatus {
  return autoPublish ? "published" : "draft";
}

async function cacheImageToStorage(
  mediaId: string,
  imageUrl: string,
): Promise<{ publicUrl: string; storagePath: string } | null> {
  if (!isSupabaseConfigured()) {
    return { publicUrl: imageUrl, storagePath: `instagram/${mediaId}` };
  }

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";
    const storagePath = `instagram/${mediaId}.${ext}`;
    const admin = createAdminClient();
    const { error } = await admin.storage
      .from("gallery")
      .upload(storagePath, bytes, {
        contentType,
        upsert: true,
      });
    if (error) return { publicUrl: imageUrl, storagePath };
    const { data } = admin.storage.from("gallery").getPublicUrl(storagePath);
    return { publicUrl: data.publicUrl, storagePath };
  } catch {
    return { publicUrl: imageUrl, storagePath: `instagram/${mediaId}` };
  }
}

function draftToGalleryImage(
  draft: ImportedMediaDraft,
  cached: { publicUrl: string; storagePath: string },
  autoPublish: boolean,
  sortOrder: number,
): GalleryImage {
  const now = new Date().toISOString();
  const created = draft.timestamp ?? now;
  return {
    id: crypto.randomUUID(),
    event_id: null,
    storage_path: cached.storagePath,
    optimized_path: null,
    public_url: cached.publicUrl,
    caption_en: draft.caption,
    caption_ru: null,
    alt_text: draft.caption ?? "Bla Bla Books Instagram photo",
    event_date: created.slice(0, 10),
    location: null,
    sort_order: sortOrder,
    is_featured: false,
    status: publicStatus(autoPublish),
    width: null,
    height: null,
    created_at: now,
    updated_at: now,
    uploaded_by: null,
    source: "instagram",
    instagram_media_id: draft.instagram_media_id,
    instagram_permalink: draft.permalink,
    reviewed: false,
  };
}

export async function synchronizeInstagramMedia(
  triggeredBy: "manual" | "cron" = "manual",
): Promise<SyncResult> {
  const empty: SyncResult = {
    ok: true,
    fetched: 0,
    added: 0,
    skipped: 0,
    failed: 0,
  };

  if (!isSupabaseConfigured()) {
    const store = getDemoStore();
    if (!store.instagramToken || !store.instagram) {
      return { ...empty, ok: false, error: FRIENDLY_ERRORS.instagramNotConfigured };
    }
    return { ...empty, ok: true };
  }

  if (!hasSupabaseServiceRole()) {
    return { ...empty, ok: false, error: FRIENDLY_ERRORS.instagramNotConfigured };
  }

  const admin = createAdminClient();
  const { data: connection, error: connError } = await admin
    .from("instagram_connections")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (connError || !connection) {
    return { ...empty, ok: false, error: FRIENDLY_ERRORS.instagramNotConfigured };
  }

  if (connection.requires_reconnect) {
    return {
      ...empty,
      ok: false,
      requiresReconnect: true,
      error: FRIENDLY_ERRORS.instagramReconnect,
    };
  }

  const settings = (
    await admin.from("site_settings").select("*").limit(1).maybeSingle()
  ).data;
  const autoPublish = Boolean(settings?.instagram_auto_publish);

  try {
    const refreshed = await refreshLongLivedToken(connection.access_token);
    if (refreshed) {
      await admin
        .from("instagram_connections")
        .update({
          access_token: refreshed.accessToken,
          token_expires_at: new Date(
            Date.now() + refreshed.expiresIn * 1000,
          ).toISOString(),
          requires_reconnect: false,
        })
        .eq("id", connection.id);
      connection.access_token = refreshed.accessToken;
    }

    const media = await fetchAllInstagramMedia(
      connection.access_token,
      connection.instagram_user_id,
    );
    const drafts = flattenInstagramMedia(media);

    const { data: existingRows } = await admin
      .from("gallery_images")
      .select("instagram_media_id")
      .not("instagram_media_id", "is", null);

    const existingIds = new Set(
      (existingRows ?? [])
        .map((row) => row.instagram_media_id as string | null)
        .filter((id): id is string => Boolean(id)),
    );
    const { fresh, skipped } = partitionNewMedia(drafts, existingIds);

    const { data: maxRow } = await admin
      .from("gallery_images")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    let order = (maxRow?.sort_order as number | undefined) ?? -1;

    let added = 0;
    let failed = 0;
    for (const draft of fresh) {
      const cached = await cacheImageToStorage(
        draft.instagram_media_id,
        draft.image_url,
      );
      if (!cached) {
        failed += 1;
        continue;
      }
      order += 1;
      const image = draftToGalleryImage(draft, cached, autoPublish, order);
      const { error } = await admin.from("gallery_images").insert(image);
      if (error) {
        if (error.message.toLowerCase().includes("duplicate")) {
          // idempotent
        } else {
          failed += 1;
        }
      } else {
        added += 1;
      }
    }

    const message = added
      ? `Imported ${added} new photo${added === 1 ? "" : "s"}.`
      : "No new photos to import.";

    await admin
      .from("instagram_connections")
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: failed && !added ? "failed" : "ok",
        last_sync_message: message,
        requires_reconnect: false,
      })
      .eq("id", connection.id);

    await admin.from("instagram_sync_logs").insert({
      connection_id: connection.id,
      triggered_by: triggeredBy,
      status: failed && !added ? "failed" : "ok",
      fetched_count: drafts.length,
      added_count: added,
      skipped_count: skipped,
      failed_count: failed,
      message,
    });

    return {
      ok: true,
      fetched: drafts.length,
      added,
      skipped,
      failed,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    const oauthFail = /oauth|token|190|102/i.test(message);

    await admin
      .from("instagram_connections")
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: "failed",
        last_sync_message: FRIENDLY_ERRORS.instagramSync,
        requires_reconnect: oauthFail,
      })
      .eq("id", connection.id);

    await admin.from("instagram_sync_logs").insert({
      connection_id: connection.id,
      triggered_by: triggeredBy,
      status: "failed",
      message: FRIENDLY_ERRORS.instagramSync,
    });

    return {
      ok: false,
      fetched: 0,
      added: 0,
      skipped: 0,
      failed: 0,
      requiresReconnect: oauthFail,
      error: oauthFail
        ? FRIENDLY_ERRORS.instagramReconnect
        : FRIENDLY_ERRORS.instagramSync,
    };
  }
}

export function existingInstagramIdsFromGallery(
  images: Pick<GalleryImage, "instagram_media_id">[],
): Set<string> {
  return new Set(
    images
      .map((img) => img.instagram_media_id)
      .filter((id): id is string => Boolean(id)),
  );
}

/** Demo-mode helper used by tests / local UI without Meta. */
export function importDraftsToDemo(
  drafts: ImportedMediaDraft[],
  autoPublish = false,
): SyncResult {
  const existing = existingInstagramIdsFromGallery(getDemoGallery());
  const { fresh, skipped } = partitionNewMedia(drafts, existing);
  const settings = getDemoSettings();
  const publish = autoPublish || settings.instagram_auto_publish;
  let order = getDemoGallery().reduce((m, img) => Math.max(m, img.sort_order), -1);
  let added = 0;
  for (const draft of fresh) {
    order += 1;
    upsertGalleryImage(
      draftToGalleryImage(
        draft,
        { publicUrl: draft.image_url, storagePath: `instagram/${draft.instagram_media_id}` },
        publish,
        order,
      ),
    );
    added += 1;
  }
  appendDemoActivity({
    admin_id: null,
    action: "instagram.sync",
    entity_type: "instagram",
    entity_id: null,
    details: { added, skipped },
  });
  return { ok: true, fetched: drafts.length, added, skipped, failed: 0 };
}
