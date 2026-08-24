import type {
  InstagramConnectionPublic,
  InstagramSyncLog,
} from "@/types/database";
import { getDemoStore, mutateDemoStore, appendDemoActivity } from "@/lib/demo-data";
import {
  hasSupabaseServiceRole,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";

type ConnectionRow = {
  id: string;
  instagram_user_id: string;
  username: string | null;
  profile_picture_url: string | null;
  access_token: string;
  token_expires_at: string | null;
  requires_reconnect: boolean;
  last_synced_at: string | null;
  last_sync_status: string | null;
  last_sync_message: string | null;
};

export function toPublicConnection(
  row: Omit<ConnectionRow, "access_token"> & { access_token?: string },
): InstagramConnectionPublic {
  return {
    id: row.id,
    instagram_user_id: row.instagram_user_id,
    username: row.username,
    profile_picture_url: row.profile_picture_url,
    token_expires_at: row.token_expires_at,
    requires_reconnect: row.requires_reconnect,
    last_synced_at: row.last_synced_at,
    last_sync_status: row.last_sync_status,
    last_sync_message: row.last_sync_message,
    connected: true,
  };
}

export async function getInstagramPublicStatus(): Promise<InstagramConnectionPublic | null> {
  if (!isSupabaseConfigured()) {
    return getDemoStore().instagram;
  }
  if (!hasSupabaseServiceRole()) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("instagram_connections")
    .select(
      "id, instagram_user_id, username, profile_picture_url, token_expires_at, requires_reconnect, last_synced_at, last_sync_status, last_sync_message",
    )
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return toPublicConnection(data as ConnectionRow);
}

export async function getInstagramSyncLogs(
  limit = 8,
): Promise<InstagramSyncLog[]> {
  if (!isSupabaseConfigured()) {
    return getDemoStore().instagramLogs.slice(0, limit);
  }
  if (!hasSupabaseServiceRole()) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("instagram_sync_logs")
    .select(
      "id, connection_id, triggered_by, status, fetched_count, added_count, skipped_count, failed_count, message, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as InstagramSyncLog[];
}

export async function saveInstagramConnection(input: {
  instagramUserId: string;
  username: string | null;
  profilePictureUrl: string | null;
  accessToken: string;
  expiresIn: number;
  connectedBy: string | null;
  replace: boolean;
}): Promise<InstagramConnectionPublic> {
  const expiresAt = new Date(Date.now() + input.expiresIn * 1000).toISOString();

  if (!isSupabaseConfigured()) {
    const publicRow: InstagramConnectionPublic = {
      id: crypto.randomUUID(),
      instagram_user_id: input.instagramUserId,
      username: input.username,
      profile_picture_url: input.profilePictureUrl,
      token_expires_at: expiresAt,
      requires_reconnect: false,
      last_synced_at: null,
      last_sync_status: null,
      last_sync_message: null,
      connected: true,
    };
    mutateDemoStore((draft) => {
      draft.instagram = publicRow;
      draft.instagramToken = input.accessToken;
    });
    appendDemoActivity({
      admin_id: input.connectedBy,
      action: "instagram.connected",
      entity_type: "instagram",
      entity_id: publicRow.id,
      details: { username: input.username },
    });
    return publicRow;
  }

  const admin = createAdminClient();
  if (input.replace) {
    await admin.from("instagram_connections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }

  const { data, error } = await admin
    .from("instagram_connections")
    .upsert(
      {
        instagram_user_id: input.instagramUserId,
        username: input.username,
        profile_picture_url: input.profilePictureUrl,
        access_token: input.accessToken,
        token_expires_at: expiresAt,
        requires_reconnect: false,
        connected_by: input.connectedBy,
        last_sync_status: "pending",
        last_sync_message: "Connected. First sync starting.",
      },
      { onConflict: "instagram_user_id" },
    )
    .select(
      "id, instagram_user_id, username, profile_picture_url, token_expires_at, requires_reconnect, last_synced_at, last_sync_status, last_sync_message",
    )
    .single();

  if (error || !data) {
    throw new Error("Could not save the Instagram connection.");
  }

  return toPublicConnection(data as ConnectionRow);
}

export async function deleteInstagramConnection(): Promise<void> {
  if (!isSupabaseConfigured()) {
    mutateDemoStore((draft) => {
      draft.instagram = null;
      draft.instagramToken = null;
    });
    appendDemoActivity({
      admin_id: null,
      action: "instagram.disconnected",
      entity_type: "instagram",
      entity_id: null,
      details: {},
    });
    return;
  }
  const admin = createAdminClient();
  await admin.from("instagram_connections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}

export async function getExistingInstagramUserId(): Promise<string | null> {
  const status = await getInstagramPublicStatus();
  return status?.instagram_user_id ?? null;
}
