import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createCheckout } from "@/lib/lemonsqueezy/client";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const submission_id = typeof body.submission_id === "string" ? body.submission_id.trim() : "";
    if (!submission_id) return NextResponse.json({ error: "submission_id is required" }, { status: 400 });

    const storeId = process.env.LEMON_SQUEEZY_STORE_ID?.trim();
    const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID?.trim();
    const appUrl = process.env.LEMON_SQUEEZY_APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (!storeId || !variantId) {
      return NextResponse.json({ error: "Payment configuration missing" }, { status: 500 });
    }

    const { data: sub } = await supabase
      .from("submissions")
      .select("id, workspace_id, developer_id, status")
      .eq("id", submission_id)
      .single();
    if (!sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    const { data: w } = await supabase
      .from("workspaces")
      .select("company_id")
      .eq("id", sub.workspace_id)
      .single();
    if (!w || w.company_id !== user.id) {
      return NextResponse.json({ error: "Only the company on this workspace can unlock code" }, { status: 403 });
    }

    if (sub.status !== "approved" && sub.status !== "payment_required") {
      return NextResponse.json(
        { error: "Submission must be approved before payment. Approve the submission first." },
        { status: 400 }
      );
    }

    const { data: escrow } = await supabase
      .from("escrow_records")
      .select("code_access_granted, payment_status")
      .eq("submission_id", submission_id)
      .single();
    if (escrow?.code_access_granted) {
      return NextResponse.json({ error: "Code is already unlocked" }, { status: 400 });
    }

    const redirectUrl = appUrl ? `${appUrl}/workspace/${sub.workspace_id}` : undefined;
    const result = await createCheckout({
      storeId,
      variantId,
      customData: {
        submission_id,
        workspace_id: sub.workspace_id,
        company_id: w.company_id,
        developer_id: sub.developer_id,
      },
      redirectUrl,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const { createServiceRoleClient } = await import("@/lib/supabase/service");
    const service = createServiceRoleClient();
    await service.from("submission_payments").upsert(
      {
        submission_id,
        workspace_id: sub.workspace_id,
        company_id: w.company_id,
        developer_id: sub.developer_id,
        lemonsqueezy_checkout_id: result.checkoutId,
        status: "pending",
      },
      { onConflict: "submission_id" }
    );

    return NextResponse.json({ checkout_url: result.checkoutUrl });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Checkout failed" }, { status: 500 });
  }
}
