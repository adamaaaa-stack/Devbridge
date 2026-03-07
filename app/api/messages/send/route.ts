import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import { sendMessageNotificationEmail } from "@/lib/email";
import { getEmailForUserId } from "@/lib/user-email";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const conversation_id = typeof body.conversation_id === "string" ? body.conversation_id.trim() : "";
    const message_body = typeof body.body === "string" ? body.body.trim() : "";
    if (!conversation_id || !message_body) {
      return NextResponse.json({ error: "conversation_id and body are required" }, { status: 400 });
    }

    const { data: conv } = await supabase
      .from("conversations")
      .select("id, company_id, student_id")
      .eq("id", conversation_id)
      .or(`company_id.eq.${user.id},student_id.eq.${user.id}`)
      .single();
    if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    const { data: msg, error: insertError } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        sender_id: user.id,
        body: message_body,
      })
      .select("id, created_at")
      .single();
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    const recipientId = conv.company_id === user.id ? conv.student_id : conv.company_id;
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    const senderName = senderProfile?.display_name ?? "Someone";

    await createNotification({
      user_id: recipientId,
      type: "new_message",
      title: "New message",
      message: `${senderName}: ${message_body.slice(0, 80)}${message_body.length > 80 ? "…" : ""}`,
      link: `/messages/${conversation_id}`,
    });

    const toEmail = await getEmailForUserId(recipientId);
    if (toEmail) {
      const { data: recipientProfile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", recipientId)
        .single();
      await sendMessageNotificationEmail({
        toEmail,
        recipientName: recipientProfile?.display_name ?? null,
        senderName,
        preview: message_body,
        conversationId: conversation_id,
      });
    }

    return NextResponse.json({ id: msg.id, created_at: msg.created_at });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Send failed" },
      { status: 500 }
    );
  }
}
