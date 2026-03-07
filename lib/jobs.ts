import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOrCreateConversation } from "@/lib/messaging";
import { createWorkspaceFromConversation } from "@/lib/workspaces";
import type { JobDb, JobApplicationDb } from "@/lib/types";

export async function createJob(
  companyUserId: string,
  input: {
    title: string;
    description: string;
    skill_required?: string | null;
    skill_level?: number | null;
    estimated_hours?: number | null;
    difficulty?: string | null;
  }
): Promise<{ job: JobDb } | { error: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== companyUserId) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "company") return { error: "Only companies can post jobs" };

  const title = input.title?.trim();
  const description = input.description?.trim();
  if (!title || !description) return { error: "Title and description are required" };

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      company_id: user.id,
      title,
      description,
      skill_required: input.skill_required?.trim() || null,
      skill_level: input.skill_level ?? null,
      estimated_hours: input.estimated_hours ?? null,
      difficulty: input.difficulty?.trim() || null,
      status: "open",
    })
    .select("*")
    .single();

  if (error) return { error: error.message };
  return { job: job as JobDb };
}

export interface ListJobsFilters {
  skill?: string | null;
  difficulty?: string | null;
  estimated_hours_max?: number | null;
  search?: string | null;
}

export async function listOpenJobs(filters?: ListJobsFilters): Promise<
  Array<JobDb & { company_name?: string | null }>
> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("jobs")
    .select("id, company_id, title, description, skill_required, skill_level, estimated_hours, difficulty, status, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  const skill = filters?.skill?.trim();
  if (skill) {
    query = query.ilike("skill_required", `%${skill}%`);
  }
  const difficulty = filters?.difficulty?.trim();
  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }
  const hoursMax = filters?.estimated_hours_max;
  if (hoursMax != null && hoursMax > 0) {
    query = query.lte("estimated_hours", hoursMax);
  }
  const search = filters?.search?.trim();
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: rows } = await query;

  if (!rows?.length) return [];

  const companyIds = Array.from(new Set(rows.map((r: { company_id: string }) => r.company_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", companyIds);
  const nameByCompany = new Map(
    (profiles ?? []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name])
  );

  return rows.map((r) => ({
    ...r,
    company_name: nameByCompany.get(r.company_id) ?? null,
  })) as Array<JobDb & { company_name?: string | null }>;
}

export async function getJobById(
  jobId: string,
  _userId?: string
): Promise<(JobDb & { company_name?: string | null }) | null> {
  const supabase = await createServerSupabaseClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();
  if (!job) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", job.company_id)
    .single();

  return {
    ...job,
    company_name: profile?.display_name ?? null,
  } as JobDb & { company_name?: string | null };
}

export async function applyToJob(
  developerUserId: string,
  input: { job_id: string; message?: string | null; portfolio_link?: string | null }
): Promise<{ application: JobApplicationDb } | { error: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== developerUserId) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "student") return { error: "Only developers can apply" };

  const { data: job } = await supabase
    .from("jobs")
    .select("id, status")
    .eq("id", input.job_id)
    .single();
  if (!job) return { error: "Job not found" };
  if (job.status !== "open") return { error: "Job is no longer open" };

  const { data: app, error } = await supabase
    .from("job_applications")
    .insert({
      job_id: input.job_id,
      developer_id: user.id,
      message: input.message?.trim() || null,
      portfolio_link: input.portfolio_link?.trim() || null,
      status: "applied",
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "You have already applied to this job" };
    return { error: error.message };
  }
  return { application: app as JobApplicationDb };
}

export async function getApplicationsForJob(
  jobId: string,
  companyUserId: string
): Promise<
  Array<
    JobApplicationDb & {
      developer_name?: string | null;
      developer_bio?: string | null;
    }
  >
> {
  const supabase = await createServerSupabaseClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("company_id")
    .eq("id", jobId)
    .single();
  if (!job || job.company_id !== companyUserId) return [];

  const { data: rows } = await supabase
    .from("job_applications")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (!rows?.length) return [];

  const devIds = Array.from(new Set(rows.map((r: { developer_id: string }) => r.developer_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, bio")
    .in("id", devIds);
  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; display_name: string | null; bio: string | null }) => [
      p.id,
      { display_name: p.display_name, bio: p.bio },
    ])
  );

  return rows.map((r) => {
    const p = profileMap.get(r.developer_id);
    return {
      ...r,
      developer_name: p?.display_name ?? null,
      developer_bio: p?.bio ?? null,
    };
  }) as Array<
    JobApplicationDb & {
      developer_name?: string | null;
      developer_bio?: string | null;
    }
  >;
}

export async function getMyApplicationForJob(
  jobId: string,
  developerUserId: string
): Promise<JobApplicationDb | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("job_applications")
    .select("*")
    .eq("job_id", jobId)
    .eq("developer_id", developerUserId)
    .maybeSingle();
  return data as JobApplicationDb | null;
}

export async function acceptApplication(
  applicationId: string,
  companyUserId: string
): Promise<{ workspaceId: string } | { error: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== companyUserId) return { error: "Unauthorized" };

  const { data: app } = await supabase
    .from("job_applications")
    .select("id, job_id, developer_id, status")
    .eq("id", applicationId)
    .single();
  if (!app) return { error: "Application not found" };
  if (app.status === "accepted") return { error: "Application already accepted" };

  const { data: job } = await supabase
    .from("jobs")
    .select("id, company_id, title, description, skill_required")
    .eq("id", app.job_id)
    .single();
  if (!job || job.company_id !== user.id) return { error: "Not your job" };

  const convResult = await getOrCreateConversation(app.developer_id);
  if ("error" in convResult) return { error: convResult.error };

  const workspaceResult = await createWorkspaceFromConversation({
    conversation_id: convResult.conversationId,
    company_id: job.company_id,
    student_id: app.developer_id,
    title: job.title,
    description: job.description,
    tech_stack: job.skill_required ? [job.skill_required] : [],
    total_budget: 1,
  });
  if ("error" in workspaceResult) return { error: workspaceResult.error };

  await supabase
    .from("job_applications")
    .update({ status: "accepted" })
    .eq("id", applicationId);

  await supabase
    .from("jobs")
    .update({ status: "in_progress" })
    .eq("id", job.id);

  return { workspaceId: workspaceResult.workspace.id };
}
