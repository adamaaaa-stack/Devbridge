import { NextResponse } from "next/server";
import { getTaskById } from "@/lib/skill-tests";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const task_id = searchParams.get("task_id")?.trim();
    if (!task_id) {
      return NextResponse.json({ error: "task_id required" }, { status: 400 });
    }

    const data = await getTaskById(task_id, user.id);
    if (!data) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task: data.task, skill_id: data.skill_id, level: data.level });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load task";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
