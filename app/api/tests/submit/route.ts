import { NextResponse } from "next/server";
import { evaluateSubmission } from "@/lib/skill-tests/evaluate";
import {
  checkAttemptAllowed,
  getTaskById,
  setDeveloperSkillLevel,
} from "@/lib/skill-tests";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

    if (!task_id || !code_submission) {
      return NextResponse.json(
        { error: "task_id and code_submission are required" },
        { status: 400 }
      );
    }

    // Resolve profile id (same as user id in this app)
    const profileId = user.id;

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

    const { error: insertError } = await supabase.from("test_submissions").insert({
      profile_id: profileId,
      task_id,
      code_submission,
      score: evaluation.score,
      passed: evaluation.passed,
      ai_feedback: evaluation.feedback,
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
