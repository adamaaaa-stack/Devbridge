import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getWorkspaceContextFiles, createWorkspaceContextFileRecord } from "@/lib/workspaces";
import { uploadWorkspaceContextFile } from "@/lib/workspace-context-storage";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspaceId = params.id?.trim();
    if (!workspaceId) return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });

    const files = await getWorkspaceContextFiles(workspaceId, user.id);
    return NextResponse.json({ files });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "List failed" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspaceId = params.id?.trim();
    if (!workspaceId) return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });

    const { data: w } = await supabase
      .from("workspaces")
      .select("company_id")
      .eq("id", workspaceId)
      .single();
    if (!w || w.company_id !== user.id) {
      return NextResponse.json({ error: "Only the company can upload context files" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name || "file";
    const contentType = file.type || "application/octet-stream";
    const uploadResult = await uploadWorkspaceContextFile(
      workspaceId,
      buffer,
      filename,
      contentType
    );
    if ("error" in uploadResult) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 });
    }

    const recordResult = await createWorkspaceContextFileRecord(
      workspaceId,
      uploadResult.path,
      user.id
    );
    if ("error" in recordResult) {
      return NextResponse.json({ error: recordResult.error }, { status: 500 });
    }

    return NextResponse.json({
      id: recordResult.id,
      file_path: uploadResult.path,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
