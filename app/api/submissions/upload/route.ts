import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { uploadSubmissionCode } from "@/lib/escrow/storage";
import { setSubmissionCodePath } from "@/lib/escrow/submissions";

/**
 * POST /api/submissions/upload
 * FormData: submission_id, workspace_id, file (ZIP)
 * Only the workspace developer can upload. Stores to code_submissions/{workspace_id}/{submission_id}/source.zip
 */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const submission_id = (formData.get("submission_id") as string)?.trim();
    const workspace_id = (formData.get("workspace_id") as string)?.trim();
    const file = formData.get("file") as File | null;

    if (!submission_id || !workspace_id) {
      return NextResponse.json(
        { error: "submission_id and workspace_id are required" },
        { status: 400 }
      );
    }
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "file (ZIP) is required" },
        { status: 400 }
      );
    }

    const { data: w } = await supabase
      .from("workspaces")
      .select("id, student_id")
      .eq("id", workspace_id)
      .single();
    if (!w || w.student_id !== user.id) {
      return NextResponse.json(
        { error: "Only the workspace developer can upload code" },
        { status: 403 }
      );
    }

    const { data: sub } = await supabase
      .from("submissions")
      .select("id, developer_id")
      .eq("id", submission_id)
      .eq("workspace_id", workspace_id)
      .single();
    if (!sub || sub.developer_id !== user.id) {
      return NextResponse.json({ error: "Submission not found or not yours" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadSubmissionCode(workspace_id, submission_id, buffer, file.type || "application/zip");
    if ("error" in uploadResult) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 });
    }

    const pathResult = await setSubmissionCodePath(submission_id, user.id, uploadResult.path);
    if ("error" in pathResult) {
      return NextResponse.json({ error: pathResult.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, path: uploadResult.path });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
