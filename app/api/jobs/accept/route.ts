import { NextResponse } from "next/server";
import { acceptApplication } from "@/lib/jobs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * POST /api/jobs/accept
 * Body: { application_id }
 * Accepts application, creates conversation + workspace, returns workspaceId.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const application_id = typeof body.application_id === "string" ? body.application_id.trim() : "";
    if (!application_id) {
      return NextResponse.json({ error: "application_id is required" }, { status: 400 });
    }

    const result = await acceptApplication(application_id, user.id);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ workspaceId: result.workspaceId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Accept failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
