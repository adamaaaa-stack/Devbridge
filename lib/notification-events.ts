/**
 * Create in-app notifications and send emails for key events.
 * Call from server actions / API after the main mutation succeeds.
 */

import { createNotification } from "@/lib/notifications";
import {
  sendWorkspaceInviteEmail,
  sendJobApplicationEmail,
  sendSubmissionReadyEmail,
} from "@/lib/email";
import { getEmailForUserId } from "@/lib/user-email";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function notifyWorkspaceInvite(workspaceId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { data: w } = await supabase
    .from("workspaces")
    .select("title, student_id")
    .eq("id", workspaceId)
    .single();
  if (!w) return;

  await createNotification({
    user_id: w.student_id,
    type: "workspace_invite",
    title: "Workspace invitation",
    message: `You've been invited to a project: ${w.title}`,
    link: `/workspace/${workspaceId}`,
  });

  const toEmail = await getEmailForUserId(w.student_id);
  if (toEmail) {
    const { data: student } = await supabase.from("profiles").select("display_name").eq("id", w.student_id).single();
    await sendWorkspaceInviteEmail({
      toEmail,
      studentName: student?.display_name ?? null,
      projectName: w.title,
      workspaceId,
    });
  }
}

export async function notifyJobApplication(jobId: string, companyId: string, jobTitle: string): Promise<void> {
  await createNotification({
    user_id: companyId,
    type: "job_application",
    title: "New job application",
    message: `A developer applied to "${jobTitle}"`,
    link: `/jobs/${jobId}`,
  });

  const toEmail = await getEmailForUserId(companyId);
  if (toEmail) {
    const supabase = await createServerSupabaseClient();
    const { data: p } = await supabase.from("profiles").select("display_name").eq("id", companyId).single();
    await sendJobApplicationEmail({
      toEmail,
      companyName: p?.display_name ?? null,
      jobTitle,
      jobId,
    });
  }
}

export async function notifyApplicationAccepted(developerId: string, workspaceId: string, projectTitle: string): Promise<void> {
  await createNotification({
    user_id: developerId,
    type: "workspace_invite",
    title: "Application accepted",
    message: `Your application was accepted. New workspace: ${projectTitle}`,
    link: `/workspace/${workspaceId}`,
  });
}

export async function notifySubmissionReady(workspaceId: string, companyId: string, projectName: string): Promise<void> {
  await createNotification({
    user_id: companyId,
    type: "submission_ready",
    title: "Submission ready for review",
    message: `A solution was submitted for ${projectName}`,
    link: `/workspace/${workspaceId}`,
  });

  const toEmail = await getEmailForUserId(companyId);
  if (toEmail) {
    const supabase = await createServerSupabaseClient();
    const { data: p } = await supabase.from("profiles").select("display_name").eq("id", companyId).single();
    await sendSubmissionReadyEmail({
      toEmail,
      companyName: p?.display_name ?? null,
      projectName,
      workspaceId,
    });
  }
}

export async function notifySubmissionReviewed(
  developerId: string,
  workspaceId: string,
  approved: boolean
): Promise<void> {
  await createNotification({
    user_id: developerId,
    type: "submission_reviewed",
    title: approved ? "Submission approved" : "Changes requested",
    message: approved
      ? "Your submission was approved. Payment may be required to unlock code."
      : "The company requested changes to your submission.",
    link: `/workspace/${workspaceId}`,
  });
}

export async function notifyTestResult(
  userId: string,
  taskTitle: string,
  passed: boolean,
  link: string
): Promise<void> {
  await createNotification({
    user_id: userId,
    type: "test_result",
    title: passed ? "Skill test passed" : "Skill test result",
    message: `${taskTitle}: ${passed ? "Passed" : "See feedback for improvements"}`,
    link,
  });
}
