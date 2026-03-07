import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createPreviewDeployment } from "@/lib/vercel/deploy";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const submission_id = typeof body.submission_id === "string" ? body.submission_id.trim() : "";
    if (!submission_id) return NextResponse.json({ error: "submission_id is required" }, { status: 400 });

    const { data: sub } = await supabase
      .from("submissions")
      .select("id, developer_id, repo_url")
      .eq("id", submission_id)
      .single();

    if (!sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    if (sub.developer_id !== user.id) {
      return NextResponse.json({ error: "Only the submission developer can build the preview" }, { status: 403 });
    }
    if (!sub.repo_url?.trim()) {
      return NextResponse.json(
        { error: "Preview requires a repo URL. Add your GitHub repo URL to this submission." },
        { status: 400 }
      );
    }

    const result = await createPreviewDeployment(submission_id, sub.repo_url);
    if ("error" in result) {
      return NextResponse.json({ error: result.error, preview_status: "failed" }, { status: 400 });
    }
    return NextResponse.json({
      deployment_id: result.deploymentId,
      preview_url: result.previewUrl,
      preview_status: "building",
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Build failed" }, { status: 500 });
  }
}
