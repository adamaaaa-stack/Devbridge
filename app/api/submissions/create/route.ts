import { NextResponse } from "next/server";
import { createSubmission } from "@/lib/escrow/submissions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * POST /api/submissions/create
 * Body: { workspace_id, repo_url?, preview_url?, description? }
 * Returns: { submission: { id, status } }
 */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const workspace_id = typeof body.workspace_id === "string" ? body.workspace_id.trim() : "";
    if (!workspace_id) {
      return NextResponse.json({ error: "workspace_id is required" }, { status: 400 });
    }

    const result = await createSubmission(user.id, {
      workspace_id,
      repo_url: body.repo_url ?? null,
      preview_url: body.preview_url ?? null,
      description: body.description ?? null,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ submission: result.submission });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
