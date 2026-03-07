import { NextResponse } from "next/server";
import { processSubmissionPayment } from "@/lib/escrow/submissions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * POST /api/submissions/unlock
 * Body: { submission_id }
 * Stub payment: marks escrow as paid and releases code. Company only.
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
    if (!submission_id) {
      return NextResponse.json({ error: "submission_id is required" }, { status: 400 });
    }

    const { data: sub } = await supabase
      .from("submissions")
      .select("id, workspace_id")
      .eq("id", submission_id)
      .single();
    if (!sub) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const { data: w } = await supabase
      .from("workspaces")
      .select("company_id")
      .eq("id", sub.workspace_id)
      .single();
    if (!w || w.company_id !== user.id) {
      return NextResponse.json(
        { error: "Only the company can unlock code (after payment)" },
        { status: 403 }
      );
    }

    const result = await processSubmissionPayment(submission_id, user.id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, paymentId: result.paymentId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unlock failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
