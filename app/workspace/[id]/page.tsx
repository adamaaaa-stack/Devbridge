import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getWorkspaceById,
  getWorkspaceMessages,
  markWorkspaceMessagesRead,
  getWorkspaceReview,
} from "@/lib/workspaces";
import { getWorkspaceActivity } from "@/lib/workspace-activity";
import { getSubmissionsForWorkspace } from "@/lib/escrow/submissions";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceConfirmationCard } from "@/components/workspace/WorkspaceConfirmationCard";
import { WorkspaceTimeline } from "@/components/workspace/WorkspaceTimeline";
import { CompleteWorkspaceCard } from "@/components/workspace/CompleteWorkspaceCard";
import { LeaveReviewCard } from "@/components/workspace/LeaveReviewCard";
import { WorkspaceChatWindow } from "@/components/workspace/WorkspaceChatWindow";
import { WorkspaceMessageComposer } from "@/components/workspace/WorkspaceMessageComposer";
import { SubmitSolutionCard } from "@/components/escrow/SubmitSolutionCard";
import { SubmissionReviewCard } from "@/components/escrow/SubmissionReviewCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const workspaceId = params.id;

  const workspace = await getWorkspaceById(workspaceId, user.id);
  if (!workspace) {
    redirect("/messages");
  }

  const [messages, submissions, activity, existingReview] = await Promise.all([
    getWorkspaceMessages(workspaceId, user.id),
    getSubmissionsForWorkspace(workspaceId, user.id),
    getWorkspaceActivity(workspaceId, user.id),
    getWorkspaceReview(workspaceId),
  ]);

  await markWorkspaceMessagesRead(workspaceId, user.id);

  const isCompany = workspace.company_id === user.id;
  const otherParticipant =
    workspace.company_id === user.id ? workspace.student : workspace.company;

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project overview</CardTitle>
              <CardDescription>Scope and tech stack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {workspace.description}
              </p>
              {workspace.tech_stack?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {workspace.tech_stack.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <WorkspaceConfirmationCard
            workspace={workspace}
            currentUserId={user.id}
          />

          {workspace.status === "active" && isCompany && (
            <CompleteWorkspaceCard workspaceId={workspaceId} />
          )}
          {workspace.status === "active" && (
            isCompany ? (
              <SubmissionReviewCard
                workspaceId={workspaceId}
                submissions={submissions}
              />
            ) : (
              <SubmitSolutionCard
                workspaceId={workspaceId}
                submissions={submissions}
              />
            )
          )}

          {workspace.status === "completed" && isCompany && (
            <LeaveReviewCard
              workspaceId={workspaceId}
              existingReview={existingReview}
            />
          )}

          <WorkspaceTimeline events={activity} />
        </div>

        <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>Workspace chat</CardTitle>
            <CardDescription>Project-specific messages</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <div className="flex min-h-[320px] flex-col">
              <WorkspaceChatWindow
                workspaceId={workspaceId}
                currentUserId={user.id}
                initialMessages={messages}
                otherParticipant={otherParticipant}
              />
              <WorkspaceMessageComposer
                workspaceId={workspaceId}
                currentUserId={user.id}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
