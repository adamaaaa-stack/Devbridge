import { NextResponse } from "next/server";
import { createJob } from "@/lib/jobs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * POST /api/jobs/create
 * Body: { title, description, skill_required?, skill_level?, estimated_hours?, difficulty? }
 */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (!title || !description) {
      return NextResponse.json(
        { error: "title and description are required" },
        { status: 400 }
      );
    }

    const result = await createJob(user.id, {
      title,
      description,
      skill_required: body.skill_required ?? null,
      skill_level: body.skill_level != null ? Number(body.skill_level) : null,
      estimated_hours: body.estimated_hours != null ? Number(body.estimated_hours) : null,
      difficulty: body.difficulty ?? null,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ job: result.job });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
