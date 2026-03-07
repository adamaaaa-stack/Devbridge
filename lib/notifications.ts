/**
 * In-app notifications. Inserts use service role (no public insert policy).
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type NotificationType =
  | "new_message"
  | "job_application"
  | "workspace_invite"
  | "submission_ready"
  | "submission_reviewed"
  | "test_result";

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string | null;
  link?: string | null;
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<{ id: string } | { error: string }> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: input.user_id,
      type: input.type,
      title: input.title,
      message: input.message ?? null,
      link: input.link ?? null,
      read: false,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data!.id };
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export async function getNotifications(
  userId: string,
  options?: { limit?: number; unreadOnly?: boolean }
): Promise<NotificationRow[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 50);
  if (options?.unreadOnly) {
    query = query.eq("read", false);
  }
  const { data } = await query;
  return (data ?? []) as NotificationRow[];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  return count ?? 0;
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);
  return error ? { error: error.message } : {};
}

export async function markAllNotificationsRead(userId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId);
  return error ? { error: error.message } : {};
}
