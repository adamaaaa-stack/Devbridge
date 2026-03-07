/**
 * Code escrow storage: upload source ZIP to private bucket.
 * Bucket "code_submissions" must exist in Supabase Storage (private).
 * Path: {workspace_id}/{submission_id}/source.zip
 */

import { createServiceRoleClient } from "@/lib/supabase/service";

const CODE_BUCKET = "code_submissions";

export async function uploadSubmissionCode(
  workspaceId: string,
  submissionId: string,
  file: Buffer | Blob,
  contentType: string = "application/zip"
): Promise<{ path: string } | { error: string }> {
  const service = createServiceRoleClient();
  const path = `${workspaceId}/${submissionId}/source.zip`;

  const { error } = await service.storage
    .from(CODE_BUCKET)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) return { error: error.message };
  return { path };
}
