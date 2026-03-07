import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/lemonsqueezy/verify";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { releaseCode } from "@/lib/escrow/submissions";

export async function POST(req: Request) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const signature = req.headers.get("x-signature") ?? null;
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    meta?: { event_name?: string; custom_data?: Record<string, string> };
    data?: { id?: string; attributes?: { status?: string } };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = payload.meta?.event_name;
  const customData = payload.meta?.custom_data;

  if (eventName !== "order_created" || !customData?.submission_id) {
    return NextResponse.json({ ok: true });
  }

  const orderId = payload.data?.id;
  const status = payload.data?.attributes?.status;
  if (status !== "paid" || !orderId) {
    return NextResponse.json({ ok: true });
  }

  const submissionId = customData.submission_id;
  const workspaceId = customData.workspace_id;
  const companyId = customData.company_id;
  const developerId = customData.developer_id;

  const service = createServiceRoleClient();

  const { data: escrow } = await service
    .from("escrow_records")
    .select("id, code_access_granted, payment_status")
    .eq("submission_id", submissionId)
    .single();

  if (!escrow) {
    return NextResponse.json({ error: "Escrow not found" }, { status: 400 });
  }
  if (escrow.code_access_granted) {
    const { data: pay } = await service.from("submission_payments").select("id").eq("submission_id", submissionId).maybeSingle();
    if (pay) {
      await service.from("submission_payments").update({
        lemonsqueezy_order_id: orderId,
        status: "paid",
        paid_at: new Date().toISOString(),
      }).eq("submission_id", submissionId);
    }
    return NextResponse.json({ ok: true });
  }

  const { data: existingPay } = await service.from("submission_payments").select("id, status").eq("submission_id", submissionId).maybeSingle();
  if (existingPay?.status === "paid") {
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();
  if (existingPay) {
    await service.from("submission_payments").update({
      lemonsqueezy_order_id: orderId,
      status: "paid",
      paid_at: now,
    }).eq("submission_id", submissionId);
  } else {
    await service.from("submission_payments").insert({
      submission_id: submissionId,
      workspace_id: workspaceId,
      company_id: companyId,
      developer_id: developerId,
      lemonsqueezy_order_id: orderId,
      status: "paid",
      paid_at: now,
    });
  }

  const releaseResult = await releaseCode(submissionId);
  if (releaseResult && "error" in releaseResult) {
    console.error("[lemonsqueezy webhook] releaseCode failed:", releaseResult.error);
    return NextResponse.json({ error: "Unlock failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
