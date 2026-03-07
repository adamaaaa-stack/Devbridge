/**
 * Workspace context files in Supabase Storage.
 * Bucket "workspace-context-files" must exist (private). Path: {workspace_id}/{uuid}_{filename}
 */

import { createServiceRoleClient } from "@/lib/supabase/service";

const BUCKET = "workspace-context-files";

export async function uploadWorkspaceContextFile(
  workspaceId: string,
  file: Buffer | Blob,
  filename: string,
  contentType: string
): Promise<{ path: string } | { error: string }> {
  const service = createServiceRoleClient();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${workspaceId}/${crypto.randomUUID()}_${safeName}`;
  const { error } = await service.storage.from(BUCKET).upload(path, file, {
    contentType,
    upsert: false,
  });
  if (error) return { error: error.message };
  return { path };
}

export async function getWorkspaceContextFileSignedUrl(
  filePath: string,
  expirySeconds: number = 300
): Promise<{ url: string } | { error: string }> {
  const service = createServiceRoleClient();
  const { data, error } = await service.storage.from(BUCKET).createSignedUrl(filePath, expirySeconds);
  if (error || !data?.signedUrl) return { error: error?.message ?? "Failed to create URL" };
  return { url: data.signedUrl };
}
