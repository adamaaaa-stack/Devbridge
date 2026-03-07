import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, setUserBanned } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const forbidden = await requireAdmin(user.id);
    if (forbidden) return NextResponse.json({ error: forbidden.error }, { status: 403 });

    const body = await req.json();
    const user_id = typeof body.user_id === "string" ? body.user_id.trim() : "";
    const banned = Boolean(body.banned);
    if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

    const result = await setUserBanned(user_id, banned);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
