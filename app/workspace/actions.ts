"use server";

import { revalidatePath } from "next/cache";
import {
  createWorkspaceFromConversation,
  sendWorkspaceForConfirmation,
  studentAcceptWorkspace,
  studentRequestWorkspaceChanges,
  completeWorkspace,
  leaveWorkspaceReview,
} from "@/lib/workspaces";
import { notifyWorkspaceInvite } from "@/lib/notification-events";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function createWorkspaceAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const conversation_id = (formData.get("conversation_id") as string)?.trim();
  const student_id = (formData.get("student_id") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const techStackStr = (formData.get("tech_stack") as string)?.trim();
  const total_budget = parseInt(formData.get("total_budget") as string, 10);
  const start_date = (formData.get("start_date") as string)?.trim() || null;
  const end_date = (formData.get("end_date") as string)?.trim() || null;

  if (!conversation_id || !student_id || !title || !description) {
    return { error: "Title and description are required" };
  }
  if (isNaN(total_budget) || total_budget <= 0) {
    return { error: "Total budget must be a positive number" };
  }
  if (start_date && end_date && end_date < start_date) {
    return { error: "End date cannot be before start date" };
  }

  const tech_stack = techStackStr ? techStackStr.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean) : [];

  const result = await createWorkspaceFromConversation({
    conversation_id,
    company_id: user.id,
    student_id,
    title,
    description,
    tech_stack,
    total_budget,
    start_date,
    end_date,
  });

  if ("error" in result) return result;
  revalidatePath("/messages");
  revalidatePath(`/workspace/${result.workspace.id}`);
  return { workspaceId: result.workspace.id };
}

export async function sendForConfirmationAction(workspaceId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const result = await sendWorkspaceForConfirmation(workspaceId, user.id);
  if (result.error) return result;
  await notifyWorkspaceInvite(workspaceId);
  revalidatePath(`/workspace/${workspaceId}`);
  return {};
}

export async function studentAcceptAction(workspaceId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const result = await studentAcceptWorkspace(workspaceId, user.id);
  if (result.error) return result;
  revalidatePath(`/workspace/${workspaceId}`);
  return {};
}

export async function studentRequestChangesAction(workspaceId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const result = await studentRequestWorkspaceChanges(workspaceId, user.id);
  if (result.error) return result;
  revalidatePath(`/workspace/${workspaceId}`);
  return {};
}

export async function completeWorkspaceAction(workspaceId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const result = await completeWorkspace(workspaceId, user.id);
  if (result.error) return result;
  revalidatePath(`/workspace/${workspaceId}`);
  return {};
}

export async function leaveReviewAction(
  workspaceId: string,
  rating: number,
  reviewText: string | null
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const result = await leaveWorkspaceReview(workspaceId, user.id, {
    rating,
    review_text: reviewText ?? undefined,
  });
  if (result.error) return result;
  revalidatePath(`/workspace/${workspaceId}`);
  revalidatePath("/developers");
  return {};
}

