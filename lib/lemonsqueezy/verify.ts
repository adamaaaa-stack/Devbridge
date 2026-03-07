/**
 * Lemon Squeezy webhook signature verification.
 */

import { createHmac, timingSafeEqual } from "crypto";

function getWebhookSecret(): string {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret?.trim()) throw new Error("LEMON_SQUEEZY_WEBHOOK_SECRET is not set");
  return secret.trim();
}

/**
 * Verify the webhook signature from Lemon Squeezy.
 * They send the raw body and Signature header (HMAC SHA256 of body with webhook secret).
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  const secret = getWebhookSecret();
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
