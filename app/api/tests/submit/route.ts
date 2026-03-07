import { NextResponse } from "next/server";
import { evaluateSubmission } from "@/lib/skill-tests/evaluate";
import {
  checkAttemptAllowed,
  getTaskById,
  setDeveloperSkillLevel,
} from "@/lib/skill-tests";
import { hashCode, hasDuplicateHash, isSuspiciousSolveTime } from "@/lib/skill-tests/anti-cheat";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { notifyTestResult } from "@/lib/notification-events";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const task_id = typeof body.task_id === "string" ? body.task_id.trim() : "";
    const code_submission = typeof body.code_submission === "string" ? body.code_submission : "";
    const time_started = typeof body.time_started === "string" ? body.time_started.trim() || null : null;

    if (!task_id || !code_submission) {
      return NextResponse.json(
        { error: "task_id and code_submission are required" },
        { status: 400 }
      );
    }

    const profileId = user.id;
    const time_submitted = new Date().toISOString();
    const code_hash = hashCode(code_submission);
    const duplicateHash = await hasDuplicateHash(task_id, code_hash);
    const suspiciousTime = isSuspiciousSolveTime(time_started, time_submitted);
    const flagged_for_review = duplicateHash || suspiciousTime;

    const allowed = await checkAttemptAllowed(profileId, task_id);
    if (!allowed.allowed) {
      return NextResponse.json({ error: allowed.reason }, { status: 429 });
    }

    const taskData = await getTaskById(task_id, user.id);
    if (!taskData) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const { task, skill_id, level } = taskData;
    const evaluation = await evaluateSubmission(task.prompt, code_submission);

    const service = createServiceRoleClient();
    const { error: insertError } = await service.from("test_submissions").insert({
      profile_id: profileId,
      task_id,
      code_submission,
      score: evaluation.score,
      passed: evaluation.passed,
      ai_feedback: evaluation.feedback,
      time_started: time_started || null,
      time_submitted,
      code_hash,
      flagged_for_review,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    if (evaluation.passed) {
      const current = await supabase
        .from("developer_skill_levels")
        .select("current_level")
        .eq("profile_id", profileId)
        .eq("skill_id", skill_id)
        .maybeSingle();
      const currentLevel = (current.data?.current_level as number) ?? 0;
      const newLevel = Math.max(currentLevel, level);
      await setDeveloperSkillLevel(profileId, skill_id, newLevel);
    }

    await notifyTestResult(
      profileId,
      task.title,
      evaluation.passed,
      "/tests"
    );

    return NextResponse.json({
      score: evaluation.score,
      passed: evaluation.passed,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Submit failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
