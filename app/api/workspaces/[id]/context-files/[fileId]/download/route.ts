import { NextResponse } from "next/server";
import { getWorkspaceContextFilePath } from "@/lib/workspaces";
import { getWorkspaceContextFileSignedUrl } from "@/lib/workspace-context-storage";

export async function GET(
  _req: Request,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const workspaceId = params.id?.trim();
    const fileId = params.fileId?.trim();
    if (!workspaceId || !fileId) {
      return NextResponse.json({ error: "Workspace ID and file ID required" }, { status: 400 });
    }

    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pathResult = await getWorkspaceContextFilePath(fileId, workspaceId, user.id);
    if ("error" in pathResult) {
      return NextResponse.json({ error: pathResult.error }, { status: 404 });
    }

    const urlResult = await getWorkspaceContextFileSignedUrl(pathResult.file_path);
    if ("error" in urlResult) {
      return NextResponse.json({ error: urlResult.error }, { status: 500 });
    }
    return NextResponse.json({ url: urlResult.url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Download failed" },
      { status: 500 }
    );
  }
}
