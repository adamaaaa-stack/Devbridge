/**
 * Code escrow: submission CRUD, review, payment stub, and code release.
 * Payment is stubbed; architected for a real provider later.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { SubmissionStatus } from "@/lib/types";

const CODE_BUCKET = "code_submissions";

/** Create submission (developer). Status = 'submitted'. */
export async function createSubmission(
  userId: string,
  input: {
    workspace_id: string;
    repo_url?: string | null;
    preview_url?: string | null;
    description?: string | null;
  }
): Promise<{ submission: { id: string; status: string } } | { error: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return { error: "Unauthorized" };

  const { data: w } = await supabase
    .from("workspaces")
    .select("id, student_id")
    .eq("id", input.workspace_id)
    .single();
  if (!w || w.student_id !== user.id) return { error: "Only the workspace developer can submit" };

  const { data: sub, error } = await supabase
    .from("submissions")
    .insert({
      workspace_id: input.workspace_id,
      developer_id: user.id,
      repo_url: input.repo_url?.trim() || null,
      preview_url: input.preview_url?.trim() || null,
      description: input.description?.trim() || null,
      status: "submitted",
    })
    .select("id, status")
    .single();

  if (error) return { error: error.message };
  if (!sub) return { error: "Failed to create submission" };
  return { submission: { id: sub.id, status: sub.status } };
}

/** Company reviews: approve (create escrow, status approved → payment_required) or reject (under_review). */
export async function reviewSubmission(
  userId: string,
  input: {
    submission_id: string;
    approved: boolean;
    review_notes?: string | null;
  }
): Promise<{ submission: { id: string; status: string } } | { error: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return { error: "Unauthorized" };

  const { data: sub } = await supabase
    .from("submissions")
    .select("id, workspace_id, status")
    .eq("id", input.submission_id)
    .single();
  if (!sub) return { error: "Submission not found" };

  const { data: w } = await supabase
    .from("workspaces")
    .select("company_id")
    .eq("id", sub.workspace_id)
    .single();
  if (!w || w.company_id !== user.id) return { error: "Only the company can review" };

  if (sub.status !== "submitted" && sub.status !== "preview_ready" && sub.status !== "under_review") {
    return { error: "Submission is not in a reviewable state" };
  }

  const service = createServiceRoleClient();

  const { error: reviewError } = await supabase.from("submission_reviews").insert({
    submission_id: input.submission_id,
    company_id: user.id,
    approved: input.approved,
    review_notes: input.review_notes?.trim() || null,
  });
  if (reviewError) return { error: reviewError.message };

  if (input.approved) {
    const newStatus: SubmissionStatus = "approved";
    await service.from("submissions").update({ status: newStatus }).eq("id", input.submission_id);
    await service.from("escrow_records").upsert(
      {
        submission_id: input.submission_id,
        payment_status: "pending",
        code_access_granted: false,
      },
      { onConflict: "submission_id" }
    );
    return { submission: { id: sub.id, status: newStatus } };
  }

  await service.from("submissions").update({ status: "under_review" }).eq("id", input.submission_id);
  return { submission: { id: sub.id, status: "under_review" } };
}

/**
 * Stub payment: simulate success, set escrow to 'paid', then release code.
 * Replace with real payment provider later.
 */
export async function processSubmissionPayment(
  submissionId: string,
  _companyUserId: string
): Promise<{ success: true; paymentId: string } | { error: string }> {
  const service = createServiceRoleClient();

  const { data: escrow } = await service
    .from("escrow_records")
    .select("id, payment_status")
    .eq("submission_id", submissionId)
    .single();

  if (!escrow) return { error: "Escrow record not found" };
  if (escrow.payment_status === "paid" || escrow.payment_status === "released") {
    return { success: true, paymentId: `stub_payment_${submissionId}` };
  }

  await service
    .from("escrow_records")
    .update({ payment_status: "paid" })
    .eq("submission_id", submissionId);

  const releaseResult = await releaseCode(submissionId);
  if (releaseResult && "error" in releaseResult) {
    return { error: releaseResult.error };
  }

  return { success: true, paymentId: `stub_payment_${submissionId}` };
}

/**
 * Release code: require escrow paid, set code_access_granted and released_at, set submission to 'delivered'.
 */
export async function releaseCode(
  submissionId: string
): Promise<{ released: true } | { error: string }> {
  const service = createServiceRoleClient();

  const { data: escrow } = await service
    .from("escrow_records")
    .select("id, payment_status, code_access_granted")
    .eq("submission_id", submissionId)
    .single();

  if (!escrow) return { error: "Escrow record not found" };
  if (escrow.payment_status !== "paid") {
    return { error: "Code can only be released after payment is completed" };
  }
  if (escrow.code_access_granted) {
    return { released: true };
  }

  const now = new Date().toISOString();
  await service
    .from("escrow_records")
    .update({
      code_access_granted: true,
      released_at: now,
      payment_status: "released",
    })
    .eq("submission_id", submissionId);

  await service
    .from("submissions")
    .update({ status: "delivered" })
    .eq("id", submissionId);

  return { released: true };
}

/**
 * Generate a signed download URL for the submission source.
 * Only if escrow_records.code_access_granted = true. Server-side only.
 */
export async function getDownloadUrl(
  submissionId: string,
  requestorUserId: string
): Promise<{ url: string } | { error: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== requestorUserId) return { error: "Unauthorized" };

  const { data: sub } = await supabase
    .from("submissions")
    .select("id, workspace_id, code_storage_path")
    .eq("id", submissionId)
    .single();
  if (!sub || !sub.code_storage_path) return { error: "Submission or code path not found" };

  const { data: w } = await supabase
    .from("workspaces")
    .select("company_id, student_id")
    .eq("id", sub.workspace_id)
    .single();
  if (!w) return { error: "Workspace not found" };
  if (w.company_id !== user.id && w.student_id !== user.id) {
    return { error: "Not a participant of this workspace" };
  }

  const service = createServiceRoleClient();
  const { data: escrow } = await service
    .from("escrow_records")
    .select("code_access_granted")
    .eq("submission_id", submissionId)
    .single();

  if (!escrow || !escrow.code_access_granted) {
    return { error: "Code locked until payment is completed" };
  }

  const { data: signed } = await service.storage
    .from(CODE_BUCKET)
    .createSignedUrl(sub.code_storage_path, 3600);

  if (signed?.signedUrl) return { url: signed.signedUrl };
  return { error: "Failed to generate download URL" };
}

/** Get submissions for a workspace (for UI). */
export async function getSubmissionsForWorkspace(
  workspaceId: string,
  userId: string
): Promise<
  Array<{
    id: string;
    status: string;
    repo_url: string | null;
    preview_url: string | null;
    description: string | null;
    code_storage_path: string | null;
    created_at: string;
    escrow?: { payment_status: string; code_access_granted: boolean } | null;
  }>
> {
  const supabase = await createServerSupabaseClient();
  const { data: w } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .or(`company_id.eq.${userId},student_id.eq.${userId}`)
    .single();
  if (!w) return [];

  const { data: rows } = await supabase
    .from("submissions")
    .select("id, status, repo_url, preview_url, description, code_storage_path, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (!rows?.length) return [];

  const submissionIds = rows.map((r) => r.id);
  const { data: escrows } = await supabase
    .from("escrow_records")
    .select("submission_id, payment_status, code_access_granted")
    .in("submission_id", submissionIds);

  const escrowBySub = new Map(
    (escrows ?? []).map((e: { submission_id: string; payment_status: string; code_access_granted: boolean }) => [
      e.submission_id,
      { payment_status: e.payment_status, code_access_granted: e.code_access_granted },
    ])
  );

  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    repo_url: r.repo_url ?? null,
    preview_url: r.preview_url ?? null,
    description: r.description ?? null,
    code_storage_path: r.code_storage_path ?? null,
    created_at: r.created_at,
    escrow: escrowBySub.get(r.id) ?? null,
  }));
}

/** Update submission with code_storage_path after upload. */
export async function setSubmissionCodePath(
  submissionId: string,
  developerUserId: string,
  storagePath: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== developerUserId) return { error: "Unauthorized" };

  const { data: sub } = await supabase
    .from("submissions")
    .select("id, developer_id")
    .eq("id", submissionId)
    .single();
  if (!sub || sub.developer_id !== user.id) return { error: "Not your submission" };

  const { error } = await supabase
    .from("submissions")
    .update({ code_storage_path: storagePath })
    .eq("id", submissionId);
  if (error) return { error: error.message };
  return { ok: true };
}
