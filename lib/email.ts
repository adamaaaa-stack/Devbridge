/**
 * Email delivery via Resend.
 * Uses RESEND_API_KEY. From address should be a verified domain in Resend.
 */

const RESEND_API = "https://api.resend.com/emails";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Codeveria <onboarding@resend.dev>";

function getApiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key?.trim()) throw new Error("RESEND_API_KEY is not set");
  return key.trim();
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: true } | { error: string }> {
  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { error: err || `Resend ${res.status}` };
    }
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Send email failed" };
  }
}

function baseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function ctaButton(label: string, url: string): string {
  return `
    <p style="margin: 24px 0;">
      <a href="${url}" style="background: #18181b; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
        ${label}
      </a>
    </p>
  `;
}

export async function sendWorkspaceInviteEmail(params: {
  toEmail: string;
  studentName: string | null;
  projectName: string;
  workspaceId: string;
}): Promise<{ success: true } | { error: string }> {
  const url = `${baseUrl()}/workspace/${params.workspaceId}`;
  const html = `
    <h2>Workspace invitation</h2>
    <p>Hi ${params.studentName ?? "there"},</p>
    <p>You've been invited to a project workspace: <strong>${params.projectName}</strong>.</p>
    <p>Review the scope and accept or request changes.</p>
    ${ctaButton("View workspace", url)}
    <p style="color: #71717a; font-size: 14px;">Codeveria</p>
  `;
  return sendEmail({
    to: params.toEmail,
    subject: `Invitation: ${params.projectName}`,
    html,
  });
}

export async function sendJobApplicationEmail(params: {
  toEmail: string;
  companyName: string | null;
  jobTitle: string;
  jobId: string;
}): Promise<{ success: true } | { error: string }> {
  const url = `${baseUrl()}/jobs/${params.jobId}`;
  const html = `
    <h2>New job application</h2>
    <p>Hi ${params.companyName ?? "there"},</p>
    <p>A developer has applied to your job: <strong>${params.jobTitle}</strong>.</p>
    ${ctaButton("View applications", url)}
    <p style="color: #71717a; font-size: 14px;">Codeveria</p>
  `;
  return sendEmail({
    to: params.toEmail,
    subject: `New application: ${params.jobTitle}`,
    html,
  });
}

export async function sendSubmissionReadyEmail(params: {
  toEmail: string;
  companyName: string | null;
  projectName: string;
  workspaceId: string;
}): Promise<{ success: true } | { error: string }> {
  const url = `${baseUrl()}/workspace/${params.workspaceId}`;
  const html = `
    <h2>Submission ready for review</h2>
    <p>Hi ${params.companyName ?? "there"},</p>
    <p>A solution has been submitted for <strong>${params.projectName}</strong>.</p>
    ${ctaButton("Review submission", url)}
    <p style="color: #71717a; font-size: 14px;">Codeveria</p>
  `;
  return sendEmail({
    to: params.toEmail,
    subject: `Submission ready: ${params.projectName}`,
    html,
  });
}

export async function sendMessageNotificationEmail(params: {
  toEmail: string;
  recipientName: string | null;
  senderName: string | null;
  preview: string;
  conversationId: string;
}): Promise<{ success: true } | { error: string }> {
  const url = `${baseUrl()}/messages/${params.conversationId}`;
  const preview = params.preview.length > 100 ? params.preview.slice(0, 97) + "..." : params.preview;
  const html = `
    <h2>New message</h2>
    <p>Hi ${params.recipientName ?? "there"},</p>
    <p><strong>${params.senderName ?? "Someone"}</strong> sent you a message:</p>
    <p style="background: #f4f4f5; padding: 12px; border-radius: 8px;">${preview}</p>
    ${ctaButton("View conversation", url)}
    <p style="color: #71717a; font-size: 14px;">Codeveria</p>
  `;
  return sendEmail({
    to: params.toEmail,
    subject: `New message from ${params.senderName ?? "a user"}`,
    html,
  });
}
