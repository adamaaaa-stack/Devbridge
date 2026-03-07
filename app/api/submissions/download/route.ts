import { NextResponse } from "next/server";
import { getDownloadUrl } from "@/lib/escrow/submissions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /api/submissions/download?submission_id=...
 * Returns: { url: string } (signed download URL) or 403 if code locked.
 */
export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const submission_id = searchParams.get("submission_id")?.trim();
    if (!submission_id) {
      return NextResponse.json({ error: "submission_id is required" }, { status: 400 });
    }

    const result = await getDownloadUrl(submission_id, user.id);

    if ("error" in result) {
      if (result.error === "Code locked until payment is completed") {
        return NextResponse.json(
          { error: result.error },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ url: result.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Download failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
