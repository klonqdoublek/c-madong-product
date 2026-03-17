import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationType } from "@/lib/supabase/types";

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title_th: string;
  title_en?: string;
  body_th?: string;
  body_en?: string;
  action_url?: string;
  priority?: number;
  metadata?: Record<string, unknown>;
}

/** Create a single notification (server-side, uses admin client) */
export async function createNotification(
  input: CreateNotificationInput
): Promise<string | null> {
  try {
    const adminDb = createAdminClient();
    const { data, error } = await adminDb
      .from("notifications")
      .insert({
        user_id: input.user_id,
        type: input.type,
        title_th: input.title_th,
        title_en: input.title_en ?? "",
        body_th: input.body_th ?? "",
        body_en: input.body_en ?? "",
        action_url: input.action_url ?? null,
        priority: input.priority ?? 50,
        metadata: input.metadata ?? {},
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Notifications] Insert error:", error);
      return null;
    }
    return data.id;
  } catch (err) {
    console.error("[Notifications] Create error:", err);
    return null;
  }
}

/** Create notifications for multiple users (batch) */
export async function createNotificationBatch(
  inputs: CreateNotificationInput[]
): Promise<number> {
  if (inputs.length === 0) return 0;

  try {
    const adminDb = createAdminClient();
    const rows = inputs.map((input) => ({
      user_id: input.user_id,
      type: input.type,
      title_th: input.title_th,
      title_en: input.title_en ?? "",
      body_th: input.body_th ?? "",
      body_en: input.body_en ?? "",
      action_url: input.action_url ?? null,
      priority: input.priority ?? 50,
      metadata: input.metadata ?? {},
    }));

    const { error, count } = await adminDb
      .from("notifications")
      .insert(rows);

    if (error) {
      console.error("[Notifications] Batch insert error:", error);
      return 0;
    }
    return count ?? inputs.length;
  } catch (err) {
    console.error("[Notifications] Batch create error:", err);
    return 0;
  }
}
