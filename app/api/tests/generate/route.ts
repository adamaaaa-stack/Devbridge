import { NextResponse } from "next/server";
import { generateSkillTask } from "@/lib/skill-tests/generate";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const skill = typeof body.skill === "string" ? body.skill.trim() : "";
    const level = typeof body.level === "number" ? body.level : parseInt(String(body.level), 10);

    if (!skill) {
      return NextResponse.json({ error: "skill is required" }, { status: 400 });
    }
    if (Number.isNaN(level) || level < 1 || level > 10) {
      return NextResponse.json({ error: "level must be 1–10" }, { status: 400 });
    }

    const result = await generateSkillTask(skill, level, user.id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ task: result.task });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generate failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
