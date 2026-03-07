/**
 * Preview deployment flow: trigger Vercel deploy, update submission record.
 */

import { createDeployment } from "@/lib/vercel/client";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type PreviewStatus = "not_started" | "building" | "ready" | "failed";

export async function createPreviewDeployment(
  submissionId: string,
  repoUrl: string
): Promise<
  | { deploymentId: string; previewUrl: string }
  | { error: string }
> {
  const supabase = createServiceRoleClient();

  const { data: sub } = await supabase
    .from("submissions")
    .select("id, developer_id, workspace_id, status, repo_url")
    .eq("id", submissionId)
    .single();

  if (!sub) return { error: "Submission not found" };
  if (!repoUrl?.trim()) return { error: "repo_url is required" };

  const name = `submission-${submissionId.slice(0, 8)}`;
  const result = await createDeployment({ name, repoUrl: repoUrl.trim() });

  if ("error" in result) {
    await supabase
      .from("submissions")
      .update({
        status: "preview_failed",
        preview_status: "failed",
        preview_error: result.error,
        preview_deployment_id: null,
        preview_url: null,
      })
      .eq("id", submissionId);
    return { error: result.error };
  }

  await supabase
    .from("submissions")
    .update({
      status: "preview_building",
      preview_status: "building",
      preview_deployment_id: result.deploymentId,
      preview_url: result.url,
      preview_error: null,
    })
    .eq("id", submissionId);

  if (result.readyState === "READY") {
    await supabase
      .from("submissions")
      .update({
        status: "preview_ready",
        preview_status: "ready",
      })
      .eq("id", submissionId);
  }

  return {
    deploymentId: result.deploymentId,
    previewUrl: result.url,
  };
}

/**
 * Update submission to preview_ready when deployment is ready (call from polling or webhook).
 */
export async function markPreviewReady(
  submissionId: string,
  previewUrl: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("submissions")
    .update({
      status: "preview_ready",
      preview_status: "ready",
      preview_url: previewUrl,
      preview_error: null,
    })
    .eq("id", submissionId);

  if (error) return { error: error.message };
  return { ok: true };
}

/**
 * Mark preview as failed with message.
 */
export async function markPreviewFailed(
  submissionId: string,
  errorMessage: string
): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase
    .from("submissions")
    .update({
      status: "preview_failed",
      preview_status: "failed",
      preview_error: errorMessage,
    })
    .eq("id", submissionId);
}
