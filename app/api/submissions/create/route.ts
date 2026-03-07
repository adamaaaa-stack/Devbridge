import { NextResponse } from "next/server";
import { createSubmission } from "@/lib/escrow/submissions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logWorkspaceActivity } from "@/lib/workspace-activity";
import { notifySubmissionReady } from "@/lib/notification-events";

/**
 * POST /api/submissions/create
 * Body: { workspace_id, repo_url?, description? }
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
      description: body.description ?? null,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const { data: w } = await supabase
      .from("workspaces")
      .select("company_id, title")
      .eq("id", workspace_id)
      .single();
    if (w) {
      await logWorkspaceActivity(workspace_id, "submission_uploaded", "Solution submitted");
      await notifySubmissionReady(workspace_id, w.company_id, w.title);
    }
    return NextResponse.json({ submission: result.submission });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
