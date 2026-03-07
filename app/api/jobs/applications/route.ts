import { NextResponse } from "next/server";
import { getApplicationsForJob } from "@/lib/jobs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /api/jobs/applications?job_id=...
 * Returns applications for the job (company only).
 */
export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const job_id = searchParams.get("job_id")?.trim();
    if (!job_id) {
      return NextResponse.json({ error: "job_id is required" }, { status: 400 });
    }

    const applications = await getApplicationsForJob(job_id, user.id);
    return NextResponse.json({ applications });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
