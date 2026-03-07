import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

const CODE_BUCKET = "code_submissions";

/**
 * POST /api/submissions/upload-url
 * Body: { submission_id, filename? }
 * Returns: { url: string, storage_path: string } for client to PUT the file.
 * Developer-only. Sets submission.code_storage_path when URL is generated.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const submission_id = typeof body.submission_id === "string" ? body.submission_id.trim() : "";
    const filename = typeof body.filename === "string" ? body.filename.trim() || "source.zip" : "source.zip";
    if (!submission_id) return NextResponse.json({ error: "submission_id is required" }, { status: 400 });

    const { data: sub } = await supabase
      .from("submissions")
      .select("id, workspace_id, developer_id")
      .eq("id", submission_id)
      .single();
    if (!sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    if (sub.developer_id !== user.id) {
      return NextResponse.json({ error: "Only the submission developer can upload" }, { status: 403 });
    }

    const storagePath = `${sub.workspace_id}/${submission_id}/${filename}`;
    const service = createServiceRoleClient();
    const { data: signed, error: signError } = await service.storage
      .from(CODE_BUCKET)
      .createSignedUploadUrl(storagePath, { upsert: true });

    if (signError || !signed?.signedUrl) {
      return NextResponse.json(
        { error: signError?.message ?? "Failed to create upload URL" },
        { status: 500 }
      );
    }

    await service
      .from("submissions")
      .update({ code_storage_path: storagePath })
      .eq("id", submission_id);

    return NextResponse.json({
      url: signed.signedUrl,
      storage_path: signed.path,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
