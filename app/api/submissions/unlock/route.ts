import { NextResponse } from "next/server";

/**
 * POST /api/submissions/unlock
 * Deprecated: code unlock is done via Lemon Squeezy checkout.
 * Use "Unlock code" button which calls POST /api/code-escrow/create-checkout.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Use the Unlock code button to pay via Lemon Squeezy checkout." },
    { status: 400 }
  );
}
