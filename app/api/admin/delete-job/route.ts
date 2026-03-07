import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, deleteJob } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const forbidden = await requireAdmin(user.id);
    if (forbidden) return NextResponse.json({ error: forbidden.error }, { status: 403 });

    const body = await req.json();
    const job_id = typeof body.job_id === "string" ? body.job_id.trim() : "";
    if (!job_id) return NextResponse.json({ error: "job_id required" }, { status: 400 });

    const result = await deleteJob(job_id);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
