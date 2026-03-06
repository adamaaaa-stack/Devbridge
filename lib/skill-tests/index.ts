/**
 * Skill test helpers: level progression, attempt limits (3 per level, 1h cooldown).
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DeveloperSkillLevelDb, SkillTaskDb } from "@/lib/types";

const MAX_ATTEMPTS_PER_LEVEL = 3;
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

/** Get current level per skill for a profile (0 = not started). */
export async function getDeveloperSkillLevels(
  profileId: string
): Promise<DeveloperSkillLevelDb[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("developer_skill_levels")
    .select("*")
    .eq("profile_id", profileId);
  if (error) return [];
  return (data ?? []) as DeveloperSkillLevelDb[];
}

/** Get level for one skill; returns 0 if never attempted. */
export async function getDeveloperLevelForSkill(
  profileId: string,
  skillId: string
): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("developer_skill_levels")
    .select("current_level")
    .eq("profile_id", profileId)
    .eq("skill_id", skillId)
    .maybeSingle();
  return (data?.current_level as number) ?? 0;
}

/** Upsert developer_skill_levels: set current_level (e.g. after pass). */
export async function setDeveloperSkillLevel(
  profileId: string,
  skillId: string,
  currentLevel: number
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.from("developer_skill_levels").upsert(
    {
      profile_id: profileId,
      skill_id: skillId,
      current_level: Math.max(0, Math.min(10, currentLevel)),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_id,skill_id" }
  );
}

/** Count attempts for this profile + task in recent history. */
async function countAttemptsForTask(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  profileId: string,
  taskId: string
): Promise<number> {
  const { count } = await supabase
    .from("test_submissions")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("task_id", taskId);
  return count ?? 0;
}

/** Get last submission time for this profile + task (for cooldown). */
async function getLastSubmissionAt(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  profileId: string,
  taskId: string
): Promise<Date | null> {
  const { data } = await supabase
    .from("test_submissions")
    .select("created_at")
    .eq("profile_id", profileId)
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data?.created_at) return null;
  return new Date(data.created_at as string);
}

/**
 * Check if profile can attempt this task: max 3 attempts, 1h cooldown.
 * Returns { allowed: true } or { allowed: false, reason: string }.
 */
export async function checkAttemptAllowed(
  profileId: string,
  taskId: string
): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  const supabase = await createServerSupabaseClient();
  const count = await countAttemptsForTask(supabase, profileId, taskId);
  if (count >= MAX_ATTEMPTS_PER_LEVEL) {
    return { allowed: false, reason: "Maximum 3 attempts per level. Try again later or move to the next level." };
  }
  const lastAt = await getLastSubmissionAt(supabase, profileId, taskId);
  if (lastAt && Date.now() - lastAt.getTime() < COOLDOWN_MS) {
    const waitMins = Math.ceil((COOLDOWN_MS - (Date.now() - lastAt.getTime())) / 60000);
    return { allowed: false, reason: `Wait ${waitMins} minute(s) before trying again (1 hour cooldown).` };
  }
  return { allowed: true };
}

/**
 * Get task by id with skill_level and skill for display.
 */
export async function getTaskById(
  taskId: string,
  userId: string
): Promise<{
  task: SkillTaskDb & { skill_name?: string; level?: number };
  skill_id: string;
  level: number;
} | null> {
  const supabase = await createServerSupabaseClient();
  const { data: taskRow } = await supabase
    .from("skill_tasks")
    .select(`
      id,
      skill_level_id,
      title,
      prompt,
      description,
      requirements,
      expected_output,
      evaluation_rules,
      skill_levels ( level, skill_id, skills ( name ) )
    `)
    .eq("id", taskId)
    .single();

  if (!taskRow) return null;

  const slRaw = taskRow.skill_levels as
    | { level: number; skill_id: string; skills: { name: string } | { name: string }[] | null }
    | { level: number; skill_id: string; skills: { name: string } | { name: string }[] | null }[]
    | null;
  const sl = Array.isArray(slRaw) ? slRaw[0] ?? null : slRaw;
  const skillId = sl?.skill_id ?? "";
  const level = sl?.level ?? 0;
  const skillsRef = sl?.skills;
  const skillName = Array.isArray(skillsRef) ? skillsRef[0]?.name ?? "" : skillsRef?.name ?? "";

  return {
    task: {
      id: taskRow.id,
      skill_level_id: taskRow.skill_level_id,
      title: taskRow.title,
      prompt: taskRow.prompt,
      description: taskRow.description ?? null,
      requirements: (taskRow.requirements as string[]) ?? [],
      expected_output: taskRow.expected_output ?? null,
      evaluation_rules: taskRow.evaluation_rules ?? null,
      generated_by_ai: true,
      created_at: "",
      skill_name: skillName,
      level,
    } as SkillTaskDb & { skill_name?: string; level?: number },
    skill_id: skillId,
    level,
  };
}
