import { NextResponse } from "next/server";
import { applyToJob, getJobById } from "@/lib/jobs";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notifyJobApplication } from "@/lib/notification-events";

/**
 * POST /api/jobs/apply
 * Body: { job_id, message?, portfolio_link? }
 */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const job_id = typeof body.job_id === "string" ? body.job_id.trim() : "";
    if (!job_id) {
      return NextResponse.json({ error: "job_id is required" }, { status: 400 });
    }

    const result = await applyToJob(user.id, {
      job_id,
      message: body.message ?? null,
      portfolio_link: body.portfolio_link ?? null,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const job = await getJobById(job_id);
    if (job) {
      await notifyJobApplication(job_id, job.company_id, job.title);
    }
    return NextResponse.json({ application: result.application });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Apply failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
