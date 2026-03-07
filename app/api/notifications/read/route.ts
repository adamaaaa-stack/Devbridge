import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const notification_id = typeof body.notification_id === "string" ? body.notification_id.trim() : "";
    const mark_all = body.mark_all === true;

    if (mark_all) {
      const result = await markAllNotificationsRead(user.id);
      return result.error
        ? NextResponse.json({ error: result.error }, { status: 500 })
        : NextResponse.json({ ok: true });
    }

    if (!notification_id) {
      return NextResponse.json({ error: "notification_id or mark_all required" }, { status: 400 });
    }
    const result = await markNotificationRead(notification_id, user.id);
    return result.error
      ? NextResponse.json({ error: result.error }, { status: 500 })
      : NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
