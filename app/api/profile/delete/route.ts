import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

/**
 * POST /api/profile/delete
 * Deletes the current user's profile row only (auth account is kept).
 * User can go through onboarding again to create a new profile.
 */
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceRoleClient();
    const { error } = await service.from("profiles").delete().eq("id", user.id);
    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Failed to delete profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    );
  }
}
