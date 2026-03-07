import { NextResponse } from "next/server";
import { reviewSubmission } from "@/lib/escrow/submissions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logWorkspaceActivity } from "@/lib/workspace-activity";
import { notifySubmissionReviewed } from "@/lib/notification-events";

/**
 * POST /api/submissions/review
 * Body: { submission_id, approved, review_notes? }
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
    const submission_id = typeof body.submission_id === "string" ? body.submission_id.trim() : "";
    const approved = Boolean(body.approved);
    if (!submission_id) {
      return NextResponse.json({ error: "submission_id is required" }, { status: 400 });
    }

    const result = await reviewSubmission(user.id, {
      submission_id,
      approved,
      review_notes: body.review_notes ?? null,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const { data: sub } = await supabase
      .from("submissions")
      .select("workspace_id, developer_id")
      .eq("id", submission_id)
      .single();
    if (sub) {
      await logWorkspaceActivity(sub.workspace_id, "submission_reviewed", approved ? "Submission approved" : "Changes requested");
      await notifySubmissionReviewed(sub.developer_id, sub.workspace_id, approved);
    }
    return NextResponse.json({ submission: result.submission });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Review failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
