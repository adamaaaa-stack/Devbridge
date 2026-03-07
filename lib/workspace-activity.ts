/**
 * Workspace activity timeline. Inserts use service role (participants can read).
 */

import { createServiceRoleClient } from "@/lib/supabase/service";

export type WorkspaceActivityEventType =
  | "workspace_created"
  | "student_invited"
  | "student_accepted"
  | "submission_uploaded"
  | "submission_reviewed"
  | "code_unlocked"
  | "workspace_completed";

export async function logWorkspaceActivity(
  workspaceId: string,
  eventType: WorkspaceActivityEventType,
  description?: string | null
): Promise<{ id: string } | { error: string }> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("workspace_activity")
    .insert({
      workspace_id: workspaceId,
      event_type: eventType,
      description: description ?? null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data!.id };
}

export interface WorkspaceActivityRow {
  id: string;
  workspace_id: string;
  event_type: string;
  description: string | null;
  created_at: string;
}

export async function getWorkspaceActivity(
  workspaceId: string,
  userId: string
): Promise<WorkspaceActivityRow[]> {
  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabaseClient();
  const { data: w } = await supabase
    .from("workspaces")
    .select("company_id, student_id")
    .eq("id", workspaceId)
    .single();
  if (!w || (w.company_id !== userId && w.student_id !== userId)) return [];

  const { data } = await supabase
    .from("workspace_activity")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });
  return (data ?? []) as WorkspaceActivityRow[];
}
