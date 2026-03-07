import { NextResponse } from "next/server";
import { listOpenJobs } from "@/lib/jobs";

/**
 * GET /api/jobs/list
 * Returns open jobs.
 */
export async function GET() {
  try {
    const jobs = await listOpenJobs();
    return NextResponse.json({ jobs });
  } catch (e) {
    const message = e instanceof Error ? e.message : "List failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
