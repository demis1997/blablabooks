import type { ActivityLog } from "@/types/database";
import {
  appendDemoActivity,
  getDemoActivity,
} from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type ListActivityOptions = {
  limit?: number;
  entityType?: string;
};

export async function listActivity(
  options: ListActivityOptions = {},
): Promise<ActivityLog[]> {
  const limit = Math.min(100, Math.max(1, options.limit ?? 25));

  if (!isSupabaseConfigured()) {
    let rows = getDemoActivity();
    if (options.entityType) {
      rows = rows.filter((r) => r.entity_type === options.entityType);
    }
    return rows.slice(0, limit);
  }

  const supabase = await createClient();
  if (!supabase) {
    return getDemoActivity().slice(0, limit);
  }

  let query = supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options.entityType) {
    query = query.eq("entity_type", options.entityType);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to list activity: ${error.message}`);
  }

  return (data ?? []) as ActivityLog[];
}

export type LogActivityInput = {
  admin_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, unknown> | null;
};

export async function logActivity(
  input: LogActivityInput,
): Promise<ActivityLog> {
  if (!isSupabaseConfigured()) {
    return appendDemoActivity({
      admin_id: input.admin_id ?? null,
      action: input.action,
      entity_type: input.entity_type,
      entity_id: input.entity_id ?? null,
      details: input.details ?? null,
    });
  }

  const supabase = await createClient();
  if (!supabase) {
    return appendDemoActivity({
      admin_id: input.admin_id ?? null,
      action: input.action,
      entity_type: input.entity_type,
      entity_id: input.entity_id ?? null,
      details: input.details ?? null,
    });
  }

  const { data, error } = await supabase
    .from("activity_log")
    .insert({
      admin_id: input.admin_id ?? null,
      action: input.action,
      entity_type: input.entity_type,
      entity_id: input.entity_id ?? null,
      details: input.details ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to log activity: ${error.message}`);
  }

  return data as ActivityLog;
}
