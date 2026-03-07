/**
 * Admin moderation: users, jobs, flagged tests. Uses service role.
 */

import { createServiceRoleClient } from "@/lib/supabase/service";

export async function requireAdmin(userId: string): Promise<{ error: string } | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("profiles")
    .select("role, is_banned")
    .eq("id", userId)
    .single();
  if (!data || data.role !== "admin") return { error: "Forbidden" };
  if (data.is_banned) return { error: "Account suspended" };
  return null;
}

export async function listUsers(): Promise<
  Array<{ id: string; display_name: string | null; role: string; is_banned: boolean; created_at: string }>
> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, role, is_banned, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as Array<{ id: string; display_name: string | null; role: string; is_banned: boolean; created_at: string }>;
}

export async function setUserBanned(userId: string, banned: boolean): Promise<{ error?: string }> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: banned })
    .eq("id", userId);
  return error ? { error: error.message } : {};
}

export async function listJobsForAdmin(): Promise<
  Array<{ id: string; title: string; company_id: string; status: string; created_at: string }>
> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("jobs")
    .select("id, title, company_id, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as Array<{ id: string; title: string; company_id: string; status: string; created_at: string }>;
}

export async function deleteJob(jobId: string): Promise<{ error?: string }> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  return error ? { error: error.message } : {};
}

export async function listFlaggedSubmissions(): Promise<
  Array<{
    id: string;
    profile_id: string;
    task_id: string;
    score: number | null;
    passed: boolean;
    time_started: string | null;
    time_submitted: string | null;
    created_at: string;
  }>
> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("test_submissions")
    .select("id, profile_id, task_id, score, passed, time_started, time_submitted, created_at")
    .eq("flagged_for_review", true)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as Array<{
    id: string;
    profile_id: string;
    task_id: string;
    score: number | null;
    passed: boolean;
    time_started: string | null;
    time_submitted: string | null;
    created_at: string;
  }>;
}
