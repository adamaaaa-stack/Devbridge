/**
 * Resolve user email from Supabase Auth (server-only, service role).
 */

import { createServiceRoleClient } from "@/lib/supabase/service";

export async function getEmailForUserId(userId: string): Promise<string | null> {
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase.auth.admin.getUserById(userId);
    return data?.user?.email ?? null;
  } catch {
    return null;
  }
}
