/**
 * Anti-cheat: code hash for similarity, solve time flag.
 */

import { createHash } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/service";

const MIN_SOLVE_SECONDS = 30;

/** Normalize code for hashing: trim, collapse whitespace. */
export function normalizeCodeForHash(code: string): string {
  return code.replace(/\s+/g, " ").trim();
}

export function hashCode(code: string): string {
  const normalized = normalizeCodeForHash(code);
  return createHash("sha256").update(normalized).digest("hex");
}

/** Check if another submission for the same task has the same code hash. */
export async function hasDuplicateHash(
  taskId: string,
  codeHash: string,
  excludeSubmissionId?: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from("test_submissions")
    .select("id")
    .eq("task_id", taskId)
    .eq("code_hash", codeHash)
    .limit(1);
  if (excludeSubmissionId) {
    query = query.neq("id", excludeSubmissionId);
  }
  const { data } = await query.maybeSingle();
  return data != null;
}

export function isSuspiciousSolveTime(timeStarted: string | null, timeSubmitted: string): boolean {
  if (!timeStarted) return false;
  const start = new Date(timeStarted).getTime();
  const end = new Date(timeSubmitted).getTime();
  const sec = (end - start) / 1000;
  return sec < MIN_SOLVE_SECONDS && sec >= 0;
}
