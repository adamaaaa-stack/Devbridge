import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateWorkspaceContext } from "@/lib/workspaces";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspaceId = params.id?.trim();
    if (!workspaceId) return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const context = typeof body.context === "string" ? body.context : undefined;
    const run_instructions = typeof body.run_instructions === "string" ? body.run_instructions : undefined;
    if (context === undefined && run_instructions === undefined) {
      return NextResponse.json({ error: "Provide context and/or run_instructions" }, { status: 400 });
    }

    const result = await updateWorkspaceContext(workspaceId, user.id, {
      context,
      run_instructions,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 500 }
    );
  }
}
